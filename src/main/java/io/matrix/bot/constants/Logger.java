package io.matrix.bot.constants;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.model.LogData;
import io.matrix.bot.constants.model.LogLevel;
import io.matrix.bot.constants.model.LoggerConfig;
import io.matrix.bot.constants.model.OutputType;
import lombok.AllArgsConstructor;
import lombok.SneakyThrows;

import java.io.IOException;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

import static io.matrix.bot.constants.Util.formatStackTraceString;
import static io.matrix.bot.constants.accessor.LogLevelAccessor.*;
import static io.matrix.bot.constants.accessor.MessageAccessor.*;

public class Logger {

    public static final String LOG_LEVELS_JSON_URL = "https://raw.githubusercontent.com/matrixbotio/constants/master/logger/logger.json";
    private static final String TIME_PLACEHOLDER = "%datetime%";
    private static final String MESSAGE_PLACEHOLDER = "%message%";
    private static final String DEFAULT_ERROR_LOG_LEVEL = "error";

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final ExecutorService asyncThreadPool = Executors.newCachedThreadPool();
    private static final AtomicBoolean close = new AtomicBoolean(false);
    private static final AtomicInteger numberOfActiveAsyncThreads = new AtomicInteger(0);

    private static LoggerConfig loggerConfig;
    static {
        try {
            loggerConfig = objectMapper.readValue(new URL(LOG_LEVELS_JSON_URL), new TypeReference<>() {});
        } catch (final IOException e) {
            printErr(LocalDateTime.now().toString(), "Exception fetching Errors configuration JSON", getErrLogFormat(), e);
        }
    }

    private static DateTimeFormatter dateTimeFormat;
    static {
        try {
            dateTimeFormat = DateTimeFormatter.ofPattern(loggerConfig.getDatetimeFormat());
        } catch (final Exception e) {
            printErr(LocalDateTime.now().toString(), "Exception creating date time format pattern", getErrLogFormat(), e);
        }
    }

    // Used queue single-thread handler to print logs sequentially
    private static final ArrayBlockingQueue<LogParams> queue = new ArrayBlockingQueue<>(100000);

    private final Function<String, Void> persistLogFunction;
    private final String host;
    private final String source;

    private Logger(final Function<String, Void> persistLogFunction, final String host, final String source) {
        this.persistLogFunction = persistLogFunction;
        this.host = host;
        this.source = source;
    }

    public static Logger newLogger(final Function<String, Void> persistLogFunction, final String host, final String source) {
        return new Logger(persistLogFunction, host, source);
    }

    public void verbose(final Object message) {
        baseWriter(message, 1);
    }

    public void log(final Object message) {
        baseWriter(message, 2);
    }

    public void warn(final Object message) {
        baseWriter(message, 3);
    }

    public void error(final Object message) {
        baseWriter(message, 4);
    }

    public void critical(final Object message) {
        baseWriter(message, 5);
    }

    @SneakyThrows
    private void baseWriter(final Object message, final int level) {
        final var logParams = new LogParams(LocalDateTime.now(), level, message, persistLogFunction, host, source);
        try {
            queue.add(logParams);
        } catch (final IllegalStateException e) {
            printErr(formatTime(LocalDateTime.now()), "Exception adding log message to the queue in log baseWriter",
                    getErrLogFormat(), e);
        }
    }

    static {
        asyncThreadPool.submit(() -> {
            while(!close.get()) {
                handleNextQueueRecord();
            }
        });
    }

    private static void handleNextQueueRecord() {
        try {
            final LogParams params = queue.poll(1, TimeUnit.SECONDS);
            if (params == null) {
                return;
            }
            final var timeStr = formatTime(params.dateTime);
            final var logLevelConfig = loggerConfig.getLevels().get(String.valueOf(params.level));
            final var outputType = getOutputType(logLevelConfig);
            final var messageStr = getMessageAndStackTraceAsString(params.message, outputType.isPrintStackTrace());
            final var formattedLogStr = formatLogLine(getFormat(logLevelConfig), timeStr, messageStr);
            outputType.getOutput().println(formattedLogStr);
            // multi-thread handling persisting log for higher throughput
            asyncThreadPool.submit(() -> persistLogMessage(params, outputType, timeStr));
        } catch (final Exception e) {
            printErr(formatTime(LocalDateTime.now()), "Exception processing log queue", getErrLogFormat(), e);
        }
    }

