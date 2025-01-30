package domain_models_messages

import "go.mau.fi/whatsmeow/types/events"

type FailAction struct {
	AssistantId string
	Reason      string
}

type AssistantMessage struct {
	AssistantId    string          `json:"assistantId"`
	Name           string          `json:"name"`
	UserJid        string          `json:"user_jid"`
	Message        string          `json:"message"`
	MessageContent *events.Message `json:"message_content"`
	Context        string          `json:"context"`
}
