package io.matrix.bot.constants;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.model.Error;
import io.matrix.bot.constants.model.LogData;
import org.junit.jupiter.api.Test;

import java.util.concurrent.ArrayBlockingQueue;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.jupiter.api.Assertions.*;

class LoggerTest {

    @Test
    public void should_successfully_handle_log() throws JsonProcessingException, InterruptedException {
        // given
        final var host = "mockedHost";
        final var source = "mockedSource";
        final var message = "Mocked message";
        final var blockingQueue = new ArrayBlockingQueue<String>(1);
        final var logger = Logger.newLogger(s -> {
            blockingQueue.add(s);
            return null;
        }, host, source);
        // when
        logger.log(message);
        // then
        final var logDataString = blockingQueue.poll(5, SECONDS);
        final var logData = new ObjectMapper().readValue(logDataString, LogData.class);
        assertEquals(0, logData.getCode());
        assertEquals(host, logData.getHost());
        assertEquals(2, logData.getLevel());
        assertEquals(message, logData.getMessage());
        assertEquals(source, logData.getSource());
        assertNull(logData.getStack());
        assertTrue(logData.getTimestamp() > 0L);
        logger.close();
    }

    @Test
    public void should_successfully_handle_error() throws JsonProcessingException, InterruptedException {
        // given
        final var host = "mockedHost";
        final var source = "mockedSource";
        final var message = "Mocked message";
        final var code = -3414;
        final var blockingQueue = new ArrayBlockingQueue<String>(1);
        final var logger = Logger.newLogger(s -> {
            blockingQueue.add(s);
            return null;
        }, host, source);
        // when
        logger.error(new Error(code, "Mocked_Error", message));
        // then
        final var logDataString = blockingQueue.poll(5, SECONDS);
        final var logData = new ObjectMapper().readValue(logDataString, LogData.class);
        assertEquals(code, logData.getCode());
        assertEquals(host, logData.getHost());
        assertEquals(4, logData.getLevel());
        assertEquals(message, logData.getMessage());
        assertEquals(source, logData.getSource());
        assertNotNull(logData.getStack());
        assertTrue(logData.getTimestamp() > 0L);
        logger.close();
    }

    @Test
    public void should_handle_persisting_exception() throws InterruptedException {
        // given
        final var host = "mockedHost";
        final var source = "mockedSource";
        final var blockingQueue = new ArrayBlockingQueue<String>(1);
        final var logger = Logger.newLogger(s -> {
            blockingQueue.add(s);
            throw new RuntimeException("Test");
        }, host, source);
        // when
        logger.log("Test message");
        // then
        blockingQueue.poll(5, SECONDS);
        logger.close();
    }

}