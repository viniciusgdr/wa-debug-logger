package domain_usecases

type LogType string

const (
	Info LogType = "info"
	Error LogType = "error"
	Warn LogType = "warn"
	Debug LogType = "debug"
)

type Log interface {
	SendLog(logType LogType, message string)
}
