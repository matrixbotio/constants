package io.matrix.bot.constants;

public enum Errors {

    BASE_INTERNAL_ERROR(-32603, "BASE_INTERNAL_ERROR", "An internal error occurred. Please, try doing this request a few times more or just leave it as is and continue it later"),
    BASE_INVALID_ARGS(-32602, "BASE_INVALID_ARGS", "Invalid params");

    private final int code;
    private final String name;
    private final String message;

    Errors(final int code, final String name, final String message) {
        this.code = code;
        this.name = name;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getMessage() {
        return message;
    }

}
