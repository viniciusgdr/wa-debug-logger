package domain_models_bot

import (
	domain_models_bot_assistant "boostify/src/domain/models/bot-assistant"
	domain_models_user "boostify/src/domain/models/user"
)

type BotStatus string

const (
	ACTIVE   BotStatus = "ACTIVE"
	INACTIVE BotStatus = "INACTIVE"
)

type BotType string

const (
	WHATSAPP_OFFICIAL   BotType = "WHATSAPP_OFFICIAL"
	WHATSAPP_UNOFFICIAL BotType = "WHATSAPP_UNOFFICIAL"
)

type Bot struct {
	ID               string                                    `gorm:"primaryKey"`
	UserID           string                                    `gorm:"column:user_id"`
	Name             string                                    `gorm:"column:name"`
	PhoneNumber      string                                    `gorm:"column:phone_number"`
	Description      string                                    `gorm:"column:description"`
	Status           BotStatus                                 `gorm:"default:INACTIVE;column:status"`
	Type             BotType                                   `gorm:"default:WHATSAPP_OFFICIAL;column:type"`
	Paired           bool                                      `gorm:"column:paired"`
	Stoped           bool                                      `gorm:"column:stoped"`
	AssistantInfos   string                                    `gorm:"column:assistant_infos"`
	BotAssistantId   *string                                   `gorm:"column:bot_assistant_id"`
	User             *domain_models_user.User                  `gorm:"foreignKey:UserID"`
	AssistantDefault *domain_models_bot_assistant.BotAssistant `gorm:"foreignKey:BotAssistantId"`
}
