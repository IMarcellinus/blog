package controller

import (
	"log"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/helper"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type formData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

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
		Name:     "jwt",
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

func Register(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "Ok",
	}

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

	// Add formdata to model
	user := new(model.User)

	user.Username = formData.Username
	user.Password = helper.HashPassword(formData.Password)

	result := database.DBConn.Create(&user)

	if result.Error != nil {
		log.Println(result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to create user",
		})
	}

	returnObject["data"] = user
	returnObject["msg"] = "Register Successfully"

	// Return success response
	return c.Status(fiber.StatusOK).JSON(returnObject)

}

func Logout(c *fiber.Ctx) error {
	// Cek jika JWT sudah kosong
	if c.Cookies("jwt") == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Already logged out.",
		})
	}

	// Set cookie JWT dengan nilai kosong dan waktu kedaluwarsa yang sudah lewat
	cookie := fiber.Cookie{
		Name:     "jwt",
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

func RefreshToken(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "OK",
		"msg":    "Refresh Token Route",
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

	return c.Status(fiber.StatusOK).JSON(returnObject)
}
