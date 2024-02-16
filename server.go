package main

import (
	"github.com/IMarcellinus/blog/server/database"
	"github.com/gofiber/fiber/v2"
)

func init() {
	database.ConnectDB()
}

func main() {

	sqlDb, err := database.DBConn.DB()

	if err != nil {
		panic("Error in sql connection.")
	}

	defer sqlDb.Close()

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {

		return c.JSON(fiber.Map{"message": "Welcome to my CRUD Blog Ignacy"})

	})

	app.Listen(":8080")
}
