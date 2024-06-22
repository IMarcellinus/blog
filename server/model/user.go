package model

type User struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	Username     string `json:"username" gorm:"column:username;unique"`
	Password     string `json:"password" gorm:"column:password;"`
	Nim          string `json:"nim" gorm:"column:nim;"`
	Nama         string `json:"nama" gorm:"column:nama;"`
	JenisKelamin string `json:"jeniskelamin" gorm:"column:jeniskelamin;"`
	Prodi        string `json:"prodi" gorm:"column:prodi;"`
	CodeQr       string `json:"codeqr" gorm:"column:codeqr;"`
	Role         string `json:"role" gorm:"column:role;"`
	CreatedAt    string `json:"created_at" gorm:"column:created_at;"`
}
