package controller

import (
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

func DataManagementList(c *fiber.Ctx) error {
	db := database.DBConn

	var totalPeminjaman int64
	var totalBook int64
	var totalUser int64

	// Count total number of peminjaman
	if err := db.Model(&model.Peminjaman{}).Count(&totalPeminjaman).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status_code": fiber.StatusInternalServerError,
			"message":     "failed to get total peminjaman",
		})
	}

	// Count total number of books
	if err := db.Model(&model.Book{}).Count(&totalBook).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status_code": fiber.StatusInternalServerError,
			"message":     "failed to get total books",
		})
	}

	// Count total number of users with role 'user'
	if err := db.Model(&model.User{}).Where("role = ?", "user").Count(&totalUser).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status_code": fiber.StatusInternalServerError,
			"message":     "failed to get total users",
		})
	}

	data := []fiber.Map{
		{"name": "peminjaman", "total": totalPeminjaman},
		{"name": "book", "total": totalBook},
		{"name": "user", "total": totalUser},
	}

	returnObject := fiber.Map{
		"status_code": 200,
		"message":     "success getting total all data for dashboard",
		"data":        data,
	}

	return c.Status(fiber.StatusOK).JSON(returnObject)
}

func GetBooksBorrowedByProdiThisMonth(c *fiber.Ctx) error {
	db := database.DBConn

	type Result struct {
		Prodi      string `json:"prodi"`
		TotalBooks int    `json:"total_books"`
	}

	results := []Result{}
	var prodiList []string

	// Get distinct prodi from User model
	if err := db.Model(&model.User{}).Distinct("prodi").Pluck("prodi", &prodiList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status_code": fiber.StatusInternalServerError,
			"message":     "failed to get distinct prodi",
		})
	}

	// Get current month's start and end date
	currentTime := time.Now()
	startDate := time.Date(currentTime.Year(), currentTime.Month(), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0)

	for _, prodi := range prodiList {
		var totalBooks int64
		if err := db.Table("peminjamen").
			Joins("JOIN users ON users.id = peminjamen.user_id").
			Where("users.prodi = ? AND peminjamen.created_at BETWEEN ? AND ?", prodi, startDate, endDate).
			Count(&totalBooks).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status_code": fiber.StatusInternalServerError,
				"message":     "failed to get total books borrowed",
			})
		}

		results = append(results, Result{
			Prodi:      prodi,
			TotalBooks: int(totalBooks),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status_code": 200,
		"message":     "success getting books borrowed by prodi",
		"data":        results,
	})
}
