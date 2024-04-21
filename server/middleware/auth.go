package middleware

import (
	"strings"

	"github.com/IMarcellinus/blog/helper"
	"github.com/gofiber/fiber/v2"
)

const SecretKey = "secret"

// func Authenticate(c *fiber.Ctx) error {
// 	cookie := c.Cookies("token")
// 	if cookie == "" {
// 		return c.Status(401).JSON(fiber.Map{"error": "Token not present."})
// 	}

// 	// Memvalidasi token
// 	claims, msg := helper.ValidateToken(cookie)
// 	if msg != "" {
// 		return c.Status(401).JSON(fiber.Map{"error": msg})
// 	}

// 	// Menetapkan username ke dalam lokal context
// 	c.Locals("username", claims.Username)
// 	c.Locals("userid", claims.UserId)

// 	return c.Next()
// }

func Authenticate(c *fiber.Ctx) error {
	// Mendapatkan header Authorization
	authHeader := c.Get("Authorization")
	// Mengecek apakah header Authorization ada dan berformat "Bearer token"
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: Bearer token missing"})
	}
	// Mendapatkan token dari header
	token := strings.Split(authHeader, " ")[1]

	// Memvalidasi token
	claims, msg := helper.ValidateToken(token)
	if msg != "" {
		return c.Status(401).JSON(fiber.Map{"error": msg})
	}

	// Menetapkan username ke dalam lokal context
	c.Locals("username", claims.Username)
	c.Locals("userid", claims.UserId)

	return c.Next()
}
