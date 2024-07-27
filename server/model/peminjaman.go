package model

import "time"

type Peminjaman struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	BookID        uint       `json:"book_id" gorm:"not null;index"`
	UserID        uint       `json:"user_id" gorm:"not null;index"`
	Book          Book       `json:"book" gorm:"foreignKey:BookID"`
	User          User       `json:"user" gorm:"foreignKey:UserID"`
	CreatedAt     time.Time  `json:"created_at" gorm:"column:created_at;autoCreateTime"`
	ReturnAt      *time.Time `json:"return_at" gorm:"column:return_at;"`
	ExpiredAt     *time.Time `json:"expired_at" gorm:"column:expired_at;"`
	Duration      *string    `json:"duration" gorm:"column:duration"`
	Rating        uint       `json:"rating" gorm:"column:rating;"`
	IsPinjam      bool       `json:"is_pinjam"`
	IsReservation bool       `json:"is_reservation"`
}
