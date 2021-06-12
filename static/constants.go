package constants

import (
	"io/ioutil"
	"net/http"
	"encoding/json"
)

type apiError struct {
	Message string        `json:"message"`
	Code    int           `json:"code"`
	Name    string        `json:"name"`
}

func get(url string) string {
	resp, err := http.Get(url)
	if err != nil {
		return "{}"
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "{}"
	}
	return string(body)
}

func getErrors(url string) map[string]*apiError {
	var storage map[string]*apiError
	json.Unmarshal([]byte(get(url)), &storage)
	return storage
}

func err(code int, name string, msg string) *apiError {
	return &apiError{
		Message: msg,
		Code:    code,
		Name:    name,
	}
}

var errors = getErrors("https://raw.githubusercontent.com/matrixbotio/constants/master/errors/errors.json")

func Error(name string) *apiError {
	res, exists := errors["foo"]
	if !exists {
		return err(-1, "ERR_UNKNOWN", "Cannot get error named " + name)
	}
	return res
}
