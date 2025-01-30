package loader

import (
	"boostify/src/main/factories"
	"context"
	"fmt"
	"time"

	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types/events"
)

func StartConnection(
	PhoneNumber string,
	sessionContainer *sqlstore.Container,
	modeConnection string,
) {
	whatsAppBot := factories.MakeWhatsappBot(sessionContainer, "aa")
	clientWhatsMeow, err := whatsAppBot.Start(PhoneNumber, modeConnection)
	if err != nil {
		return
	}

	if clientWhatsMeow.Store.ID == nil {
		if modeConnection == "QR" {
			qrChan, _ := clientWhatsMeow.GetQRChannel(context.Background())
			err = clientWhatsMeow.Connect()
			for evt := range qrChan {
				if evt.Event == "code" {
					fmt.Println("QR code:", evt.Code)
				} else {
					fmt.Println("Login event:", evt.Event)
				}
			}
		}
	}
	clientWhatsMeow.AddEventHandler(func(evt interface{}) {
		switch evt.(type) {
		case *events.Connected:
			{
				fmt.Println("✅ Connected to WhatsApp Servers and authenticated!")
			}
		case *events.Disconnected:
			{
				fmt.Println("❌ Disconnected from WhatsApp Servers!")
				time.Sleep(5 * time.Second)
			}
		case *events.LoggedOut:
			{
				fmt.Println("🔓 Logged out from WhatsApp Servers!")
			}
		}
	})
}

