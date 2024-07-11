package controller

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

type BorrowInfo struct {
	ID            uint       `json:"id"`
	BookID        uint       `json:"book_id"` // Changed to *uint
	UserID        uint       `json:"user_id"`
	Book          model.Book `json:"book"`
	Mahasiswa     string     `json:"mahasiswa"`
	CreatedAt     time.Time  `json:"created_at"`
	ReturnAt      *time.Time `json:"return_at"` // Changed to *time.Time
	ExpiredAt     *time.Time `json:"ExpiredAt"` // Changed to *time.Time
	IsPinjam      bool       `json:"is_pinjam"`
	IsReservation bool       `json:"is_reservation"`
}

func GetBorrowBookPagination(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")
	keyword := c.Params("keyword") // Get keyword from URL path parameters

	numPage, err := strconv.Atoi(page)
	if err != nil || numPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Invalid page number",
			"status_code": http.StatusBadRequest,
		})
	}

	numPerPage, err := strconv.Atoi(perPage)
	if err != nil || numPerPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Invalid perPage number",
			"status_code": http.StatusBadRequest,
		})
	}

	context := fiber.Map{
		"status_code": "200",
		"msg":         "Get Borrow Book List",
	}

	// Get the username from Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Check if username exists
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Get the userID of the logged-in user
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID not found in context"})
	}

	// Get the role from Local storage
	role, exists := c.Locals("role").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Role not found in context"})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{})

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Apply keyword filter if provided
	if keyword != "" {
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No borrow records found",
			"status_code": http.StatusNotFound,
		})
	}

	if numPage > totalPage {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Page number out of range",
			"status_code": http.StatusBadRequest,
		})
	}

	offset := (numPage - 1) * numPerPage

	var Peminjaman []model.Peminjaman
	if err := query.Preload("Book").Preload("User").Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create a slice to store borrowing information
	borrowInfoList := []BorrowInfo{}

	// Loop through each Peminjaman object and fill in the borrowing information
	for _, p := range Peminjaman {
		// Handle pointer dereferencing
		borrowInfo := BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID, // BookID is now a pointer
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username, // Use the username of the logged-in user
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt, // ReturnAt is now a pointer
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		// If the role is admin, include all details from the Peminjaman model and the user's username
		if role == "admin" {
			borrowInfo.Mahasiswa = p.User.Username // Use the username from p.User
		}

		borrowInfoList = append(borrowInfoList, borrowInfo)
	}

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Get Borrow Book List",
	}

	// Get the username from Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Check if username exists
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Get the userID of the logged-in user
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID not found in context"})
	}

	// Get the role from Local storage
	role, exists := c.Locals("role").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Role not found in context"})
	}

	var Peminjaman []model.Peminjaman
	if role == "user" {
		if err := database.DBConn.Preload("Book").Preload("User").Where("user_id = ?", userID).Find(&Peminjaman).Error; err != nil {
			return err
		}
	} else if role == "admin" {
		if err := database.DBConn.Preload("Book").Preload("User").Find(&Peminjaman).Error; err != nil {
			return err
		}
	} else {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Create a slice to store borrowing information
	borrowInfoList := []BorrowInfo{}

	// Loop through each Peminjaman object and fill in the borrowing information
	for _, p := range Peminjaman {
		borrowInfo := BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID, // BookID is now a pointer
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username, // Use the username of the logged-in user
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt, // ReturnAt is now a pointer
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
			ExpiredAt:     p.ExpiredAt,
		}

		// If the role is admin, include all details from the Peminjaman model and the user's username
		if role == "admin" {
			borrowInfo.Mahasiswa = p.User.Username // Use the username from p.User
		}

		borrowInfoList = append(borrowInfoList, borrowInfo)
	}

	// Check if borrowInfoList is empty
	if len(borrowInfoList) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No borrow records found",
			"status_code": http.StatusNotFound,
		})
	}

	context["data"] = borrowInfoList

	return c.JSON(context)
}

