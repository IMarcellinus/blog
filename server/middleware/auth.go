package middleware

import (
	"github.com/IMarcellinus/blog/helper"
	"github.com/gofiber/fiber/v2"
)

const SecretKey = "secret"

func Authenticate(c *fiber.Ctx) error {
	cookie := c.Cookies("jwt")
	if cookie == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Token not present."})
	}

	// Memvalidasi token
	claims, msg := helper.ValidateToken(cookie)
	if msg != "" {
		return c.Status(401).JSON(fiber.Map{"error": msg})
	}

	// Menetapkan username ke dalam lokal context
	c.Locals("username", claims.Username)
	c.Locals("userid", claims.UserId)

	return c.Next()
}
