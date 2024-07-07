package controller

import (
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
