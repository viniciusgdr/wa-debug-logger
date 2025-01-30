package data_protocols

import domain_usecases "boostify/src/domain/usecases"

type Logger interface {
	SendLog(logType domain_usecases.LogType, message string)
}
