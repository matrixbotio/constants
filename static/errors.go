package constants

import (
	"github.com/go-stack/stack"
)

type APIError struct {
	Message string `json:"message"`
	Code    int    `json:"code"`
	Name    string `json:"name"`
	Stack   string `json:"-"`
}

func getErrors(url string) map[string]*APIError {
	storage := make(map[string]*APIError)
	getJSON(url, &storage)
	return storage
}

func err(code int, name string, msg string) *APIError {
	return &APIError{
		Message: msg,
		Code:    code,
		Name:    name,
		Stack:   stack.Trace().TrimRuntime().String(),
	}
}

var errors = getErrors("https://raw.githubusercontent.com/matrixbotio/constants/master/errors/errors.json")

func Error(name string) *APIError {
	if res, exists := errors[name]; exists {
		return err(res.Code, res.Name, res.Message)
	}
	return err(-1, "ERR_UNKNOWN", "Cannot get error named "+name)
}
