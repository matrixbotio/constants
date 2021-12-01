package io.matrix.bot.constants;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.matrix.bot.constants.model.Error;
import io.matrix.bot.constants.model.LogData;
import io.matrix.bot.constants.model.MatrixException;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.concurrent.ArrayBlockingQueue;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.jupiter.api.Assertions.*;

class LoggerTest {

	@Test
	public void should_successfully_handle_log() throws InterruptedException {
		// given
		var host = "mockedHost";
		var source = "mockedSource";
		var message = "Mocked message";
		var env = "local";
		var blockingQueue = new ArrayBlockingQueue<LogData>(1);
		var logger = Logger.newLogger(s -> {
			blockingQueue.add(s);
			return null;
		}, host, source, env);
		// when
		logger.log(message);
		// then
		var logData = blockingQueue.poll(5, SECONDS);
		//noinspection ConstantConditions
		assertEquals(0, logData.getCode());
		assertEquals(host, logData.getHost());
		assertEquals(2, logData.getLevel());
		assertEquals(message, logData.getMessage());
		assertEquals(source, logData.getSource());
		assertNull(logData.getStack());
		assertTrue(logData.getTimestamp().isAfter(LocalDateTime.now().minusHours(1)));
		logger.waitAllThreads();
	}

	@Test
	public void should_successfully_handle_error() throws InterruptedException {
		// given
		var host = "mockedHost";
		var source = "mockedSource";
		var message = "Mocked message";
		var env = "local";
		var blockingQueue = new ArrayBlockingQueue<LogData>(1);
		var matrixException = new MatrixException(message);
		var logger = Logger.newLogger(s -> {
			blockingQueue.add(s);
			return null;
		}, host, source, env);

		// when
		logger.error(matrixException);

		// then
		var logData = blockingQueue.poll(5, SECONDS);
		//noinspection ConstantConditions
		assertEquals(host, logData.getHost());
		assertEquals(4, logData.getLevel());
		assertEquals(matrixException.toString(), logData.getMessage());
		assertEquals(source, logData.getSource());
		assertNotNull(logData.getStack());
		assertTrue(logData.getTimestamp().isAfter(LocalDateTime.now().minusHours(1)));
		logger.waitAllThreads();
	}

	@Test
	public void should_handle_persisting_exception() throws InterruptedException {
		// given
		var host = "mockedHost";
		var source = "mockedSource";
		var env = "local";
		var blockingQueue = new ArrayBlockingQueue<LogData>(1);
		var logger = Logger.newLogger(s -> {
			blockingQueue.add(s);
			throw new RuntimeException("Test");
		}, host, source, env);
		// when
		logger.log("Test message");
		// then
		blockingQueue.poll(5, SECONDS);
		logger.waitAllThreads();
	}

	@Test
	public void should_handle_null_log_message() throws InterruptedException {
		// given
		var host = "mockedHost";
		var source = "mockedSource";
		var env = "local";
		String message = null;
		var blockingQueue = new ArrayBlockingQueue<LogData>(1);
		var logger = Logger.newLogger(s -> {
			blockingQueue.add(s);
			return null;
		}, host, source, env);
		// when
		logger.log(message);
		// then
		var logData = blockingQueue.poll(5, SECONDS);
		//noinspection ConstantConditions
		assertEquals(0, logData.getCode());
		assertEquals(host, logData.getHost());
		assertEquals(2, logData.getLevel());
		assertNull(message);
		assertEquals(source, logData.getSource());
		assertNull(logData.getStack());
		assertTrue(logData.getTimestamp().isAfter(LocalDateTime.now().minusHours(1)));
		logger.waitAllThreads();
	}

	@Test
	public void should_handle_many_messages() {
		var logger = Logger.newLogger(s -> {
			try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			return null;
		}, "host", "source", "local");
		for (int i=0; i<1000; ++i) {
			logger.log(String.valueOf(i));
		}
		logger.waitAllThreads();
	}

}
