package domain_usecases

import "go.mau.fi/whatsmeow/types/events"

type TypePair string

const (
	QR   TypePair = "QR"
	CODE TypePair = "CODE"
)

type MessageInfo struct {
	Type        string `json:"type"`
	AssistantId string `json:"assistantId"`
	// not required
	UserId      string   `json:"userId"`
	TypePair    TypePair `json:"typePair"`
	PhoneNumber string   `json:"phoneNumber"`
}

type TypeMessage string

const (
	TEXT         TypeMessage = "text"
	AUDIO        TypeMessage = "audio"
	IMAGE        TypeMessage = "image"
	BUTTON_REPLY TypeMessage = "button_reply"
)

type MessageMedia struct {
	URL      string `json:"url"`
	Duration int    `json:"duration"`
}

type ButtonType string

const (
	ButtonURL   ButtonType = "url"
	ButtonCopy  ButtonType = "copy"
	ButtonReply ButtonType = "reply"
)

type InteractiveButtons struct {
	DisplayText string     `json:"display_text"`
	ID          string     `json:"id"`
	Type        ButtonType `json:"type"`
}

type MessageProcessorMessage struct {
	Type               TypeMessage           `json:"type"`
	Text               string                `json:"text"`
	Media              *MessageMedia         `json:"media"`
	InteractiveButtons *[]InteractiveButtons `json:"interactive_buttons"`
}

type SendMessage struct {
	Messages       []MessageProcessorMessage `json:"messages"`
	JID            string                    `json:"jid"`
	AssistantId    string                    `json:"assistantId"`
	MessageContent *events.Message           `json:"message_content"`
}
