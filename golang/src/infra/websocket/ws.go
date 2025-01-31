package websocket

import (
	"encoding/json"
	"log"
	"net/url"
	"time"

	"github.com/gorilla/websocket"
)

var Conn *websocket.Conn

func ConnectWebSocket(serverURL string) error {
	u := url.URL{Scheme: "ws", Host: serverURL}

	var err error
	Conn, _, err = websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}

	log.Println("Connected to WebSocket:", u.String())

	// setup ping pong
	go func() {
		jsonMessage := map[string]string{
			"tag": "ping",
		}
		for {
			time.Sleep(10 * time.Second)
			err := Conn.WriteJSON(jsonMessage)
			if err != nil {
				log.Println("Error sending ping:", err)
				return
			}
			log.Println("Ping sent")
		}
	}()

	return nil
}

// Sends a message through the WebSocket
func SendMessage(message string) error {
	if Conn == nil {
		return websocket.ErrCloseSent
	}

	jsonMessage := map[string]string{
		"type": "WHATSMEOW",
		"data": message,
	}

	jsonData, err := json.Marshal(jsonMessage)
	if err != nil {
		log.Println("Error converting message to JSON:", err)
		return err
	}

	err = Conn.WriteMessage(websocket.TextMessage, jsonData)
	if err != nil {
		log.Println("Error sending message:", err)
		return err
	}
	log.Println("Message sent:", string(jsonData))
	return nil
}
