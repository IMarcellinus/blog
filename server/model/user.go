package model

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"column:username;unique"`
	Password  string    `json:"password" gorm:"column:password;"`
	CodeQr    string    `json:"codeqr" gorm:"column:codeqr;"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at; autoCreateTime"`
}
