package io.matrix.bot.constants.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.TreeMap;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
public class LoggerConfig {
    @JsonProperty("datetime_format")
    private String datetimeFormat;
    private TreeMap<String, LogLevel> levels = new TreeMap<>();
}
