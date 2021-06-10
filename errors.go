package sharederrs

type apiError struct {
	Message string        `json:"message"`
	Code    int           `json:"code"`
	Name    string        `json:"name"`
}

func err(code int, name string, msg string) *apiError {
	return &apiError{
		Message: msg,
		Code:    code,
		Name:    name,
	}
}

// errors itself

var BaseInternalError = err(-32603, "BASE_INTERNAL_ERROR", "An internal error occured. Please, try doing this request a few times more or just leave it as is and continue it later")
var BaseInvalidArgs = err(-32602, "BASE_INVALID_ARGS", "Invalid params")
var BaseMethodNotFound = err(-32601, "BASE_METHOD_NOT_FOUND", "Method not found")
var BaseMethodOverloadNotFound = err(-32602, "BASE_METHOD_OVERLOAD_NOT_FOUND", "Cannot find suitable method overload. Please, check the args you've passed")

var BalanceNotEnough = err(-33010, "BALANCE_NOT_ENOUGH", "Not enough balance")

var BotInactive = err(-34300, "BOT_INACTIVE", "Bot is inactive")
var BotIsActive = err(-34200, "BOT_IS_ACTIVE", "Bot is active")
var BotNotFound = err(-34100, "BOT_NOT_FOUND", "Bot not found")
var BotOrderInvalid = err(-34020, "BOT_ORDER_INVALID", "Invalid order")

var DataEmpty = err(-35200, "DATA_EMPTY", "Data empty")
var DataExists = err(-35030, "DATA_EXISTS", "Data exists")
var DataHandleErr = err(-35001, "DATA_HANDLE_ERR", "Data handle error")
var DataInvalid = err(-35100, "DATA_INVALID", "Invalid data")
var DataNotFound = err(-35010, "DATA_NOT_FOUND", "Data not found")
var DataNoAccess = err(-35040, "DATA_NO_ACCESS", "Data no acesss")
var DataReqErr = err(-35020, "DATA_REQ_ERR", "Data request error")
var DataUnknown = err(-35300, "DATA_UNKNOWN", "Data unknown")

var UserCredInvalid = err(-36300, "USER_CRED_INVALID", "User credentials invalid")
var UserDeleted = err(-36001, "USER_DELETED", "User deleted")
var UserEmailActivationCodeWrong = err(-36304, "USER_EMAIL_ACTIVATION_CODE_WRONG", "Can't find such e-mail activaton code")
var UserEmailInvalid = err(-36301, "USER_EMAIL_INVALID", "Email is invalid. Please, check its format")
var UserEmailNotInWhitelist = err(-36303, "USER_EMAIL_NOT_IN_WHITELIST", "Now we're at testing stage and your email isn't in whitelist. We can't allow you to register. Sorry")
var UserEmailRecoveryCodeWrong = err(-36305, "USER_EMAIL_RECOVERY_CODE_WRONG", "Can't find such e-mail recovery code")
var UserEmailUsed = err(-36302, "USER_EMAIL_USED", "This email is already used")
var UserIsAuth = err(-36100, "USER_IS_AUTH", "User is authorized")
var UserNotAuth = err(-36200, "USER_NOT_AUTH", "User not authorized")
var UserNotFound = err(-36010, "USER_NOT_FOUND", "User not found")
var UserStatusInvalid = err(-36020, "USER_STATUS_INVALID", "User status invalid")

var ServiceDisconnected = err(-37100, "SERVICE_DISCONNECTED", "Service disconnected")
var ServiceNoAccess = err(-37010, "SERVICE_NO_ACCESS", "No access")
var ServiceReqFailed = err(-37010, "SERVICE_REQ_FAILED", "Service request failed")

var NotificationsConfigError = err(-38010, "NOTIFICATIONS_CONFIG_ERROR", "Error configuring notifications")
var NotificationsSaveEmailError = err(-38020, "NOTIFICATIONS_SAVE_EMAIL_ERROR", "Error saving email for notifications")
var NotificationsTelegramAuthError = err(-38000, "NOTIFICATIONS_TELEGRAM_AUTH_ERROR", "Telegram user authentication error")
