package io.matrix.bot.constants.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogData {
    private String source;
    private String host;
    private long timestamp;
    private int level;
    private String message;
    private int code;
    private String stack;
}
