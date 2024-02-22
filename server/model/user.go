package model

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"column:username;unique"`
	Password  string    `json:"_" gorm:"column:password;"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at; autoCreateTime"`
}
