package io.matrix.bot.constants;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.model.Error;
import io.matrix.bot.constants.model.MatrixException;

import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static io.matrix.bot.constants.Util.formatStackTraceString;
import static io.matrix.bot.constants.Util.initLog;

public class Errors {

	public static final String ERRORS_JSON_URL = "https://raw.githubusercontent.com/matrixbotio/constants/master/errors/errors.json";

	private static final Map<String, Error> errors = new HashMap<>();

	static {
		Map<String, Error> errors = null;
		try {
			errors = new ObjectMapper().readValue(new URL(ERRORS_JSON_URL), new TypeReference<>() {});
		} catch (Exception e) {
			initLog("Exception initializing errors via URL: " + e);
			try {
				initLog("Trying to init errors via file");
				errors = new ObjectMapper().readValue(new File("errors/errors.json"), new TypeReference<>() {});
				initLog("Successful errors initialization via file");
			} catch (Exception e1) {
				initLog("Exception initializing errors via file: " + e1);
			}
		}
		if (errors != null) {
			Errors.errors.putAll(errors);
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
