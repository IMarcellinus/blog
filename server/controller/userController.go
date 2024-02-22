package controller

import (
	"log"

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
		"msg":    "Login Route",
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
		returnObject["msg"] = "Invalid Password."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
	}

	returnObject["token"] = token
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

func Logout() {

}

func RefreshToken(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "Ok",
		"msg":    "Refresh Token Route",
	}

	return c.Status(fiber.StatusOK).JSON(returnObject)
}
