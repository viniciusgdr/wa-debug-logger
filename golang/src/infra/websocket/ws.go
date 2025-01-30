package websocket

import (
	"encoding/json"
	"log"
	"net/url"

	"github.com/gorilla/websocket"
)

var Conn *websocket.Conn

// Conecta ao WebSocket
func ConnectWebSocket(serverURL string) error {
	u := url.URL{Scheme: "ws", Host: serverURL}

	var err error
	Conn, _, err = websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return err
	}

	log.Println("Conectado ao WebSocket:", u.String())
	return nil
}

// Envia uma mensagem pelo WebSocket
func SendMessage(message string) error {
	if Conn == nil {
		return websocket.ErrCloseSent
	}

	// Create JSON message
	jsonMessage := map[string]string{
		"type": "whatsmeow",
		"data":  message,
	}

	// Convert to JSON
	jsonData, err := json.Marshal(jsonMessage)
	if err != nil {
		log.Println("Erro ao converter mensagem para JSON:", err)
		return err
	}

	// Send JSON message
	err = Conn.WriteMessage(websocket.TextMessage, jsonData)
	if err != nil {
		log.Println("Erro ao enviar mensagem:", err)
		return err
	}
	log.Println("Mensagem enviada:", string(jsonData))
	return nil
}
