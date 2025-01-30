package domain_usecases

type Topic string

const (
	EventActionTopic          Topic = "log"
	EventLogTopic             Topic = "log"
)

type SendProducerMessage interface {
	Send(topic Topic, message interface{}) error
	SendWithKey(topic Topic, message interface{}, key string) error
}

type EventAction struct {
	Action      string `json:"action"`
	AssistantId string `json:"assistantId"`
	Message     string `json:"message"`
	Content     string `json:"content"`
	PhoneNumber string `json:"phoneNumber"`
}
