const base = `
package constants

import (
	"time"
	"os"
	"strings"
	"unicode/utf8"
	"encoding/json"
	"strconv"
)

type logDevice struct{}

func (dev *logDevice) Send(data string)

type msgStackType struct {
	Message string
	Stack string
}

type sendMessageFormat struct {
	Source    string      \`json:"source"\`
	Host      string      \`json:"host"\`
	Timestamp int64       \`json:"timestamp"\`
	Level     int         \`json:"level"\`
	Code      int         \`json:"code"\`
	Message   string      \`json:"message"\`
	Stack     interface{} \`json:"stack,omitempty"\`
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
	now := time.Now()
	var msgStack msgStackType
	if msg, ok := message.(string); ok {
        msgStack.Message = msg
		msgStack.Stack = ""
    } else if err, ok := message.(*APIError); ok {
        msgStack.Message = err.Message
		msgStack.Stack = err.Stack
    } else {
		return
	}
	formattedTime := now.Format(l.DTFormat)
	formattedTime += strings.Repeat("0", l.DTFormatLen - utf8.RuneCountInString(formattedTime))
	formattedMessage := msgStack.Message
	sendObj := &sendMessageFormat{
		Source: l.Source,
		Host: l.Host,
		Timestamp: now.Unix(),
		Level: level,
		Message: msgStack.Message,
	}
	if len(msgStack.Stack) > 0 {
		formattedMessage += "\n" + msgStack.Stack
		sendObj.Stack = msgStack.Stack
	}
	output.WriteString(strings.NewReplacer("%datetime%", formattedTime, "%message%", formattedMessage).Replace(template) + "\n")
	r, _ := json.Marshal(sendObj)
	l.Dev.Send(string(r))
}

func NewLogger(dev interface{}, host string, source string) *Logger {
	format, formatLen := getSuitableDatetimeFormat(logConfig["&datetime_format"].(string))
	logLevels := make(map[string]*logLevelDesc)
	for strlevel, element := range logConfig {
        if level, err := strconv.Atoi(strlevel); err == nil {
			if elMap, ok := element.(map[string]string); ok {
				logLevel := &logLevelDesc{
					Level: level,
					Stderr: false,
				}
				if stderr, exists := elMap["stderr_format"]; exists {
					logLevel.Stderr = true
					logLevel.Format = stderr
				} else if stdout, exists := elMap["stdout_format"]; exists {
					logLevel.Format = stdout
				}
				logLevels[elMap["name"]] = logLevel
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
`.slice(1);

export default struct => {
	let res = base;
	for(const level in struct) if(!Number.isNaN(+level)){
		res += `
// ${struct[level].description}
func (l *Logger) ${struct[level].name.slice(0, 1).toUpperCase() + struct[level].name.slice(1)}(message interface{}){
	logLevel := l.LogLevels[${JSON.stringify(struct[level].name)}]
	output := os.Stdout
	if logLevel.Stderr {
		output = os.Stderr
	}
	go l.baseWriter(message, output, logLevel.Format, logLevel.Level)
} 
`;
	}
	return {
		'../logger.go': res,
	}
}