    private static void persistLogMessage(final LogParams params, final OutputType outputType, final String timeStr) {
        try {
            numberOfActiveAsyncThreads.incrementAndGet();
            final var logData = new LogData(params.dateTime, getMessage(params.message), params.level,
                    getStack(params.message, outputType.isPrintStackTrace()), params.host, params.source, getCode(params.message));
            params.persistingFunction.apply(objectMapper.writeValueAsString(logData));
        } catch (final Exception e) {
            printErr(timeStr, "Exception handling log message", getErrLogFormat(), e);
        } finally {
            numberOfActiveAsyncThreads.decrementAndGet();
        }
    }

    private static String formatTime(final LocalDateTime dateTime) {
        try {
            return dateTime.format(dateTimeFormat);
        } catch (final Exception e) {
            printErr(LocalDateTime.now().toString(), "Exception formatting time", getErrLogFormat(), e);
            return dateTime.toString();
        }
    }

    private static void printErr(final String time, final String format, final Exception e) {
        printErr(time, "", format, e);
    }

    private static void printErr(final String time, final String errMsg, final String format, final Exception e) {
        final String msgAndStack = errMsg + "\n" + (e.getMessage() == null ? e.toString() : e.getMessage()) + "\n"
                + formatStackTraceString(e.getStackTrace());
        final var logLine = formatLogLine(format, time, msgAndStack);
        System.err.println(logLine);
    }

    private static String getErrLogFormat() {
        final var levels = loggerConfig.getLevels();
        if (levels == null || levels.size() == 0) {
            printErr(formatTime(LocalDateTime.now()), getErrLogFormat(),
                    new RuntimeException("Exception getting error log format: log levels cannot be null or empty"));
            return DEFAULT_ERROR_LOG_LEVEL;
        }
        final var logLevel = levels.lowerKey(levels.lastKey()) == null ? levels.get(levels.lastKey())
                : levels.lowerEntry(levels.lastKey()).getValue();
        final String format;
        if (logLevel.getStderrFormat() != null && !logLevel.getStderrFormat().trim().isEmpty()) {
            format = logLevel.getStderrFormat();
        } else if (logLevel.getStdoutFormat() != null && !logLevel.getStdoutFormat().trim().isEmpty()) {
            format = logLevel.getStdoutFormat();
        } else {
            printErr(formatTime(LocalDateTime.now()), getErrLogFormat(),
                    new RuntimeException("Exception getting error log format: log level must contain either stdout either stderr format"));
            return DEFAULT_ERROR_LOG_LEVEL;
        }
        return format;
    }

    private static String formatLogLine(String format, final String time, final String message) {
        if (!format.contains(TIME_PLACEHOLDER)) {
            format = TIME_PLACEHOLDER + ": " + format;
        }
        if (!format.contains(MESSAGE_PLACEHOLDER)) {
            format = format + " " + MESSAGE_PLACEHOLDER;
        }
        return format
                .replace(TIME_PLACEHOLDER, time)
                .replace(MESSAGE_PLACEHOLDER, message);
    }

    @SneakyThrows
    void waitAllThreads() {
        while (numberOfActiveAsyncThreads.get() > 0) {
            //noinspection BusyWait
            Thread.sleep(1000);
        }
    }

    public void close() {
        close.set(true);
        asyncThreadPool.shutdown();
        try {
            //noinspection ResultOfMethodCallIgnored
            asyncThreadPool.awaitTermination(30, TimeUnit.SECONDS);
        } catch (final Exception e) {
            printErr(formatTime(LocalDateTime.now()), "Exception when closing Logger", getErrLogFormat(), e);
        }
    }

    @AllArgsConstructor
    private static class LogParams {
        private final LocalDateTime dateTime;
        private final int level;
        private final Object message;
        private final Function<String, Void> persistingFunction;
        public final String host;
        public final String source;
    }

}
