package controller

import (
	"net/http"
	"strconv"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
	"github.com/skip2/go-qrcode"
)

func GenerateQRCodeFromUser(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).SendString("Invalid ID")
	}

	// Query data pengguna dari database berdasarkan ID
	var user model.User
	if err := database.DBConn.First(&user, id).Error; err != nil {
		return c.Status(http.StatusNotFound).SendString("User not found")
	}

	// Membuat QR code dari kolom CodeQr
	qr, err := qrcode.Encode(user.CodeQr, qrcode.Medium, 256)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("Error generating QR code")
	}

	// Mengatur header respons
	c.Set("Content-Type", "image/png")

	// Mengirimkan gambar QR code sebagai respons
	return c.Send(qr)
}
