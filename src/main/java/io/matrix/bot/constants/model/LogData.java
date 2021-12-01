package io.matrix.bot.constants.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

import static java.time.ZoneOffset.UTC;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LogData {
	private String source;
	private String host;
	private LocalDateTime timestamp;
	private int level;
	private String message;
	private int code;
	private String stack;
	private String env;
}
