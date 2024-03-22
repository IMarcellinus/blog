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
	app.Get("api/logout", controller.Logout)

	private := app.Group("/api")
	// Middleware menggunakan cookies jwt
	private.Use(middleware.Authenticate)
	// Fetch User
	private.Get("/user", controller.RefreshToken)
	// Book CRUD
	private.Get("/book", controller.BookList)
	private.Post("/book", controller.BookCreate)
	private.Put("/book/:id", controller.BookUpdate)
	private.Delete("/book/:id", controller.BookDelete)
	// Borrow Book
	private.Get("/borrowbook/", controller.GetBorrowBook)
	private.Post("/borrowbook/", controller.BorrowBook)
	private.Put("/borrowbook/:id", controller.ReturnBook)
	// Blog CRUD
	private.Get("/", controller.WelcomeBlog)
	private.Get("/blog/:id", controller.BlogListById)
	private.Get("/blog/", controller.BlogList)
	private.Get("/blog/:keyword", controller.SearchBlogList)
	private.Get("/blog/:currentpage/:totalpages", controller.BlogListPagination)
	private.Post("/blog", controller.BlogCreate)
	private.Put("/blog/:id", controller.BlogUpdate)
	private.Delete("/blog/:id", controller.BlogDelete)
	// Barcode
	private.Get("/:id", controller.GenerateQRCodeFromUser)
	private.Post("/scanuser", controller.ScanUser)
}
