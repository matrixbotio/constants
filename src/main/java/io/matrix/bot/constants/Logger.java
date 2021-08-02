package io.matrix.bot.constants;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.accessor.LogLevelAccessor;
import io.matrix.bot.constants.model.Error;
import io.matrix.bot.constants.model.LogData;
import io.matrix.bot.constants.model.LoggerConfig;
import io.matrix.bot.constants.model.MatrixException;
import io.matrix.bot.constants.model.OutputType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.SneakyThrows;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

import static io.matrix.bot.constants.Errors.getError;
import static io.matrix.bot.constants.Util.formatStackTraceString;
import static io.matrix.bot.constants.accessor.LogLevelAccessor.*;
import static io.matrix.bot.constants.accessor.MessageAccessor.*;

@Getter
@Setter
public class Logger {

	public static final String LOG_LEVELS_JSON_URL = "https://raw.githubusercontent.com/matrixbotio/constants/master/logger/logger.json";
	private static final String TIME_PLACEHOLDER = "%datetime%";
	private static final String MESSAGE_PLACEHOLDER = "%message%";
	private static final String ERROR_LOG_LEVEL_KEY = "4";

	private static final ObjectMapper objectMapper = new ObjectMapper();
	private static final ExecutorService asyncThreadPool = Executors.newCachedThreadPool();
	private static final AtomicBoolean close = new AtomicBoolean(false);
	private static final AtomicInteger numberOfActiveAsyncThreads = new AtomicInteger(0);

	private static LoggerConfig loggerConfig;
	static {
		try {
			loggerConfig = objectMapper.readValue(new URL(LOG_LEVELS_JSON_URL), new TypeReference<>() {});
			verifyLoggerConfig(loggerConfig);
		} catch (final Exception e) {
			printErr(LocalDateTime.now().toString(), "Exception fetching Errors configuration JSON", e);
		}
	}

	private static DateTimeFormatter dateTimeFormat;
	static {
		try {
			dateTimeFormat = DateTimeFormatter.ofPattern(loggerConfig.getDatetimeFormat());
		} catch (final Exception e) {
			printErr(LocalDateTime.now().toString(), "Exception creating date time format pattern", e);
		}
	}

	// Used queue single-thread handler to print logs sequentially
	private static final ArrayBlockingQueue<LogParams> queue = new ArrayBlockingQueue<>(100000);

	private Function<String, Void> persistLogFunction;
	private String host;
	private String source;
	private int logLevel = 2;

	private Logger() {

	}

	private Logger(final Function<String, Void> persistLogFunction, final String host, final String source) {
		this.persistLogFunction = persistLogFunction;
		this.host = host;
		this.source = source;
	}

	public static Logger newLogger() {
		return new Logger();
	}

	public static Logger newLogger(final Function<String, Void> persistLogFunction, final String host, final String source) {
		return new Logger(persistLogFunction, host, source);
	}

	// Very detailed logs
	public void verbose(String message) {
		baseWriter(message, 1);
	}

	public void verbose(MatrixException exception) {
		var error = getError(exception);
		baseWriter(error, 1);
	}

	// Important logs
	public void log(String message) {
		baseWriter(message, 2);
	}

	public void log(MatrixException exception) {
		var error = getError(exception);
		baseWriter(error, 2);
	}

	// Something may go wrong
	public void warn(String message) {
		baseWriter(message, 3);
	}

	public void warn(MatrixException exception) {
		var error = getError(exception);
		baseWriter(error, 3);
	}

	// Failed to do something. This may cause problems!
	public void error(String message) {
		baseWriter(message, 4);
	}

	public void error(MatrixException exception) {
		var error = getError(exception);
		baseWriter(error, 4);
	}

	// Critical error. Node's shutted down!
	public void critical(String message) {
		baseWriter(message, 5);
	}

	public void critical(MatrixException exception) {
		var error = getError(exception);
		baseWriter(error, 5);
	}

	public void baseWriter(final Object message, final int level) {
		baseWriter(message, level, true);
	}

