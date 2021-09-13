package constants

import "testing"

func TestErrorConstructor(t *testing.T) {
	errName := "DATA_INVALID"
	errMessage := "test error message"
	e := Error(errName, errMessage)
	if e == nil {
		t.Fatalf("Error should not be empty")
	}

	if e.Name != errName {
		t.Fatalf("In an error, the assigned name is not preserved. " +
			"Received: '" + e.Name + "', expected: '" + errName + "'")
	}

	if e.Message != errMessage {
		t.Fatalf("In an error, the assigned message is not preserved. " +
			"Received: '" + e.Message + "', expected: '" + errMessage + "'")
	}
}
