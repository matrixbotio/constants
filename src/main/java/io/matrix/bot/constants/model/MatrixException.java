package io.matrix.bot.constants.model;

import io.matrix.bot.constants.Errors;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MatrixException extends RuntimeException {

    private String errorName = "BASE_INTERNAL_ERROR";
    private int code = -32603;

    public MatrixException() {
    }

    public MatrixException(String message) {
        super(message);
    }

    public MatrixException(String errorName, String message) {
        super(message);
        setErrorNameAndCode(errorName);
    }

    public MatrixException(String message, Throwable cause) {
        super(message, cause);
    }

    public MatrixException(String errorName, String message, Throwable cause) {
        super(message, cause);
        setErrorNameAndCode(errorName);
    }

    private void setErrorNameAndCode(String errorName) {
        this.errorName = errorName;
        var error = Errors.getError(errorName);
        if (error != null) {
            code = error.getCode();
        }
    }

}
