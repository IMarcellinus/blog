package main

import (
	"log"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/router"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error in loading .env file.")
	}
	database.ConnectDB()
}

func main() {
	sqlDb, err := database.DBConn.DB()
	if err != nil {
		panic("Error in sql connection.")
	}
	defer sqlDb.Close()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization", // Menambahkan Authorization ke AllowHeaders
	}))

	app.Use(logger.New())

	router.SetupRoutes(app)

	app.Listen(":8080")
}
