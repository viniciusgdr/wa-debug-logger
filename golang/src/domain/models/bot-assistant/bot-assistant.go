package domain_models_bot_assistant

type BotAssistant struct {
	ID          string `gorm:"primaryKey"`
	Name        string `gorm:"column:name"`
	Description string `gorm:"column:description"`
	ImageUrl    string `gorm:"column:image_url"`
	Prompt      string `gorm:"column:prompt"`
}
