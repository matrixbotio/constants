package io.matrix.bot.constants;

import org.junit.jupiter.api.Test;

class ErrorsTest {

    @Test
    public void should_get_errors() {
        // when
        final var error = Errors.getError("SERVICE_REQ_FAILED");
        // then
        assert error.getCode() == -37010;
        assert error.getMessage().equals("Service request failed");
        assert error.getName().equals("SERVICE_REQ_FAILED");
    }

}
