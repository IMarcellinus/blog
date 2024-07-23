package controller

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
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
	Nim           string     `json:"nim"`
	CreatedAt     time.Time  `json:"created_at"`
	ReturnAt      *time.Time `json:"return_at"`  // Changed to *time.Time
	ExpiredAt     *time.Time `json:"expired_at"` // Changed to *time.Time
	Duration      *string    `json:"duration"`   // Added Duration
	Rating        uint       `json:"rating"`     // Added Rating
	IsPinjam      bool       `json:"is_pinjam"`
	IsReservation bool       `json:"is_reservation"`
}

type ReservationResponse struct {
	ID            uint       `json:"id"`
	BookID        uint       `json:"book_id"`
	UserID        uint       `json:"user_id"`
	Book          model.Book `json:"book"`
	Mahasiswa     string     `json:"mahasiswa"`
	Nim           string     `json:"nim"`
	CreatedAt     string     `json:"created_at"`
	ReturnAt      *string    `json:"return_at,omitempty"`
	ExpiredAt     *string    `json:"expired_at,omitempty"`
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
	username, usernameExists := c.Locals("username").(string)
	log.Println(username)
	if !usernameExists {
		log.Println("username key not found.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "username not found."})
	}

	// Get the NIM from Local storage
	nim, nimExists := c.Locals("nim").(string)
	log.Println(nim)
	if !nimExists {
		log.Println("Nim key not found.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Nim not found."})
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

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		context := fiber.Map{
			"msg":         "error decoding keyword",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		// Ensure the keyword is correctly parsed and spaces are handled
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR users.nim LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
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
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt, // ReturnAt is now a pointer
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
			Duration:      p.Duration,
		}

		// If the role is admin, include all details from the Peminjaman model and the user's username
		if role == "admin" {
			borrowInfo.Mahasiswa = p.User.Username // Use the username from p.User
			borrowInfo.Nim = p.User.Nim            // Use the nim from p.User
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
	username, usernameExists := c.Locals("username").(string)
	log.Println(username)
	if !usernameExists {
		log.Println("username key not found.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "username not found."})
	}

	// Get the NIM from Local storage
	nim, nimExists := c.Locals("nim").(string)
	log.Println(nim)
	if !nimExists {
		log.Println("Nim key not found.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Nim not found."})
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
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt, // ReturnAt is now a pointer
			IsPinjam:      p.IsPinjam,
			Rating:        p.Rating,
			IsReservation: p.IsReservation,
			ExpiredAt:     p.ExpiredAt,
			Duration:      p.Duration,
		}

		// If the role is admin, include all details from the Peminjaman model and the user's username
		if role == "admin" {
			borrowInfo.Mahasiswa = p.User.Username // Use the username from p.User
			borrowInfo.Nim = p.User.Nim            // Use the username from p.User
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

func GetBorrowBookAsc(c *fiber.Ctx) error {
	// Retrieve pagination parameters from URL path parameters
	page := c.Params("page")
	perPage := c.Params("perPage")

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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{})

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Count the total number of records
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

	// Fetch the records with pagination
	var Peminjaman []model.Peminjaman
	if err := query.Preload("Book").Preload("User").Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			ExpiredAt:     p.ExpiredAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with IsPinjam=true on top and CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		if borrowInfoList[i].IsPinjam && !borrowInfoList[j].IsPinjam {
			return true
		}
		if !borrowInfoList[i].IsPinjam && borrowInfoList[j].IsPinjam {
			return false
		}
		// For tie-breaking, compare CreatedAt using Before method
		return borrowInfoList[i].CreatedAt.Before(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookAscPagination(c *fiber.Ctx) error {
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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{})

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		context := fiber.Map{
			"msg":         "Error decoding keyword",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		// Ensure the keyword is correctly parsed and spaces are handled
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR users.nim LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
	}

	// Count the total number of records
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

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			ExpiredAt:     p.ExpiredAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with IsPinjam=true on top and CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		if borrowInfoList[i].IsPinjam && !borrowInfoList[j].IsPinjam {
			return true
		}
		if !borrowInfoList[i].IsPinjam && borrowInfoList[j].IsPinjam {
			return false
		}
		// For tie-breaking, compare CreatedAt using Before method
		return borrowInfoList[i].CreatedAt.Before(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookDesc(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")

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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{})

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role == "admin" {
		// No additional query constraints for admins
	} else {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Count total data
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

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			ExpiredAt:     p.ExpiredAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with IsPinjam=false on top and CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		if !borrowInfoList[i].IsPinjam && borrowInfoList[j].IsPinjam {
			return true
		}
		if borrowInfoList[i].IsPinjam && !borrowInfoList[j].IsPinjam {
			return false
		}
		// For tie-breaking, compare CreatedAt using Before method
		return borrowInfoList[i].CreatedAt.After(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookDescPagination(c *fiber.Ctx) error {
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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{})

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role == "admin" {
		// No additional query constraints for admins
	} else {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Error decoding keyword",
			"status_code": http.StatusBadRequest,
		})
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		// Ensure the keyword is correctly parsed and spaces are handled
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR users.nim LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
	}

	// Count total data
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

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			ExpiredAt:     p.ExpiredAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with IsPinjam=false on top and CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		if !borrowInfoList[i].IsPinjam && borrowInfoList[j].IsPinjam {
			return true
		}
		if borrowInfoList[i].IsPinjam && !borrowInfoList[j].IsPinjam {
			return false
		}
		// For tie-breaking, compare CreatedAt using Before method
		return borrowInfoList[i].CreatedAt.After(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookPaginationByUser(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")
	keyword := c.Params("keyword") // Dapatkan kata kunci dari parameter URL

	numPage, err := strconv.Atoi(page)
	if err != nil || numPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Nomor halaman tidak valid",
			"status_code": http.StatusBadRequest,
		})
	}

	numPerPage, err := strconv.Atoi(perPage)
	if err != nil || numPerPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Jumlah per halaman tidak valid",
			"status_code": http.StatusBadRequest,
		})
	}

	context := fiber.Map{
		"status_code": "200",
		"msg":         "Dapatkan Daftar Peminjaman Buku",
	}

	// Dapatkan username dari Local storage
	username, usernameExists := c.Locals("username").(string)
	log.Println(username)
	if !usernameExists {
		log.Println("Kunci username tidak ditemukan.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Username tidak ditemukan."})
	}

	// Dapatkan NIM dari Local storage
	nim, nimExists := c.Locals("nim").(string)
	log.Println(nim)
	if !nimExists {
		log.Println("Kunci NIM tidak ditemukan.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "NIM tidak ditemukan."})
	}

	// Dapatkan userID dari pengguna yang sedang login
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID tidak ditemukan dalam konteks"})
	}

	// Dapatkan peran dari Local storage
	role, exists := c.Locals("role").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Peran tidak ditemukan dalam konteks"})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{})

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Peran tidak sah"})
	}

	// Decode kata kunci untuk menangani spasi
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		context := fiber.Map{
			"msg":         "Kesalahan saat mendecode kata kunci",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	// Terapkan filter kata kunci jika diberikan
	if decodedKeyword != "" {
		// Pastikan kata kunci di-parse dengan benar dan spasi ditangani
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR users.nim LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
	}

	query.Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "Tidak ada catatan peminjaman ditemukan",
			"status_code": http.StatusNotFound,
		})
	}

	if numPage > totalPage {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Nomor halaman di luar jangkauan",
			"status_code": http.StatusBadRequest,
		})
	}

	offset := (numPage - 1) * numPerPage

	var Peminjaman []model.Peminjaman
	if err := query.Preload("Book").Preload("User").Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Buat slice untuk menyimpan informasi peminjaman
	borrowInfoList := []BorrowInfo{}

	// Loop melalui setiap objek Peminjaman dan isi informasi peminjaman
	for _, p := range Peminjaman {
		borrowInfo := BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username, // Gunakan username dari pengguna yang sedang login
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			IsPinjam:      p.IsPinjam,
			Rating:        p.Rating,
			IsReservation: p.IsReservation,
			Duration:      p.Duration,
		}

		// Jika peran adalah admin, sertakan semua detail dari model Peminjaman dan username pengguna
		if role == "admin" {
			borrowInfo.Mahasiswa = p.User.Username // Gunakan username dari p.User
			borrowInfo.Nim = p.User.Nim            // Gunakan NIM dari p.User
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
		"msg":         "Dapatkan Daftar Peminjaman Buku",
	}

	// Dapatkan username dari Local storage
	username, usernameExists := c.Locals("username").(string)
	log.Println(username)
	if !usernameExists {
		log.Println("Kunci username tidak ditemukan.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Username tidak ditemukan."})
	}

	// Dapatkan NIM dari Local storage
	nim, nimExists := c.Locals("nim").(string)
	log.Println(nim)
	if !nimExists {
		log.Println("Kunci NIM tidak ditemukan.")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "NIM tidak ditemukan."})
	}

	// Dapatkan userID dari pengguna yang sedang login
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID tidak ditemukan dalam konteks"})
	}

	// Dapatkan peran dari Local storage
	role, exists := c.Locals("role").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Peran tidak ditemukan dalam konteks"})
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

	// Buat slice untuk menyimpan informasi peminjaman
	borrowInfoList := []BorrowInfo{}

	// Loop melalui setiap objek Peminjaman dan isi informasi peminjaman
	for _, p := range Peminjaman {
		var returnAt *time.Time
		if p.ReturnAt != nil {
			returnAt = p.ReturnAt // Gunakan pointer langsung
		}

		// Tentukan username yang akan digunakan berdasarkan peran
		mahasiswa := username
		if role == "admin" {
			mahasiswa = p.User.Username
			nim = p.User.Nim
		}

		borrowInfo := BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     mahasiswa, // Gunakan username yang ditentukan
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			Rating:        p.Rating,
			ReturnAt:      returnAt,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
			Duration:      p.Duration,
		}

		borrowInfoList = append(borrowInfoList, borrowInfo)
	}

	// Periksa apakah borrowInfoList kosong
	if len(borrowInfoList) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "Tidak ada catatan peminjaman ditemukan",
			"status_code": http.StatusNotFound,
		})
	}

	context["data"] = borrowInfoList

	return c.JSON(context)
}

