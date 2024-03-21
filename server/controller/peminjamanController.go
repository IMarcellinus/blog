package controller

import (
	"log"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

func GetBorrowBook(c *fiber.Ctx) error {
	var Peminjaman []model.Peminjaman
	if err := database.DBConn.Preload("Book").Preload("User").Find(&Peminjaman).Error; err != nil {
		return err
	}
	return c.JSON(Peminjaman)

}

func BorrowBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Add a Book List",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Parsing request body JSON
	var requestBody struct {
		KodeBuku string `json:"kode_buku"`
		UserID   uint   `json:"user_id"`
	}

	if err := c.BodyParser(&requestBody); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = ""
		context["msg"] = "Something went wrong JSON format"
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Cari buku berdasarkan kode buku
	var book model.Book
	if err := database.DBConn.Where("kode_buku = ?", requestBody.KodeBuku).First(&book).Error; err != nil {
		return err
	}

	// Ambil informasi pengguna yang meminjam
	var user model.User
	if err := database.DBConn.First(&user).Error; err != nil {
		return err
	}

	// Periksa apakah buku sudah dipinjam sebelumnya
	var existingPeminjaman model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND is_pinjam = ?", book.ID, true).First(&existingPeminjaman).Error; err == nil {
		context["statusText"] = "Error"
		context["msg"] = "Buku sedang dipinjam"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Simpan peminjaman ke database
	peminjaman := model.Peminjaman{
		BookID:    book.ID,
		UserID:    user.ID,
		CreatedAt: time.Now(),
		IsPinjam:  true,
	}

	if err := database.DBConn.Create(&peminjaman).Error; err != nil {
		return err
	}

	context["msg"] = "Buku Berhasil Dipinjam."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku

	return c.Status(201).JSON(context)
}
