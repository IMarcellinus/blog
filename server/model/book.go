package model

type Book struct {
	ID uint `json:"id" gorm:"primaryKey"`

	NamaBuku          string `json:"nama_buku" gorm:"not null;column:nama_buku;size:255"`
	KodeBuku          string `json:"kode_buku" gorm:"not null;column:kode_buku;size:255"`
	TanggalPengesahan string `json:"tanggal_pengesahan" gorm:"not null;column:tanggal_pengesahan;size:255"`
	KategoriBuku      string `json:"kategori_buku" gorm:"not null;column:kategori_buku;size:255"`
	Description       string `json:"description" gorm:"not null;column:description;size:255"`
	CreatedAt         string `json:"created_at" gorm:"column:created_at;"`
	BookProdi         string `json:"book_prodi" gorm:"not null;column:book_prodi;size:255"`
}