func GetBorrowBookAscByUser(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")

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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Preload("Book").Preload("User")

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Count total data
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
	if err := query.Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		return borrowInfoList[i].CreatedAt.After(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookAscByUserPagination(c *fiber.Ctx) error {
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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Preload("Book").Preload("User")

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Error decoding keyword",
			"status_code": http.StatusBadRequest,
		})
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR users.nim LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
	}

	// Count total data
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
	if err := query.Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		return borrowInfoList[i].CreatedAt.After(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookDescByUser(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")

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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Preload("Book").Preload("User")

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Count total data
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
	if err := query.Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		return borrowInfoList[i].CreatedAt.Before(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBookDescByUserPagination(c *fiber.Ctx) error {
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

	// Retrieve data from context
	username, usernameExists := c.Locals("username").(string)
	nim, nimExists := c.Locals("nim").(string)
	userID, userIDExists := c.Locals("userid").(uint)
	role, roleExists := c.Locals("role").(string)

	if !usernameExists || !nimExists || !userIDExists || !roleExists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"msg": "Required context data not found."})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Preload("Book").Preload("User")

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Unauthorized role"})
	}

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		context := fiber.Map{
			"msg":         "error decoding keyword",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword)
	}

	// Count total data
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
	if err := query.Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create and fill the borrowing information list
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))
	for i, p := range Peminjaman {
		borrowInfoList[i] = BorrowInfo{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     username,
			Nim:           nim,
			CreatedAt:     p.CreatedAt,
			ReturnAt:      p.ReturnAt,
			Duration:      p.Duration,
			Rating:        p.Rating,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		if role == "admin" {
			borrowInfoList[i].Mahasiswa = p.User.Username
			borrowInfoList[i].Nim = p.User.Nim
		}
	}

	// Sort the list with CreatedAt for tie-breaking
	sort.SliceStable(borrowInfoList, func(i, j int) bool {
		return borrowInfoList[i].CreatedAt.Before(borrowInfoList[j].CreatedAt)
	})

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

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

	// Check if the user has already borrowed 5 books
	var borrowCount int64
	if err := database.DBConn.Model(&model.Peminjaman{}).Where("user_id = ? AND is_pinjam = ?", user.ID, true).Count(&borrowCount).Error; err != nil {
		log.Println("Error while counting borrow records:", err)
		context["msg"] = "Failed to count borrow records."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}
	if borrowCount >= 5 {
		context["msg"] = "You have already borrowed 5 books."
		context["status_code"] = "409"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Check if the book is already borrowed
	var existingPeminjaman model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND is_pinjam = ?", book.ID, true).First(&existingPeminjaman).Error; err == nil {
		context["msg"] = "Buku sedang dipinjam"
		context["status_code"] = "409"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	if err := database.DBConn.Where("book_id = ? AND is_reservation = ?", book.ID, true).First(&existingPeminjaman).Error; err == nil {
		if existingPeminjaman.IsReservation {
			existingPeminjaman.IsReservation = false
			existingPeminjaman.IsPinjam = true
			existingPeminjaman.ExpiredAt = nil
			if err := database.DBConn.Save(&existingPeminjaman).Error; err != nil {
				log.Println("Error while updating reservation:", err)
				context["msg"] = "Failed to update reservation."
				context["status_code"] = "500"
				return c.Status(fiber.StatusInternalServerError).JSON(context)
			}
			context["msg"] = "Reservation updated to borrowing."
			context["Nama Mahasiswa"] = username
			context["Kode Buku"] = book.KodeBuku
			context["IsReservation"] = existingPeminjaman.IsReservation
			return c.Status(fiber.StatusOK).JSON(context)
		}
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
		context["msg"] = "Something went wrong with JSON format"
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
	if err := database.DBConn.First(&user, "username = ?", username).Error; err != nil {
		log.Println("Error while fetching user:", err)
		context["msg"] = "Error while fetching user."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Check if the user has already borrowed 5 books
	var borrowCount int64
	if err := database.DBConn.Model(&model.Peminjaman{}).Where("user_id = ? AND is_pinjam = ?", user.ID, true).Count(&borrowCount).Error; err != nil {
		log.Println("Error while counting borrow records:", err)
		context["msg"] = "Failed to count borrow records."
		context["status_code"] = "500"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}
	if borrowCount >= 5 {
		context["msg"] = "You have already borrowed 5 books."
		context["status_code"] = "409"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Check if the book is already borrowed
	var borrowedBook model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND is_pinjam = 1 AND return_at IS NULL", book.ID).First(&borrowedBook).Error; err == nil {
		context["msg"] = "Buku sedang dipinjam"
		context["status_code"] = "409"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Check if the book is already reserved
	var existingReservation model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND is_reservation = 1 AND expired_at > ?", book.ID, time.Now()).First(&existingReservation).Error; err == nil {
		context["msg"] = "Buku sedang direservasi"
		context["status_code"] = "409"
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

func GetReservationBook(c *fiber.Ctx) error {
	db := database.DBConn

	var peminjaman []model.Peminjaman
	result := db.Preload("Book").Preload("User").Where("is_reservation = ? AND expired_at IS NOT NULL", true).Find(&peminjaman)
	if result.Error != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"msg":         "Failed to retrieve reservations",
			"status_code": "500",
		})
	}

	// Handle case where no reservation records are found
	if len(peminjaman) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No reservation records found",
			"status_code": "404",
		})
	}

	var response []ReservationResponse
	for _, p := range peminjaman {
		createdAt := p.CreatedAt.Format(time.RFC3339)
		var returnAt, expiredAt *string
		if p.ReturnAt != nil {
			rt := p.ReturnAt.Format(time.RFC3339)
			returnAt = &rt
		}
		if p.ExpiredAt != nil {
			et := p.ExpiredAt.Format(time.RFC3339)
			expiredAt = &et
		}
		response = append(response, ReservationResponse{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     p.User.Username, // Assuming User.Username holds "mahasiswa"
			Nim:           p.User.Nim,      // Assuming User.Username holds "Nim"
			CreatedAt:     createdAt,
			ReturnAt:      returnAt,
			ExpiredAt:     expiredAt,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		})
	}

	return c.JSON(fiber.Map{
		"data":        response,
		"msg":         "Get Reservation Book List",
		"status_code": "200",
	})
}

