package controller

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/helper"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
	"github.com/skip2/go-qrcode"
)

type formBarcode struct {
	Username string `json:"username"`
	Password string `json:"password"`
	CodeQr   string `json:"codeqr"`
}

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

	// Set Accept header
	c.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")

	// Mengatur header respons
	c.Set("Content-Type", "image/png")

	// Mengirimkan gambar QR code sebagai respons
	return c.Send(qr)
}

func ScanUser(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "Ok",
		"msg":    "Something went wrong.",
	}

	var formBarcode formBarcode

	// Parse JSON request body
	if err := c.BodyParser(&formBarcode); err != nil {
		log.Println("Error in json binding.")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	// Add formdata to model
	user := new(model.User)

	database.DBConn.First(&user, "codeqr = ?", formBarcode.CodeQr)

	if user.ID == 0 {
		returnObject["msg"] = "User not found."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusBadRequest).JSON(returnObject)
	}

	token, err := helper.GenerateToken(*user)

	if err != nil {
		returnObject["msg"] = "Could not Login."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
	}

	cookie := fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24),
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	returnObject["token"] = token
	returnObject["user"] = user
	returnObject["msg"] = "Success Scan Barcode."
	returnObject["status"] = "Ok."

	return c.Status(200).JSON(returnObject)
}
