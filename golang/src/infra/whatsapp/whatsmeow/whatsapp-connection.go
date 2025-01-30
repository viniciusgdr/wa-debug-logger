package infra_whatsmeow

import (
	data_protocols "boostify/src/data/protocols"
	constants "boostify/src/defaults"
	"boostify/src/infra/websocket"
	"fmt"

	_ "github.com/lib/pq"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store"
	"go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"
)

type whatsappConnectionRepository struct {
	client              *whatsmeow.Client
	container           *sqlstore.Container
	assistantId         string
}

func NewWhatsappConnectionRepository(
	sessionContainer *sqlstore.Container,
	assistantId string,
) data_protocols.DbWhatsappConnectionRepository {
	return &whatsappConnectionRepository{
		assistantId:         assistantId,
		container:           sessionContainer,
	}
}

type customLogger struct {
	waLog.Logger
}

func GenLogger() waLog.Logger {
	logger := waLog.Stdout("whatsmeow", "DEBUG", true)

	return &customLogger{logger}
}

func (c *customLogger) Warnf(msg string, args ...interface{}) {
	str := fmt.Sprintf(msg, args...)
	websocket.SendMessage(str)
	c.Logger.Warnf(msg, args...)
}

func (c *customLogger) Errorf(msg string, args ...interface{}) {
	str := fmt.Sprintf(msg, args...)
	websocket.SendMessage(str)
	c.Logger.Errorf(msg, args...)
}

func (c *customLogger) Infof(msg string, args ...interface{}) {
	str := fmt.Sprintf(msg, args...)
	websocket.SendMessage(str)
	c.Logger.Infof(msg, args...)
}

func (c *customLogger) Debugf(msg string, args ...interface{}) {
	str := fmt.Sprintf(msg, args...)
	websocket.SendMessage(str)
	c.Logger.Debugf(msg, args...)
}
func (w *whatsappConnectionRepository) Start(numberPhone string, connectionMode string) (clientReturn *whatsmeow.Client, err error) {
	deviceStores, err := w.container.GetAllDevices()
	var deviceStore *store.Device
	for _, device := range deviceStores {
		if device.ID.ToNonAD().User == numberPhone {
			deviceStore = device
			break
		}
	}
	if deviceStore == nil {
		deviceStore = w.container.NewDevice()
	}
	if err != nil {
		return nil, err
	}
	logger := GenLogger()
	client := whatsmeow.NewClient(deviceStore, logger)

	if client.Store.ID == nil {
		if connectionMode == "CODE" {
			err = client.Connect()
			if err != nil {
				return nil, err
			}
			fmt.Println(`"⏳ Connected, but registering device `+numberPhone+`...`)
			phoneCode, errPair := client.PairPhone(numberPhone, false, whatsmeow.PairClientChrome, constants.CLIENT_DISPLAY_NAME)
			if errPair != nil {
				return nil, errPair
			}
			fmt.Println("⏳ Waiting for code..."+phoneCode)
		}
	} else {
		err = client.Connect()
		if err != nil {
			return nil, err
		}
	}

	return client, nil
}

func (w *whatsappConnectionRepository) Stop() error {
	w.client.Disconnect()
	return nil
}

func (w *whatsappConnectionRepository) Kill() error {
	err := w.client.Logout()
	return err
}

func (w *whatsappConnectionRepository) Reload() error {
	id := *w.client.Store.ID
	w.client.Disconnect()
	_, err := w.Start(id.ToNonAD().User, "")
	if err != nil {
		return err
	}
	return nil
}
