package io.matrix.bot.constants.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

import static java.time.ZoneOffset.UTC;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
public class LogData {
	private String source;
	private String host;
	private long timestamp;
	private int level;
	private String message;
	private int code;
	private String stack;

	public LogData(final LocalDateTime dateTime,
				   final String message,
				   final int level,
				   final String stack,
				   final String host,
				   final String source,
				   final int code) {
		this.source = source;
		this.host = host;
		this.timestamp = dateTime.toInstant(UTC).toEpochMilli();
		this.level = level;
		this.message = message;
		this.code = code;
		this.stack = stack;
	}
}
