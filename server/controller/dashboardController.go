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

	db.Model(&model.Peminjaman{}).Count(&totalPeminjaman)
	db.Model(&model.Book{}).Count(&totalBook)
	db.Model(&model.User{}).Count(&totalUser)

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
