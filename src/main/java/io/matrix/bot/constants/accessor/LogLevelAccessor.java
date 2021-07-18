package io.matrix.bot.constants.accessor;

import io.matrix.bot.constants.model.LogLevel;
import io.matrix.bot.constants.model.OutputType;

public class LogLevelAccessor {

	public static OutputType getOutputType(final LogLevel logLevel) {
		if (logLevel.getStdoutFormat() == null || logLevel.getStdoutFormat().isBlank()) {
			return OutputType.ERR;
		} else {
			return OutputType.OUT;
		}
	}

	public static String getFormat(final LogLevel logLevel) {
		if (logLevel.getStdoutFormat() == null || logLevel.getStdoutFormat().isBlank()) {
			return logLevel.getStderrFormat();
		} else {
			return logLevel.getStdoutFormat();
		}
	}

}
