package model

import "time"

type Peminjaman struct {
	ID        uint       `json:"id" gorm:"primaryKey"`
	BookID    uint       `json:"book_id" gorm:"not null;index"`
	UserID    uint       `json:"user_id" gorm:"not null;index"`
	Book      Book       `json:"book" gorm:"foreignKey:BookID"`
	User      User       `json:"user" gorm:"foreignKey:UserID"`
	CreatedAt time.Time  `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	ReturnAt  *time.Time `json:"return_at" gorm:"column:return_at;"`
	IsPinjam  bool       `json:"is_pinjam"`
}