	@SneakyThrows
	public void baseWriter(final Object message, final int level, boolean persistLog) {
		if (level < this.logLevel) {
			return;
		}
		var persistLogFunction = persistLog ? this.persistLogFunction : null;
		final var logParams = new LogParams(LocalDateTime.now(), level, message, persistLogFunction, host, source);
		try {
			queue.add(logParams);
		} catch (final Exception e) {
			printErr(LocalDateTime.now().format(dateTimeFormat), "Exception adding log message to the queue in log baseWriter",
					e);
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
			final var timeStr = params.dateTime.format(dateTimeFormat);
			final var logLevelConfig = loggerConfig.getLevels().get(String.valueOf(params.level));
			final var outputType = getOutputType(logLevelConfig);
			final var messageStr = getMessageAndStackTraceAsString(params.message);
			final var formattedLogStr = formatLogLine(getFormat(logLevelConfig), timeStr, messageStr);
			outputType.getOutput().println(formattedLogStr);
			// multi-thread handler of persisting log for higher throughput
			asyncThreadPool.submit(() -> persistLogMessage(params, outputType, timeStr));
		} catch (final Exception e) {
			printErr(LocalDateTime.now().format(dateTimeFormat), "Exception processing log queue", e);
		}
	}

	private static void persistLogMessage(final LogParams params, final OutputType outputType, final String timeStr) {
		try {
			numberOfActiveAsyncThreads.incrementAndGet();
			if (params.persistingFunction != null) {
				final var logData = new LogData(params.dateTime, getMessage(params.message), params.level,
						getStack(params.message), params.host, params.source, getCode(params.message));
				params.persistingFunction.apply(objectMapper.writeValueAsString(logData));
			}
		} catch (final Exception e) {
			printErr(timeStr, "Exception handling log message", e);
		} finally {
			numberOfActiveAsyncThreads.decrementAndGet();
		}
	}

	private static void printErr(final String time, final String errMsg, final Exception e) {
		final String msgAndStack = errMsg + "\n" + (e.getMessage() == null ? e.toString() : e.getMessage()) + "\n"
				+ formatStackTraceString(e.getStackTrace());
		final var logLine = formatLogLine(getErrLogFormat(), time, msgAndStack);
		System.err.println(logLine);
	}

	private static String getErrLogFormat() {
		final var logLevel = loggerConfig.getLevels().get(ERROR_LOG_LEVEL_KEY);
		return LogLevelAccessor.getFormat(logLevel);
	}

	private static String formatLogLine(String format, final String time, final String message) {
		return format
				.replace(TIME_PLACEHOLDER, time)
				.replace(MESSAGE_PLACEHOLDER, message);
	}

	private static void verifyLoggerConfig(final LoggerConfig loggerConfig) {
		if (loggerConfig.getDatetimeFormat() == null) {
			throw new RuntimeException("loggerConfig.dateTimeFormat cannot be null");
		}
		if (loggerConfig.getLevels() == null) {
			throw new RuntimeException("loggerConfig.levels cannot be null");
		}
		for (int i=1; i<=5; ++i) {
			final var logLevel = loggerConfig.getLevels().get(String.valueOf(i));
			if (logLevel == null) {
				throw new RuntimeException("loggerConfig.level should contain log level with key " + i);
			}
			final var name = logLevel.getName();
			if (logLevel.getName() == null || logLevel.getName().isBlank()) {
				throw new RuntimeException("loggerConfig.level with key " + i + " should contain a name");
			}
			final String format;
			if (logLevel.getStdoutFormat() != null && !logLevel.getStdoutFormat().isBlank()) {
				format = logLevel.getStdoutFormat();
			} else if (logLevel.getStderrFormat() != null && !logLevel.getStderrFormat().isBlank()) {
				format = logLevel.getStderrFormat();
			} else {
				throw new RuntimeException("loggerConfig.level with key " + i + " should contain either stdout or stderr format");
			}
			if (!format.contains(TIME_PLACEHOLDER)) {
				throw new RuntimeException("loggerConfig.level with key " + i + " should contain a time placeholder in output format");
			}
			if (!format.contains(MESSAGE_PLACEHOLDER)) {
				throw new RuntimeException("loggerConfig.level with key " + i + " should contain a time placeholder in output format");
			}
		}
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
			printErr(LocalDateTime.now().format(dateTimeFormat), "Exception when closing Logger", e);
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
