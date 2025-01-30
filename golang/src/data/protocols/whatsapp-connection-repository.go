package data_protocols

import "go.mau.fi/whatsmeow"

type WhatsappConnectionRepository struct {
	Conn string
}

type DbWhatsappConnectionRepository interface {
	Start(numberPhone string, connectionMode string) (client *whatsmeow.Client, err error)
	Stop() error
	Kill() error
	Reload() error
}
