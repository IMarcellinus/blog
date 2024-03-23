package model

type Book struct {
	ID uint `json:"id" gorm:"primaryKey"`

	NamaBuku          string `json:"nama_buku" gorm:"not null;column:nama_buku;size:255"`
	KodeBuku          string `json:"kode_buku" gorm:"not null;column:kode_buku;size:255"`
	TanggalPengesahan string `json:"tanggal_pengesahan" gorm:"not null;column:tanggal_pengesahan;size:255"`
	CreatedAt         string `json:"created_at" gorm:"column:created_at;"`
}
