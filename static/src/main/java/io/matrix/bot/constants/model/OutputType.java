package io.matrix.bot.constants.model;

import lombok.Getter;

import java.io.PrintStream;

@Getter
public enum OutputType {
    OUT(System.out, false),
    ERR(System.err, true);

    private final PrintStream output;
    private final boolean printStackTrace;

    OutputType(final PrintStream output, final boolean printStackTrace) {
        this.output = output;
        this.printStackTrace = printStackTrace;
    }
}
