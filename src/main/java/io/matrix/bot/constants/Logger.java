package io.matrix.bot.constants;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.model.LogData;
import io.matrix.bot.constants.model.LogLevel;
import io.matrix.bot.constants.model.LoggerConfig;

import java.io.IOException;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
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

    private final ExecutorService asyncThreadPool = Executors.newCachedThreadPool();

    private final Function<String, Void> persistLogFunction;
    private final String host;
    private final String source;

    public Logger(final Function<String, Void> persistLogFunction, final String host, final String source) {
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

    private void baseWriter(final Object message, final int levelCode) {
        final var localDateTime = LocalDateTime.now();
        final var timeStr = formatTime(localDateTime);
        asyncThreadPool.submit(() -> {
            try {
                final LogLevel logLevel = loggerConfig.getLevels().get(String.valueOf(levelCode));
                final var outputType = getOutputType(logLevel);
                final var messageStr = getMessageAndStackTraceAsString(message, outputType.isPrintStackTrace());
                final var logString = formatLogLine(getFormat(logLevel), timeStr, messageStr);
                outputType.getOutput().println(logString);
                final var logData = LogData.builder()
                        .timestamp(localDateTime.toInstant(ZoneOffset.UTC).toEpochMilli())
                        .message(getMessage(message))
                        .level(levelCode)
                        .stack(getStack(message, outputType.isPrintStackTrace()))
                        .host(host)
                        .source(source)
                        .code(getCode(message))
                        .build();
                persistLogFunction.apply(objectMapper.writeValueAsString(logData));
            } catch (final Exception e) {
                printErr(timeStr, "Exception handling log message", getErrLogFormat(), e);
            }
        });
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

    public void close() {
        asyncThreadPool.shutdown();
        try {
            //noinspection ResultOfMethodCallIgnored
            asyncThreadPool.awaitTermination(30, TimeUnit.SECONDS);
        } catch (final Exception e) {
            printErr(formatTime(LocalDateTime.now()), "Exception when closing Logger", getErrLogFormat(), e);
        }
    }

}
