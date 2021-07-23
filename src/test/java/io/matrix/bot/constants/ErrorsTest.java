package io.matrix.bot.constants;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ErrorsTest {

	@Test
	public void should_get_errors() {
		// when
		final var error = Errors.getError("SERVICE_REQ_FAILED");
		// then
		assertEquals(-37010, error.getCode());
		assertEquals("Service request failed", error.getMessage());
		assertEquals("SERVICE_REQ_FAILED", error.getName());
	}

}
