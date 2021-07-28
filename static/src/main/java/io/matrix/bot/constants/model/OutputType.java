package io.matrix.bot.constants.model;

import lombok.Getter;

import java.io.PrintStream;

@Getter
public enum OutputType {
	OUT(System.out),
	ERR(System.err);

	private final PrintStream output;

	OutputType(final PrintStream output) {
		this.output = output;
	}
}