func GetReservationBookPagination(c *fiber.Ctx) error {
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

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Where("is_reservation = ? AND expired_at IS NOT NULL", true) // Only include records where IsReservation is true and expired_at is not null

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		context := fiber.Map{
			"msg":         "Error decoding keyword",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		// Ensure the keyword is correctly parsed and spaces are handled
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR users.nim LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
	}

	query.Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No reservation records found",
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

	var peminjaman []model.Peminjaman
	if err := query.Preload("Book").Preload("User").Offset(offset).Limit(numPerPage).Find(&peminjaman).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"msg":         "Failed to retrieve reservations",
			"status_code": "500",
		})
	}

	var response []ReservationResponse
	for _, p := range peminjaman {
		createdAt := p.CreatedAt.Format(time.RFC3339)
		var returnAt, expiredAt *string
		if p.ReturnAt != nil {
			rt := p.ReturnAt.Format(time.RFC3339)
			returnAt = &rt
		}
		if p.ExpiredAt != nil {
			et := p.ExpiredAt.Format(time.RFC3339)
			expiredAt = &et
		}
		response = append(response, ReservationResponse{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     p.User.Username, // Assuming User.Username holds "mahasiswa"
			Nim:           p.User.Nim,
			CreatedAt:     createdAt,
			ReturnAt:      returnAt,
			ExpiredAt:     expiredAt,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		})
	}

	return c.JSON(fiber.Map{
		"data":        response,
		"msg":         "Get Reservation Book List",
		"status_code": "200",
		"total_page":  totalPage,
		"page_now":    numPage,
		"limit":       numPerPage,
	})
}

