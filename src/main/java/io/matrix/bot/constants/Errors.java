package io.matrix.bot.constants;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Errors {

    public static final String ERRORS_JSON_URL = "https://raw.githubusercontent.com/matrixbotio/constants/master/errors/errors.json";

    private static final Map<String, Error> errorsCache = new ConcurrentHashMap<>();

    static {
        updateErrorsMap();
        Executors.newSingleThreadScheduledExecutor()
                .schedule(Errors::updateErrorsMap, 5, TimeUnit.MINUTES);
    }

    private static void updateErrorsMap() {
        try {
            final var errors = new ObjectMapper().readValue(new URL(ERRORS_JSON_URL), new TypeReference<Map<String, Error>>() {});
            errorsCache.putAll(errors);
        } catch (final Exception e) {
            final var message = e.getMessage()==null ? e.toString() : e.getMessage();
            System.out.println(LocalDateTime.now() + ": ERROR: exception updating errors map from URL " + ERRORS_JSON_URL + message
                    + "\n");
            e.printStackTrace();
        }
    }

    public static Error getError(final String errorName) {
        return errorsCache.get(errorName);
    }

}
