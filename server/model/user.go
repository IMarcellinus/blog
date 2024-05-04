package model

type User struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Username  string `json:"username" gorm:"column:username;unique"`
	Password  string `json:"password" gorm:"column:password;"`
	CodeQr    string `json:"codeqr" gorm:"column:codeqr;"`
	Role      string `json:"role" gorm:"column:role;"`
	CreatedAt string `json:"created_at" gorm:"column:created_at;"`
}
