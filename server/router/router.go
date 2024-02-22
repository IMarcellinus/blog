package router

import (
	"github.com/IMarcellinus/blog/controller"
	"github.com/IMarcellinus/blog/middleware"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	// list => get
	// add => post
	// update => put
	// delete => delete

	// Auth
	app.Post("api/login", controller.Login)
	app.Post("api/register", controller.Register)

	private := app.Group("/api")

	private.Use(middleware.Authenticate)

	private.Get("/refreshtoken", controller.RefreshToken)

	private.Get("/", controller.WelcomeBlog)
	private.Get("/blog/:id", controller.BlogListById)
	private.Get("/blog", controller.BlogList)
	private.Post("/blog", controller.BlogCreate)
	private.Put("/blog/:id", controller.BlogUpdate)
	private.Delete("/blog/:id", controller.BlogDelete)
}
