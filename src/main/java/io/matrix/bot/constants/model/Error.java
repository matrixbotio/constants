package io.matrix.bot.constants.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Error {
    private int code;
    private String name;
    private String message;
    private String stack;

    public Error(final int code, final String name, final String message) {
        this.code = code;
        this.name = name;
        this.message = message;
    }
}
