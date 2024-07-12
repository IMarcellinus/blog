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
	app.Get("/", controller.WelcomeApi)
	app.Post("api/login", controller.Login)
	app.Post("api/register", controller.Register)
	app.Get("api/logout", controller.Logout)
	app.Post("api/loginmobile", controller.LoginMobile)
	app.Post("api/loginuser", controller.ScanUser)
	// Auth Admin
	private := app.Group("/api")
	// Middleware menggunakan cookies jwt
	private.Use(middleware.Authenticate)
	private.Get("/active-account", controller.GetActiveUsersCount)
	private.Get("/available-books", controller.GetTotalAvailableBooks)
	// Fetch User
	private.Get("/user", controller.RefreshToken)
	// Fetch Dashboard
	private.Get("/dashboard-all", controller.DataManagementList)
	// Book CRUD
	private.Get("/book", controller.BookList)
	private.Get("/book/:page/:perPage/:keyword?", controller.BookPagination)
	private.Get("/book/:page/:perPage/", controller.BookPagination)
	private.Post("/book", controller.BookCreate)
	private.Put("/book/:id", controller.BookUpdate)
	private.Delete("/book/:id", controller.BookDelete)
	// Search Book
	// private.Get("/book/search/:search", controller.SearchBooks)
	// Borrow Book
	private.Get("/borrowbook", controller.GetBorrowBook)
	private.Get("/borrowbookuser", controller.GetBorrowBookByUser)
	private.Get("/borrowbook/:page/:perPage/:keyword", controller.GetBorrowBookPagination)
	private.Get("/borrowbook/:page/:perPage", controller.GetBorrowBookPagination)
	private.Get("/borrowbookuser/:page/:perPage/:keyword", controller.GetBorrowBookPaginationByUser)
	private.Get("/borrowbookuser/:page/:perPage", controller.GetBorrowBookPaginationByUser)
	private.Post("/reservationbook", controller.ReservationBook)
	private.Get("/reservationbook", controller.GetReservationBook)
	private.Get("/reservationbookuser", controller.GetReservationBookByUser)
	private.Get("/reservationbookuser/:page/:perPage/:keyword", controller.GetReservationBookByUser)
	private.Get("/reservationbook/:page/:perPage/:keyword?", controller.GetReservationBookPagination)
	private.Post("/borrowbook", controller.BorrowBook)
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
	private.Get("/barcode/:id", controller.GenerateQRCodeFromUser)
	// User CRUD
	private.Get("/users", controller.UserList)
	private.Get("/getuser/:id", controller.GetUserByID)
	private.Get("/users/:page/:perPage/:keyword", controller.UserPagination)
	private.Get("/users/:page/:perPage/", controller.UserPagination)
	private.Post("/users", controller.UserCreate)
	private.Put("/users/:id", controller.UserUpdate)
	private.Delete("/users/:id", controller.UserDelete)
	private.Put("/change-password", controller.ChangePassword)

}
