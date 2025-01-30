package domain_models_user

type Method string

const (
	EMAIL  Method = "EMAIL"
	GOOGLE Method = "GOOGLE"
)

type User struct {
	ID       string  `gorm:"primaryKey"`
	Name     string  `gorm:"column:name"`
	Email    string  `gorm:"column:email"`
	Password string  `gorm:"column:password"`
	UserID   string  `gorm:"column:user_id"`
	Method   Method  `gorm:"column:method"`
	ImageURL string  `gorm:"column:image_url"`
	Credit   float64 `gorm:"column:credit"`

	CreatedAt string `gorm:"column:createdAt"`
	UpdatedAt string `gorm:"column:updatedAt"`

	IsAdmin bool `gorm:"column:is_admin"`
}
