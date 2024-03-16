package controller

import (
	"encoding/json"
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

	// Query the user from the database
	var user model.User
	if err := database.DBConn.First(&user, id).Error; err != nil {
		return c.Status(http.StatusNotFound).SendString("User not found")
	}

	// Convert user data to JSON
	userData, err := json.Marshal(user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("Error generating QR code")
	}

	// Generate QR code from user data
	qr, err := qrcode.Encode(string(userData), qrcode.Medium, 256)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("Error generating QR code")
	}

	// Set response headers
	c.Set("Content-Type", "image/png")

	// Send QR code image as response
	return c.Send(qr)
}
