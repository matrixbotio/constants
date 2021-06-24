package constants

import (
	"time"
	"os"
	"strings"
	"unicode/utf8"
	"encoding/json"
	"strconv"
	"sync"
)

var wg sync.WaitGroup

type logDevice interface{
    Send(data string)
}

type sendMessageFormat struct {
	Source    string      `json:"source"`
	Host      string      `json:"host"`
	Timestamp int64       `json:"timestamp"`
	Level     int         `json:"level"`
	Message   string      `json:"message"`
	Code      interface{} `json:"code,omitempty"`
	Stack     interface{} `json:"stack,omitempty"`
}

type logLevelDesc struct {
	Stderr bool
	Format string
	Level int
}

type Logger struct {
	Dev logDevice
	Host string
	Source string
	DTFormat string
	DTFormatLen int
	LogLevels map[string]*logLevelDesc
}

func getSuitableDatetimeFormat(format string) (string, int){
	return strings.NewReplacer("YYYY", "2006", "MM", "01", "DD", "02", "HH", "15", "mm", "04", "sss", "999", "ss", "05").Replace(format), utf8.RuneCountInString(format)
}

func getLogs(url string) map[string]interface{} {
	storage := make(map[string]interface{})
	getJSON(url, &storage)
	return storage
}

var logConfig = getLogs("https://raw.githubusercontent.com/matrixbotio/constants/master/logger/logger.json")

func (l *Logger) baseWriter(message interface{}, output *os.File, template string, level int){
	defer wg.Done()
	now := time.Now()
	sendObj := &sendMessageFormat{
		Source: l.Source,
		Host: l.Host,
		Timestamp: now.Unix(),
		Level: level,
	}
	if msg, ok := message.(string); ok {
		sendObj.Message = msg
	} else if err, ok := message.(*APIError); ok {
		sendObj.Message = err.Message
		sendObj.Stack = err.Stack
		sendObj.Code = err.Code
	} else {
		return
	}
	formattedTime := now.Format(l.DTFormat)
	formattedTime += strings.Repeat("0", l.DTFormatLen - utf8.RuneCountInString(formattedTime))
	formattedMessage := sendObj.Message
	if sendObj.Stack != nil {
		formattedMessage += "\n" + sendObj.Stack.(string)
	}
	output.WriteString(strings.NewReplacer("%datetime%", formattedTime, "%message%", formattedMessage).Replace(template) + "\n")
	r, _ := json.Marshal(sendObj)
	l.Dev.Send(string(r))
}

func NewLogger(dev interface{}, host string, source string) *Logger {
	format, formatLen := getSuitableDatetimeFormat(logConfig["datetime_format"].(string))
	logLevels := make(map[string]*logLevelDesc)
	for strlevel, element := range logConfig {
		if level, err := strconv.Atoi(strlevel); err == nil {
			if elMap, ok := element.(map[string]interface{}); ok {
				logLevel := &logLevelDesc{
					Level: level,
					Stderr: false,
				}
				if stderr, exists := elMap["stderr_format"]; exists {
					logLevel.Stderr = true
					logLevel.Format = stderr.(string)
				} else if stdout, exists := elMap["stdout_format"]; exists {
					logLevel.Format = stdout.(string)
				}
				logLevels[elMap["name"].(string)] = logLevel
			}
		}
	}
	return &Logger {
		Dev: dev.(logDevice),
		Host: host,
		Source: source,
		DTFormat: format,
		DTFormatLen: formatLen,
		LogLevels: logLevels,
	}
}

func AwaitLoggers() {
	wg.Wait()
}

// Very detailed logs
func (l *Logger) Verbose(message interface{}){
	logLevel := l.LogLevels["verbose"]
	output := os.Stdout
	if logLevel.Stderr {
		output = os.Stderr
	}
	wg.Add(1)
	go l.baseWriter(message, output, logLevel.Format, logLevel.Level)
}

// Important logs
func (l *Logger) Log(message interface{}){
	logLevel := l.LogLevels["log"]
	output := os.Stdout
	if logLevel.Stderr {
		output = os.Stderr
	}
	wg.Add(1)
	go l.baseWriter(message, output, logLevel.Format, logLevel.Level)
}

// Something may go wrong
func (l *Logger) Warn(message interface{}){
	logLevel := l.LogLevels["warn"]
	output := os.Stdout
	if logLevel.Stderr {
		output = os.Stderr
	}
	wg.Add(1)
	go l.baseWriter(message, output, logLevel.Format, logLevel.Level)
}

// Failed to do something. This may cause problems!
func (l *Logger) Error(message interface{}){
	logLevel := l.LogLevels["error"]
	output := os.Stdout
	if logLevel.Stderr {
		output = os.Stderr
	}
	wg.Add(1)
	go l.baseWriter(message, output, logLevel.Format, logLevel.Level)
}

// Critical error. Node's shutted down!
func (l *Logger) Critical(message interface{}){
	logLevel := l.LogLevels["critical"]
	output := os.Stdout
	if logLevel.Stderr {
		output = os.Stderr
	}
	wg.Add(1)
	go l.baseWriter(message, output, logLevel.Format, logLevel.Level)
}
