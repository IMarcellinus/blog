package middleware

import (
	"strings"

	"github.com/IMarcellinus/blog/helper"
	"github.com/gofiber/fiber/v2"
)

const SecretKey = "secret"

func Authenticate(c *fiber.Ctx) error {
	// Get the Authorization header
	authHeader := c.Get("Authorization")
	// Check if the Authorization header exists and is in the format "Bearer token"
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: Bearer token missing", "status_code": 401})
	}
	// Get the token from the header
	token := strings.Split(authHeader, " ")[1]

	// Validate the token
	claims, msg := helper.ValidateToken(token)
	if msg != "" {
		return c.Status(401).JSON(fiber.Map{"error": msg, "status_code": 401})
	}

	// Set the username, role, and userid in the local context
	c.Locals("username", claims.Username)
	c.Locals("role", claims.Role)
	c.Locals("userid", claims.UserId)

	return c.Next()
}
