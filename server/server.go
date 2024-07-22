package main

import (
	"log"
	"os"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/database/seeders"
	"github.com/IMarcellinus/blog/router"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	"github.com/urfave/cli/v2"
)

func init() {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatal("Error in loading .env file.")
	}
	database.ConnectDB()
}

func runServer() {
	port := os.Getenv("PORT")
	sqlDb, err := database.DBConn.DB()
	if err != nil {
		panic("Error in sql connection.")
	}
	defer sqlDb.Close()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	app.Use(logger.New())
	router.SetupRoutes(app)

	log.Println("Starting server on port", port)
	if err := app.Listen(port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func main() {
	cliApp := &cli.App{
		Name:  "blog",
		Usage: "CLI Tool for Blog Application",
		Commands: []*cli.Command{
			{
				Name:    "seed",
				Aliases: []string{"s"},
				Usage:   "Seed the database",
				Action: func(c *cli.Context) error {
					if err := seeders.DBSeed(database.DBConn); err != nil {
						return err
					}
					log.Println("Database seeded successfully!")
					return nil
				},
			},
		},
		Action: func(c *cli.Context) error {
			runServer()
			return nil
		},
	}

	err := cliApp.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