func GetReservationBookByUser(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Get Reservation Book List",
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
	query := db.Model(&model.Peminjaman{}).Preload("Book").Preload("User").Where("user_id = ? AND is_reservation = ? AND expired_at IS NOT NULL", userID, true)

	if role == "admin" {
		query = db.Model(&model.Peminjaman{}).Preload("Book").Preload("User").Where("is_reservation = ? AND expired_at IS NOT NULL", true)
	}

	if err := query.Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Create a slice to store reservation information
	reservationInfoList := []ReservationResponse{}

	// Loop through each Peminjaman object and fill in the reservation information
	for _, p := range Peminjaman {
		createdAt := p.CreatedAt.Format(time.RFC3339)
		var returnAt, expiredAt *string
		if p.ReturnAt != nil {
			rt := p.ReturnAt.Format(time.RFC3339)
			returnAt = &rt
		}
		if p.ExpiredAt != nil {
			et := p.ExpiredAt.Format(time.RFC3339)
			expiredAt = &et
		}

		// Determine the username to use based on the role
		mahasiswa := username
		if role == "admin" {
			mahasiswa = p.User.Username
		}

		reservationInfo := ReservationResponse{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     mahasiswa,
			Nim:           p.User.Nim,
			CreatedAt:     createdAt,
			ReturnAt:      returnAt,
			ExpiredAt:     expiredAt,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		reservationInfoList = append(reservationInfoList, reservationInfo)
	}

	// Check if reservationInfoList is empty
	if len(reservationInfoList) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"data":        []ReservationResponse{},
			"msg":         "No reservation records found",
			"status_code": http.StatusNotFound,
		})
	}

	context["data"] = reservationInfoList

	return c.JSON(context)
}

