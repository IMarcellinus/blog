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

	app.Get("/", controller.WelcomeBlog)
	app.Get("/api/blog/:id", controller.BlogListById)
	app.Get("/api/blog", controller.BlogList)
	app.Post("/api/blog", controller.BlogCreate)
	app.Put("/api/blog/:id", controller.BlogUpdate)
	app.Delete("/api/blog/:id", controller.BlogDelete)
	// Auth
	app.Post("api/login", controller.Login)
	app.Post("api/register", controller.Register)

	private := app.Group("/api")

	private.Use(middleware.Authenticate)

	private.Get("/refreshtoken", controller.RefreshToken)

}
