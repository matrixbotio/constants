package io.matrix.bot.constants.accessor;

import io.matrix.bot.constants.model.Error;

public class MessageAccessor {

	public static String getMessage(final Object message) {
		if (message == null) {
			return "";
		} else if (message instanceof Error) {
			return ((Error) message).getMessage();
		} else {
			return message.toString();
		}
	}

	public static String getStack(final Object message) {
		if (message == null) {
			return null;
		} else if (message instanceof Error && ((Error) message).getStack() != null) {
			return  ((Error) message).getStack();
		} else {
			return null;
		}
	}

	public static String getMessageAndStackTraceAsString(final Object message) {
		final var messageStr = getMessage(message);
		final var stackTrace = getStack(message);
		return stackTrace == null ? messageStr : messageStr + "\n" + stackTrace;
	}

	public static int getCode(final Object message) {
		if (message instanceof Error) {
			return ((Error) message).getCode();
		} else {
			return 0;
		}
	}

}
