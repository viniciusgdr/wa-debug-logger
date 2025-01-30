package infra_whatsmeow

import (
	domain_usecases "boostify/src/domain/usecases"
	"fmt"

	waLog "go.mau.fi/whatsmeow/util/log"
)

type logWrapper struct {
	log domain_usecases.Log
}

func (lw *logWrapper) Warnf(msg string, args ...interface{}) {
	lw.log.SendLog(domain_usecases.Warn, fmt.Sprintf(msg, args...))
}

func (lw *logWrapper) Errorf(msg string, args ...interface{}) {
	lw.log.SendLog(domain_usecases.Error, fmt.Sprintf(msg, args...))
}

func (lw *logWrapper) Infof(msg string, args ...interface{}) {
	lw.log.SendLog(domain_usecases.Info, fmt.Sprintf(msg, args...))
}

func (lw *logWrapper) Debugf(msg string, args ...interface{}) {
	// Assuming Debug is equivalent to Info for this implementation
	// lw.log.SendLog(domain_usecases.Debug, fmt.Sprintf(msg, args...))
}

func (lw *logWrapper) Sub(module string) waLog.Logger {
	// Assuming Sub just returns a new instance for this module, you can adjust it if needed
	return &logWrapper{
		log: lw.log,
	}
}
