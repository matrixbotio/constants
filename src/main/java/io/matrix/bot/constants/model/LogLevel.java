package io.matrix.bot.constants.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
public class LogLevel {
    private String name;
    private String description;
    @JsonProperty("stdout_format")
    private String stdoutFormat;
    @JsonProperty("stderr_format")
    private String stderrFormat;
}