func GetReservationBookPaginationByUser(c *fiber.Ctx) error {
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
		"msg":         "Get Reservation Book List",
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
	query := db.Model(&model.Peminjaman{}).Where("user_id = ? AND is_reservation = ? AND expired_at IS NOT NULL", userID, true)

	if role == "admin" {
		query = db.Model(&model.Peminjaman{}).Where("is_reservation = ? AND expired_at IS NOT NULL", true)
	}

	// Decode the keyword to handle spaces
	decodedKeyword, err := url.QueryUnescape(keyword)
	if err != nil {
		context := fiber.Map{
			"msg":         "Error decoding keyword",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	// Apply keyword filter if provided
	if decodedKeyword != "" {
		// Ensure the keyword is correctly parsed and spaces are handled
		parsedKeyword := "%" + strings.ReplaceAll(decodedKeyword, " ", "%") + "%"
		query = query.Joins("JOIN books ON books.id = peminjamen.book_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ? OR books.kategori_buku LIKE ?", parsedKeyword, parsedKeyword, parsedKeyword, parsedKeyword)
	}

	query.Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"data":        []ReservationResponse{},
			"msg":         "No reservation records found",
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
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"msg":         "Failed to retrieve reservations",
			"status_code": "500",
		})
	}

	// Create a slice to store reservation information
	reservationInfoList := []ReservationResponse{}

	// Loop through each Peminjaman object and fill in the reservation information
	for _, p := range Peminjaman {
		createdAt := p.CreatedAt.Format(time.RFC3339)
		var returnAt, expiredAt *string
		if p.ReturnAt != nil {
			rt := p.ReturnAt.Format(time.RFC3339)
			returnAt = &rt
		}
		if p.ExpiredAt != nil {
			et := p.ExpiredAt.Format(time.RFC3339)
			expiredAt = &et
		}

		// Determine the username to use based on the role
		mahasiswa := username
		if role == "admin" {
			mahasiswa = p.User.Username
		}

		reservationInfo := ReservationResponse{
			ID:            p.ID,
			BookID:        p.BookID,
			UserID:        p.UserID,
			Book:          p.Book,
			Mahasiswa:     mahasiswa,
			CreatedAt:     createdAt,
			ReturnAt:      returnAt,
			ExpiredAt:     expiredAt,
			IsPinjam:      p.IsPinjam,
			IsReservation: p.IsReservation,
		}

		reservationInfoList = append(reservationInfoList, reservationInfo)
	}

	return c.JSON(fiber.Map{
		"data":        reservationInfoList,
		"msg":         "Get Reservation Book List by User",
		"status_code": "200",
		"total_page":  totalPage,
		"page_now":    numPage,
		"limit":       numPerPage,
	})
}

func ReturnBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Return a Book",
	}

	// Getting username and role from local storage
	username, usernameExists := c.Locals("username").(string)
	role, roleExists := c.Locals("role").(string)

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

	// Getting borrowing ID from parameters
	peminjamanID := c.Params("id")

	// Retrieve borrowing information by ID
	var peminjaman model.Peminjaman
	if err := database.DBConn.First(&peminjaman, peminjamanID).Error; err != nil {
		log.Println("Error while fetching peminjaman:", err)
		context["msg"] = "Error while fetching peminjaman."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Retrieve user information
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		log.Println("Error while fetching user:", err)
		context["msg"] = "Error while fetching user."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Check user role
	if role == "user" {
		if peminjaman.UserID != user.ID || !peminjaman.IsPinjam {
			context["status_code"] = "400"
			context["msg"] = "Buku tidak dipinjam oleh pengguna ini atau status peminjaman tidak sesuai"
			return c.Status(fiber.StatusBadRequest).JSON(context)
		}
	} else if role == "admin" {
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

	// Parse the rating from the request body
	var input struct {
		Rating *uint `json:"rating"` // Pointer to allow nil values
	}
	if err := c.BodyParser(&input); err != nil {
		context["msg"] = "Invalid input."
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Check if the rating is nil or not provided
	if input.Rating == nil {
		context["msg"] = "Rating is required."
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Calculate duration between created_at and current time (as return_at)
	var durationStr *string
	if !peminjaman.CreatedAt.IsZero() {
		returnAt := time.Now() // Assuming the book is being returned now
		duration := returnAt.Sub(peminjaman.CreatedAt)
		log.Printf("Calculated duration: %v\n", duration)
		hours := int(duration.Hours())
		minutes := int(duration.Minutes()) % 60
		seconds := int(duration.Seconds()) % 60
		formattedDuration := fmt.Sprintf("%02d:%02d:%02d", hours, minutes, seconds)
		durationStr = &formattedDuration
		log.Printf("Formatted duration: %s\n", formattedDuration)
	} else {
		log.Println("ReturnAt or CreatedAt is not set, skipping duration calculation.")
	}

	// Update borrowing status, return time, and duration
	if err := database.DBConn.Model(&peminjaman).Updates(map[string]interface{}{
		"is_pinjam": false,
		"return_at": time.Now(),
		"rating":    input.Rating,
		"duration":  durationStr,
	}).Error; err != nil {
		log.Println("Error while updating peminjaman:", err)
		context["msg"] = "Error while updating peminjaman."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Fetch the returned book's information
	var book model.Book
	if err := database.DBConn.First(&book, peminjaman.BookID).Error; err != nil {
		log.Println("Error while fetching book:", err)
		context["msg"] = "Error while fetching book."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	context["msg"] = "Buku Berhasil Dikembalikan."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku
	context["Returned At"] = time.Now() // Updated to current time
	context["Rating"] = *input.Rating
	if durationStr != nil {
		context["Duration"] = *durationStr // Duration in "hours:minutes:seconds" format
	}

	log.Printf("ReturnAt: %v, CreatedAt: %v", peminjaman.ReturnAt, peminjaman.CreatedAt)

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
		{"name": "Buku tersedia", "total": availableBooks},
		{"name": "Buku tidak tersedia (sedang dipinjam)", "total": borrowedNotReturned},
	}

	// Add data to context
	context["data"] = data

	// Return JSON response
	return c.Status(fiber.StatusOK).JSON(context)
}