func GetBorrowBookPaginationByUser(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")
	keyword := c.Params("keyword") // Get keyword from URL path parameters

	numPage, err := strconv.Atoi(page)
	if err != nil || numPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Invalid page number",
			"status_code": http.StatusBadRequest,
		})
	}

	numPerPage, err := strconv.Atoi(perPage)
	if err != nil || numPerPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Invalid perPage number",
			"status_code": http.StatusBadRequest,
		})
	}

	context := fiber.Map{
		"status_code": "200",
		"msg":         "Get Borrow Book List",
	}

	// Get the username from Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Check if username exists
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Get the userID of the logged-in user
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID not found in context"})
	}

	// Get the role from Local storage
	role, exists := c.Locals("role").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Role not found in context"})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Where("is_pinjam = ?", true) // Only include records where IsPinjam is true

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Apply keyword filter if provided
	if keyword != "" {
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No borrow records found",
			"status_code": http.StatusNotFound,
		})
	}

	if numPage > totalPage {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Page number out of range",
			"status_code": http.StatusBadRequest,
		})
	}

	offset := (numPage - 1) * numPerPage

	var Peminjaman []model.Peminjaman
	if err := query.Preload("Book").Preload("User").Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create a slice to store borrowing information
	borrowInfoList := []BorrowInfo{}

	// Loop through each Peminjaman object and fill in the borrowing information
	for _, p := range Peminjaman {
		borrowInfo := BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID, // BookID is now a pointer
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username, // Use the username of the logged-in user
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt, // ReturnAt is now a pointer
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		// If the role is admin, include all details from the Peminjaman model and the user's username
		if role == "admin" {
			borrowInfo.Mahasiswa = p.User.Username // Use the username from p.User
		}

		borrowInfoList = append(borrowInfoList, borrowInfo)
	}

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookByUser(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Get Borrow Book List",
	}

	// Get the username from Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Check if username exists
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Get the userID of the logged-in user
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID not found in context"})
	}

	// Get the role from Local storage
	role, exists := c.Locals("role").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Role not found in context"})
	}

	db := database.DBConn

	var Peminjaman []model.Peminjaman
	query := db.Model(&model.Peminjaman{}).Preload("Book").Preload("User").Where("user_id = ?", userID)

	if role == "admin" {
		query = db.Model(&model.Peminjaman{}).Preload("Book").Preload("User")
	}

	if err := query.Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create a slice to store borrowing information
	borrowInfoList := []BorrowInfo{}

	// Loop through each Peminjaman object and fill in the borrowing information
	for _, p := range Peminjaman {
		if !p.IsPinjam {
			continue // Skip entries where IsPinjam is false
		}

		var returnAt *time.Time
		if p.ReturnAt != nil {
			returnAt = p.ReturnAt // Use the pointer directly
		}

		// Determine the username to use based on the role
		mahasiswa := username
		if role == "admin" {
			mahasiswa = p.User.Username
		}

		borrowInfo := BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     mahasiswa, // Use the determined username
			CreatedAt:     p.CreatedAt,
			ReturnAt:      returnAt,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		borrowInfoList = append(borrowInfoList, borrowInfo)
	}

	// Check if borrowInfoList is empty
	if len(borrowInfoList) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No borrow records found",
			"status_code": http.StatusNotFound,
		})
	}

	context["data"] = borrowInfoList

	return c.JSON(context)
}

func BorrowBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Add a Book List",
	}

	// Get the username from Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Check if username exists
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Parse request body JSON
	var requestBody struct {
		KodeBuku string `json:"kode_buku"`
		UserID   uint   `json:"user_id"`
	}

	if err := c.BodyParser(&requestBody); err != nil {
		log.Println("Error in parsing request:", err)
		context["status_code"] = "400"
		context["msg"] = "Something went wrong JSON format"
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Check if kode_buku is provided
	if requestBody.KodeBuku == "" {
		log.Println("kode_buku is required.")
		context["status_code"] = "400"
		context["msg"] = "kode_buku is required."
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Find the book based on kode_buku
	var book model.Book
	if err := database.DBConn.Where("kode_buku = ?", requestBody.KodeBuku).First(&book).Error; err != nil {
		context["msg"] = "Kode Buku not found."
		context["status_code"] = "404"
		return c.Status(fiber.StatusNotFound).JSON(context)
	}

	// Fetch user information who is borrowing
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		log.Println("Error while fetching user:", err)
		context["msg"] = "Error while fetching user."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Check if the book is already borrowed
	var existingPeminjaman model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND is_pinjam = ?", book.ID, true).First(&existingPeminjaman).Error; err == nil {
		context["msg"] = "Buku sedang dipinjam"
		context["status_code"] = "409"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Save borrowing record to the database
	peminjaman := model.Peminjaman{
		BookID:        book.ID,
		UserID:        user.ID,
		CreatedAt:     time.Now(),
		ReturnAt:      nil,
		IsPinjam:      true,
		IsReservation: false,
	}

	if err := database.DBConn.Create(&peminjaman).Error; err != nil {
		log.Println("Error while saving peminjaman:", err)
		context["msg"] = "Failed to save peminjaman."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	context["msg"] = "Buku Berhasil Dipinjam."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku
	context["IsReservation"] = peminjaman.IsReservation

	return c.Status(fiber.StatusCreated).JSON(context)
}

func ReservationBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Add a Book Reservation",
	}

	// Get the username from Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Check if username exists
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Parse request body JSON
	var requestBody struct {
		KodeBuku string `json:"kode_buku"`
		UserID   uint   `json:"user_id"`
	}

	if err := c.BodyParser(&requestBody); err != nil {
		log.Println("Error in parsing request:", err)
		context["status_code"] = "400"
		context["msg"] = "Something went wrong JSON format"
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Check if kode_buku is provided
	if requestBody.KodeBuku == "" {
		log.Println("kode_buku is required.")
		context["status_code"] = "400"
		context["msg"] = "kode_buku is required."
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Find the book based on kode_buku
	var book model.Book
	if err := database.DBConn.Where("kode_buku = ?", requestBody.KodeBuku).First(&book).Error; err != nil {
		context["msg"] = "Kode Buku not found."
		context["status_code"] = "404"
		return c.Status(fiber.StatusNotFound).JSON(context)
	}

	// Fetch user information who is reserving
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		log.Println("Error while fetching user:", err)
		context["msg"] = "Error while fetching user."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Check if the book is already borrowed or reserved
	var existingPeminjaman model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND (is_pinjam = ? OR (expired_at > ?))", book.ID, true, time.Now()).First(&existingPeminjaman).Error; err == nil {
		if existingPeminjaman.IsPinjam {
			context["msg"] = "Buku sedang dipinjam"
			context["status_code"] = "409"
		} else if existingPeminjaman.IsReservation {
			// Check if the reservation is still valid
			if existingPeminjaman.ExpiredAt != nil && existingPeminjaman.ExpiredAt.After(time.Now()) {
				context["msg"] = "Buku sedang direservasi"
				context["status_code"] = "409"
				return c.Status(fiber.StatusConflict).JSON(context)
			}
		}
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Set expiration time for the reservation (1 day from now)
	expirationTime := time.Now().Add(24 * time.Hour)

	// Save reservation record to the database
	peminjaman := model.Peminjaman{
		BookID:        book.ID,
		UserID:        user.ID,
		CreatedAt:     time.Now(),
		ExpiredAt:     &expirationTime, // Set expiration time
		IsPinjam:      false,
		IsReservation: true,
	}

	if err := database.DBConn.Create(&peminjaman).Error; err != nil {
		log.Println("Error while saving reservation:", err)
		context["msg"] = "Failed to save reservation."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Include ExpiredAt in the response JSON
	context["msg"] = "Buku Berhasil Direservasi."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku
	context["IsReservation"] = peminjaman.IsReservation
	context["ExpiredAt"] = expirationTime.Format(time.RFC3339) // Format ExpiredAt as RFC3339

	// Goroutine to monitor and update IsReservation when expired_at is passed
	go func() {
		<-time.After(time.Until(*peminjaman.ExpiredAt))

		// Fetch the latest peminjaman record from the database
		var latestPeminjaman model.Peminjaman
		if err := database.DBConn.First(&latestPeminjaman, peminjaman.ID).Error; err != nil {
			log.Println("Error while fetching latest reservation:", err)
			return
		}

		// Check if expired_at is already past
		if latestPeminjaman.ExpiredAt != nil && latestPeminjaman.ExpiredAt.Before(time.Now()) {
			latestPeminjaman.IsReservation = false
			latestPeminjaman.ExpiredAt = nil // Set expired_at to null

			if err := database.DBConn.Save(&latestPeminjaman).Error; err != nil {
				log.Println("Error while updating reservation status:", err)
				return
			}

			log.Println("Reservation status updated: IsReservation = false")
		}
	}()

	return c.Status(fiber.StatusCreated).JSON(context)
}

func ReturnBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Return a Book",
	}

	// Mendapatkan nilai username dan role dari Local storage
	username, usernameExists := c.Locals("username").(string)
	role, roleExists := c.Locals("role").(string)

	// Memeriksa keberadaan username dan role
	if !usernameExists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}
	if !roleExists {
		log.Println("role key not found.")
		context["msg"] = "role not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Mendapatkan ID peminjaman dari parameter
	peminjamanID := c.Params("id")

	// Ambil informasi peminjaman berdasarkan ID
	var peminjaman model.Peminjaman
	if err := database.DBConn.First(&peminjaman, peminjamanID).Error; err != nil {
		log.Println("Error while fetching peminjaman:", err)
		context["msg"] = "Error while fetching peminjaman."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Ambil informasi pengguna yang mengembalikan
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		log.Println("Error while fetching user:", err)
		context["msg"] = "Error while fetching user."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Periksa peran pengguna
	if role == "user" {
		// Periksa apakah buku sudah dipinjam oleh pengguna yang ingin mengembalikan
		if peminjaman.UserID != user.ID || !peminjaman.IsPinjam {
			context["status_code"] = "400"
			context["msg"] = "Buku tidak dipinjam oleh pengguna ini atau status peminjaman tidak sesuai"
			return c.Status(fiber.StatusBadRequest).JSON(context)
		}
	} else if role == "admin" {
		// Admin dapat mengembalikan buku tanpa memeriksa user ID
		if !peminjaman.IsPinjam {
			context["status_code"] = "400"
			context["msg"] = "Status peminjaman tidak sesuai"
			return c.Status(fiber.StatusBadRequest).JSON(context)
		}
	} else {
		context["status_code"] = "403"
		context["msg"] = "Invalid role."
		return c.Status(fiber.StatusForbidden).JSON(context)
	}

	// Mengupdate status peminjaman menjadi kembali dan mengatur waktu pengembalian
	if err := database.DBConn.Model(&peminjaman).Updates(map[string]interface{}{"is_pinjam": false, "return_at": time.Now()}).Error; err != nil {
		log.Println("Error while updating peminjaman:", err)
		context["msg"] = "Error while updating peminjaman."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Ambil informasi buku yang dikembalikan
	var book model.Book
	if err := database.DBConn.First(&book, peminjaman.BookID).Error; err != nil {
		log.Println("Error while fetching book:", err)
		context["msg"] = "Error while fetching book."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	context["msg"] = "Buku Berhasil Dikembalikan."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku
	context["Returned At"] = peminjaman.ReturnAt

	return c.Status(fiber.StatusOK).JSON(context)
}

func SearchPeminjaman(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Search Peminjaman List",
	}
	// Mendapatkan nilai parameter dari URL
	param := c.Params("search")

	db := database.DBConn

	// Mencari peminjaman berdasarkan parameter yang diberikan
	var peminjamans []model.Peminjaman
	if err := db.Where("(Book.kode_buku) LIKE ? OR return_at LIKE ? OR (Book.nama_buku LIKE ?)", "%"+param+"%", "%"+param+"%", "%"+param+"%").Preload("Book").Find(&peminjamans).Error; err != nil {
		// Menangani kesalahan jika terjadi
		context["status_code"] = "500"
		context["msg"] = "Failed to search peminjaman"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Mengembalikan daftar peminjaman yang sesuai dengan kriteria pencarian
	if len(peminjamans) == 0 {
		// Menangani kasus jika tidak ada peminjaman yang ditemukan
		context["status_code"] = "404"
		context["msg"] = "No peminjaman found for the search query"
		return c.Status(fiber.StatusNotFound).JSON(context)
	}

	context["peminjaman"] = peminjamans

	return c.Status(fiber.StatusOK).JSON(context)
}

func GetTotalAvailableBooks(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": 200,
		"message":     "success getting total all book borrow",
	}

	db := database.DBConn
	var totalBooks int64
	var borrowedBooks int64
	var borrowedNotReturned int64

	// Count total number of books
	if err := db.Model(&model.Book{}).Count(&totalBooks).Error; err != nil {
		context["status_code"] = http.StatusInternalServerError
		context["message"] = "failed to get total books"
		return c.Status(http.StatusInternalServerError).JSON(context)
	}

	// Count total number of borrowed books where IsPinjam is true
	if err := db.Model(&model.Peminjaman{}).Where("is_pinjam = ?", true).Count(&borrowedBooks).Error; err != nil {
		context["status_code"] = http.StatusInternalServerError
		context["message"] = "failed to get total borrowed books"
		return c.Status(http.StatusInternalServerError).JSON(context)
	}

	// Count total number of books borrowed and not returned
	if err := db.Model(&model.Peminjaman{}).Where("is_pinjam = ? AND return_at IS NULL", true).Count(&borrowedNotReturned).Error; err != nil {
		context["status_code"] = http.StatusInternalServerError
		context["message"] = "failed to get total borrowed books (not returned)"
		return c.Status(http.StatusInternalServerError).JSON(context)
	}

	availableBooks := totalBooks - borrowedBooks

	// Prepare data to return
	data := []fiber.Map{
		{"name": "available_book", "total": availableBooks},
		{"name": "not_available_book", "total": borrowedNotReturned},
	}

	// Add data to context
	context["data"] = data

	// Return JSON response
	return c.Status(fiber.StatusOK).JSON(context)
}
