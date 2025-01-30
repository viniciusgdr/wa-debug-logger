package infra_walog

import (
	data_protocols "boostify/src/data/protocols"
	domain_usecases "boostify/src/domain/usecases"

	waLog "go.mau.fi/whatsmeow/util/log"
)

type log struct {
	waLog waLog.Logger
}

func NewLog() data_protocols.Logger {
	return &log{
		waLog: waLog.Stdout("Client", "WARN", true),
	}
}

func (l *log) SendLog(logType domain_usecases.LogType, message string) {
	switch logType {
	case domain_usecases.Info:
		l.waLog.Infof(message)
	case domain_usecases.Error:
		l.waLog.Errorf(message)
	case domain_usecases.Debug:
		break
	case domain_usecases.Warn:
		l.waLog.Warnf(message)
	}
}
