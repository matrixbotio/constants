package io.matrix.bot.constants.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MatrixException extends RuntimeException {

    private String errorName = "BASE_INTERNAL_ERROR";

    public MatrixException() {
    }

    public MatrixException(String message) {
        super(message);
    }

    public MatrixException(String errorName, String message) {
        super(message);
        this.errorName = errorName;
    }

    public MatrixException(String message, Throwable cause) {
        super(message, cause);
    }

    public MatrixException(String errorName, String message, Throwable cause) {
        super(message, cause);
        this.errorName = errorName;
    }

}
