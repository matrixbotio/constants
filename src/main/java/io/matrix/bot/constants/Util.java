package io.matrix.bot.constants;

import java.util.Arrays;
import java.util.StringJoiner;

public class Util {

    public static String formatStackTraceString(final StackTraceElement[] stackTrace) {
        final var stringJoiner = new StringJoiner("\n\tat ");
        Arrays.stream(stackTrace).forEach(stackTraceElement -> stringJoiner.add(stackTraceElement.toString()));
        return stringJoiner.toString();
    }

}
