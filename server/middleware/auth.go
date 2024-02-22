package middleware

import (
	"log"

	"github.com/IMarcellinus/blog/helper"
	"github.com/gofiber/fiber/v2"
)

func Authenticate(c *fiber.Ctx) error {
	token := c.Get("token")

	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token not present.",
		})
	}

	claims, msg := helper.ValidateToken(token)

	log.Println(claims)

	if msg != "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": msg,
		})
	}

	return c.Next()
}
