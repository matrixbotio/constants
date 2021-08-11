function _<C extends number, N extends string, M extends string>(code: C, name: N, message: M){
	return Object.assign(new Error, { code, message, name })
}

export const
    BASE_INTERNAL_ERROR = _(-32603, "BASE_INTERNAL_ERROR", "An internal error occured. Please, try doing this request a few times more or just leave it as is and continue it later"),
    BASE_INVALID_ARGS = _(-32602, "BASE_INVALID_ARGS", "Invalid params"),
    BASE_METHOD_NOT_FOUND = _(-32601, "BASE_METHOD_NOT_FOUND", "Method not found"),
    BASE_METHOD_OVERLOAD_NOT_FOUND = _(-32602, "BASE_METHOD_OVERLOAD_NOT_FOUND", "Cannot find suitable method overload. Please, check the args you've passed"),

    BALANCE_NOT_ENOUGH = _(-33010, "BALANCE_NOT_ENOUGH", "Not enough balance"),

    BOT_INACTIVE = _(-34300, "BOT_INACTIVE", "Bot is inactive"),
    BOT_IS_ACTIVE = _(-34200, "BOT_IS_ACTIVE", "Bot is active"),
    BOT_NOT_FOUND = _(-34100, "BOT_NOT_FOUND", "Bot not found"),
    BOT_ORDER_INVALID = _(-34020, "BOT_ORDER_INVALID", "Invalid order"),
    BOT_ORDERS_NOT_FOUND = _(-34030, "BOT_ORDERS_NOT_FOUND", "Bot orders not found"),

    DATA_EMPTY = _(-35200, "DATA_EMPTY", "Data empty"),
    DATA_EXISTS = _(-35030, "DATA_EXISTS", "Data exists"),
    DATA_HANDLE_ERR = _(-35001, "DATA_HANDLE_ERR", "Data handle error"),
    DATA_INVALID = _(-35100, "DATA_INVALID", "Invalid data"),
    DATA_NOT_FOUND = _(-35010, "DATA_NOT_FOUND", "Data not found"),
    DATA_NO_ACCESS = _(-35040, "DATA_NO_ACCESS", "Data no acesss"),
    DATA_REQ_ERR = _(-35020, "DATA_REQ_ERR", "Data request error"),
    DATA_UNKNOWN = _(-35300, "DATA_UNKNOWN", "Data unknown"),
    DATA_ENCODE_ERR = _(-35003, "DATA_ENCODE_ERR", "Data encode error"),
    DATA_PARSE_ERR = _(-35002, "DATA_PARSE_ERR", "Data parse error"),

    USER_CRED_INVALID = _(-36300, "USER_CRED_INVALID", "User credentials invalid"),
    USER_DELETED = _(-36001, "USER_DELETED", "User deleted"),
    USER_EMAIL_ACTIVATION_CODE_WRONG = _(-36304, "USER_EMAIL_ACTIVATION_CODE_WRONG", "Can't find such e-mail activaton code"),
    USER_EMAIL_INVALID = _(-36301, "USER_EMAIL_INVALID", "Email is invalid. Please, check its format"),
    USER_EMAIL_NOT_IN_WHITELIST = _(-36303, "USER_EMAIL_NOT_IN_WHITELIST", "Now we're at testing stage and your email isn't in whitelist. We can't allow you to register. Sorry"),
    USER_EMAIL_RECOVERY_CODE_WRONG = _(-36305, "USER_EMAIL_RECOVERY_CODE_WRONG", "Can't find such e-mail recovery code"),
    USER_EMAIL_USED = _(-36302, "USER_EMAIL_USED", "This email is already used"),
    USER_IS_AUTH = _(-36100, "USER_IS_AUTH", "User is authorized"),
    USER_NOT_AUTH = _(-36200, "USER_NOT_AUTH", "User not authorized"),
    USER_NOT_FOUND = _(-36010, "USER_NOT_FOUND", "User not found"),
    USER_STATUS_INVALID = _(-36020, "USER_STATUS_INVALID", "User status invalid"),

    SERVICE_DISCONNECTED = _(-37100, "SERVICE_DISCONNECTED", "Service disconnected"),
    SERVICE_REQ_FAILED = _(-37010, "SERVICE_REQ_FAILED", "Service request failed"),
    SERVICE_NO_ACCESS = _(-37020, "SERVICE_NO_ACCESS", "No access"),
    SERVICE_CONN_ERR = _(-37200, "SERVICE_CONN_ERR", "Failed to connect to the service"),

    NOTIFICATIONS_CONFIG_ERROR = _(-38010, "NOTIFICATIONS_CONFIG_ERROR", "Error configuring notifications"),
    NOTIFICATIONS_SAVE_EMAIL_ERROR = _(-38020, "NOTIFICATIONS_SAVE_EMAIL_ERROR", "Error saving email for notifications"),
    NOTIFICATIONS_TELEGRAM_AUTH_ERROR = _(-38000, "NOTIFICATIONS_TELEGRAM_AUTH_ERROR", "Telegram user authentication error"),

    TASK_HANDLE_ERR = _(-39100, "TASK_HANDLE_ERR", "Task processing error"),

    STRATEGY_START_MESSAGE_VALIDATION_ERR = _(-40100, "STRATEGY_START_MESSAGE_VALIDATION_ERR", "Exception validating strategy start message"),
    STRATEGY_STOP_MESSAGE_VALIDATION_ERR = _(-40101, "STRATEGY_STOP_MESSAGE_VALIDATION_ERR", "Exception validating strategy stop message"),
    STRATEGY_NOT_FOUND = _(-40404, "STRATEGY_NOT_FOUND", "Strategy not found with parameters"),

    FORMULA_VALIDATION_ERR = _(-40102, "FORMULA_VALIDATION_ERR", "Exception validating formula");
