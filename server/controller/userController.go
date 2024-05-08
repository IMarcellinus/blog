package controller

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/helper"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
	"github.com/skip2/go-qrcode"
	"golang.org/x/crypto/bcrypt"
)

type formData struct {
	Username string `json:"username"`
	Password string `json:"password"`
	CodeQr   string `json:"codeqr"`
	Role     string `json:"role"`
}

// Function Login
func Login(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "Ok",
		"msg":    "Something went wrong.",
	}

	// Check user for the given credentials

	var formData formData

	// Parse JSON request body
	if err := c.BodyParser(&formData); err != nil {
		log.Println("Error in json binding.")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	// Add formdata to model
	user := new(model.User)
	// var user model.User

	database.DBConn.First(&user, "username = ?", formData.Username)

	if user.ID == 0 {
		returnObject["msg"] = "User not found."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusBadRequest).JSON(returnObject)
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(formData.Password))

	if err != nil {
		log.Println("Invalid Password.")
		returnObject["msg"] = "Invalid Password."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
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
	returnObject["msg"] = "Success Login."
	returnObject["status"] = "Ok."

	c.Status(200)
	return c.JSON(returnObject)
}

// Function Register
func Register(c *fiber.Ctx) error {
	// Collect form data
	var formData formData

	// Parse JSON request body
	if err := c.BodyParser(&formData); err != nil {
		log.Println("Error in json binding.")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	// Set default value for Role if not provided
	if formData.Role == "" {
		formData.Role = "user"
	}

	// Validate input
	if formData.Username == "" || formData.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Username and password cannot be empty",
		})
	}

	// Check if the username already exists
	existingUser := model.User{}
	if err := database.DBConn.Where("username = ?", formData.Username).First(&existingUser).Error; err == nil {
		// Username already exists
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Account already exists",
		})
	}

	// Create QR code from user data
	userData, err := json.Marshal(formData)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code",
		})
	}

	qr, err := qrcode.Encode(string(userData), qrcode.Medium, 256)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code",
		})
	}

	// Save QR code to database
	// Simpan QR code di sini ke dalam database, misalnya dalam bentuk byte slice

	// Decode QR code using MD5
	hasher := md5.New()
	hasher.Write([]byte(qr))
	codeQr := hex.EncodeToString(hasher.Sum(nil))

	// Create user in database
	user := model.User{
		Username:  formData.Username,
		Password:  helper.HashPassword(formData.Password),
		Role:      formData.Role,
		CodeQr:    codeQr,                          // Save decoded QR code to CodeQr column
		CreatedAt: time.Now().Format("02-01-2006"), // Set the CreatedAt field with the specified date format
		// Jika Anda menyimpan QR code dalam database, tambahkan QR code di sini
	}

	result := database.DBConn.Create(&user)
	if result.Error != nil {
		log.Println(result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to create user",
		})
	}

	// Create QR code from CodeQr column
	qrFromCodeQr, err := qrcode.Encode(user.CodeQr, qrcode.Medium, 256)
	if err != nil {
		log.Println("Error generating QR code from CodeQr:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code from CodeQr",
		})
	}

	base64.StdEncoding.EncodeToString(qrFromCodeQr)

	fmt.Println("QR code:", qrFromCodeQr)

	response := &fiber.Map{
		"status":    "Ok",
		"baseImage": base64.StdEncoding.EncodeToString(qrFromCodeQr),
	}

	// Return success response with QR code
	return c.Status(fiber.StatusOK).JSON(response)
}

// Function Logout
func Logout(c *fiber.Ctx) error {
	// Cek jika JWT sudah kosong
	if c.Cookies("token") == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Already logged out.",
		})
	}

	// Set cookie JWT dengan nilai kosong dan waktu kedaluwarsa yang sudah lewat
	cookie := fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
	}

	// Menetapkan cookie
	c.Cookie(&cookie)

	// Respons berhasil
	return c.Status(200).JSON(fiber.Map{
		"status": "Ok",
		"msg":    "Success Logout",
	})
}

// Function get fetch user now login
func RefreshToken(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "OK",
		"msg":    "Success Fetch User",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		returnObject["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
	}

	// Mencari pengguna berdasarkan username
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		// Jika terjadi kesalahan saat mencari user
		log.Println("Error while fetching user:", err)
		returnObject["msg"] = "Error while fetching user."
		return c.Status(fiber.StatusInternalServerError).JSON(returnObject)
	}

	// Memastikan user ditemukan
	if user.ID == 0 {
		returnObject["msg"] = "User not found."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusBadRequest).JSON(returnObject)
	}

	// Generate token baru
	token, err := helper.GenerateToken(user)
	if err != nil {
		log.Println("Error while generating token:", err)
		returnObject["msg"] = "Error while generating token."
		return c.Status(fiber.StatusInternalServerError).JSON(returnObject)
	}

	// Menyimpan token dan informasi user ke dalam response
	returnObject["token"] = token
	returnObject["user"] = user
	returnObject["status_code"] = "200"

	return c.Status(fiber.StatusOK).JSON(returnObject)
}
