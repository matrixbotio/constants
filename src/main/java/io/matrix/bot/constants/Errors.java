package io.matrix.bot.constants;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.model.Error;
import io.matrix.bot.constants.model.MatrixException;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static io.matrix.bot.constants.Util.formatStackTraceString;

public class Errors {

	public static final String ERRORS_JSON_URL = "https://raw.githubusercontent.com/matrixbotio/constants/master/errors/errors.json";

	private static final Map<String, Error> errors = new HashMap<>();

	static {
		try {
			final Map<String, Error> errors = new ObjectMapper().readValue(new URL(ERRORS_JSON_URL), new TypeReference<>() {});
			Errors.errors.putAll(errors);
		} catch (final IOException e) {
			throw new RuntimeException("Exception fetching Errors configuration JSON", e);
		}
	}

	public static Error getError(final String errorName) {
		return errors.get(errorName);
	}

	public static Error getError(MatrixException exception) {
		var error = Errors.getError(exception.getErrorName());
		error.setMessage(exception.toString());
		var stack = formatStackTraceString(exception.getStackTrace(), exception.getCause());
		error.setStack(stack);
		return error;
	}

}
