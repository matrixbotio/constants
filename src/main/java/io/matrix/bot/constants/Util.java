package io.matrix.bot.constants;

import java.util.Arrays;
import java.util.StringJoiner;

public class Util {

	public static String formatStackTraceString(final StackTraceElement[] stackTrace, Throwable cause) {
		final var stringJoiner = new StringJoiner("\n\tat ");
		Arrays.stream(stackTrace).forEach(stackTraceElement -> stringJoiner.add(stackTraceElement.toString()));
		if (cause != null) {
			stringJoiner.add("Cause: " + cause);
			stringJoiner.add(formatStackTraceString(cause.getStackTrace(), cause.getCause()));
		}
		return stringJoiner.toString();
	}

}
