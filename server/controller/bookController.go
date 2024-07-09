package controller

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

func BookList(c *fiber.Ctx) error {

	time.Sleep(time.Millisecond * 500)

	// Pengaturan koneksi database
	db := database.DBConn

	// Mengambil semua data buku dari database
	var records []model.Book
	db.Find(&records)

	// Membuat konteks dengan status code dan pesan
	context := fiber.Map{
		"status_code": fiber.StatusOK,
		"msg":         "Book List",
	}

	// Menambahkan data buku ke dalam konteks
	context["book"] = records

	// Mengirimkan respons JSON
	return c.Status(200).JSON(context)
}

func BookPagination(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")
	keyword := c.Params("keyword")

	numPage, _ := strconv.Atoi(page)
	numPerPage, _ := strconv.Atoi(perPage)

	if numPerPage <= 0 {
		context := fiber.Map{
			"msg":         "error limit cannot less than 1",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	time.Sleep(time.Millisecond * 500)

	db := database.DBConn

	var books []model.Book

	query := db

	// Mengecek apakah parameter keyword tidak kosong
	if keyword != "" {
		query = query.Where("nama_buku LIKE ? OR kode_buku LIKE ? OR tanggal_pengesahan LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var totalData int64
	query.Model(&model.Book{}).Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		context := fiber.Map{
			"msg":         "no books found",
			"status_code": http.StatusNotFound,
		}
		return c.Status(http.StatusNotFound).JSON(context)
	}

	offset := (numPage - 1) * numPerPage
	query = query.Offset(offset).Limit(numPerPage)

	if err := query.Find(&books).Error; err != nil {
		context := fiber.Map{
			"msg":         "error retrieving books",
			"status_code": http.StatusInternalServerError,
		}
		return c.Status(http.StatusInternalServerError).JSON(context)
	}

	if numPage <= 0 || numPage > totalPage {
		context := fiber.Map{
			"msg":         "error page number out of range",
			"status_code": http.StatusBadRequest,
		}
		return c.Status(http.StatusBadRequest).JSON(context)
	}

	context := fiber.Map{
		"limit":       numPerPage,
		"books":       books,
		"status_code": fiber.StatusOK,
		"message":     "success getting books per page",
		"total_page":  totalPage,
		"page_now":    numPage,
	}

	return c.Status(fiber.StatusOK).JSON(context)

}

func getBookCodeByID(id uint) string {
	return fmt.Sprintf("A%d", id)
}

// function for BookCreate
func BookCreate(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": fiber.StatusCreated,
		"msg":         "Add a Book List",
	}

	record := new(model.Book)

	if err := c.BodyParser(&record); err != nil {
		log.Println("Error in parsing request.")
		context["status_code"] = "400"
		context["msg"] = "Something went wrong JSON format"
		return c.Status(400).JSON(context)
	}

	if record.NamaBuku == "" {
		context["status_code"] = "400"
		context["msg"] = "nama buku cannot be empty"
		return c.Status(400).JSON(context)
	}

	if record.KategoriBuku == "" {
		context["status_code"] = "400"
		context["msg"] = "kategori buku cannot be empty"
		return c.Status(400).JSON(context)
	}

	// Mengonversi string tanggal pengesahan ke dalam format time.Time
	tanggalPengesahan, err := time.Parse("2006-01-02", record.TanggalPengesahan)
	if err != nil {
		log.Println("Error in parsing tanggal pengesahan:", err)
		context["status_code"] = fiber.StatusBadRequest // Menggunakan status code 400 Bad Request
		context["msg"] = "Invalid tanggal pengesahan format. Please use format yyyy/MM/dd"
		return c.Status(400).JSON(context)
	}

	// Set TanggalPengesahan field
	record.TanggalPengesahan = tanggalPengesahan.Format("2006-01-02") // Format: tahun-bulan-tanggal

	// Set CreatedAt field
	record.CreatedAt = time.Now().Format("2006-01-02")

	result := database.DBConn.Create(record)

	if result.Error != nil {
		log.Println("Error in saving data:", result.Error)
		context["status_code"] = "500"
		context["msg"] = "Error in saving data"
		return c.Status(500).JSON(context)
	}

	// Set the book code based on the book ID
	record.KodeBuku = getBookCodeByID(record.ID)

	// Update the record with the generated book code
	result = database.DBConn.Save(record)
	if result.Error != nil {
		log.Println("Error in updating data:", result.Error)
		context["status_code"] = "500"
		context["msg"] = "Error in updating data"
		return c.Status(500).JSON(context)
	}

	context["msg"] = "Record is saved successfully."
	context["data"] = record

	return c.Status(201).JSON(context)
}

// Function Book Update
func BookUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Update a Book List",
	}

	id := c.Params("id")

	record := new(model.Book)

	database.DBConn.First(&record, id)

	if record.ID == 0 {
		log.Println("Record not found.")
		context["status_code"] = "400"
		context["msg"] = "Record not Found."
		c.Status(400)
		return c.JSON(context)
	}

	// Parsing body request
	updatedRecord := new(model.Book)
	if err := c.BodyParser(updatedRecord); err != nil {
		log.Println("Error in parsing request.")
		context["status_code"] = "400"
		context["msg"] = "Something went wrong JSON format"
		return c.Status(400).JSON(context)
	}

	// Validate if kode_buku is provided
	if updatedRecord.KodeBuku != "" {
		log.Println("Error: kode_buku cannot be updated.")
		context["status_code"] = "400"
		context["msg"] = "Kode Buku cannot be updated."
		return c.Status(400).JSON(context)
	}

	// Update only nama_buku, tanggal_pengesahan, and kategori_buku
	record.NamaBuku = updatedRecord.NamaBuku
	record.TanggalPengesahan = updatedRecord.TanggalPengesahan
	record.KategoriBuku = updatedRecord.KategoriBuku

	// Validating tanggal_pengesahan format
	_, err := time.Parse("2006-01-02", record.TanggalPengesahan)
	if err != nil {
		log.Println("Error in parsing tanggal pengesahan:", err)
		context["status_code"] = "400"
		context["msg"] = "Invalid tanggal pengesahan format. Please use format yyyy-MM-dd"
		return c.Status(400).JSON(context)
	}

	// Save updated record to database
	result := database.DBConn.Save(record)

	if result.Error != nil {
		log.Println("Error in update data.")
		context["status_code"] = "500"
		context["msg"] = "Error in updating data"
		return c.Status(500).JSON(context)
	}

	context["msg"] = "Record is updated successfully."
	context["data"] = record

	return c.Status(200).JSON(context)
}

// Function Book Delete
func BookDelete(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Delete Book",
	}

	id := c.Params("id")

	var record model.Book

	// Find the record by ID
	if err := database.DBConn.First(&record, id).Error; err != nil {
		log.Println("Record not found.")
		context["status_code"] = "400"
		context["msg"] = "Record not found."
		c.Status(400)
		return c.JSON(context)
	}

	// Delete related Peminjaman records
	if err := database.DBConn.Where("book_id = ?", id).Delete(&model.Peminjaman{}).Error; err != nil {
		log.Println("Error in deleting related Peminjaman records:", err)
		context["status_code"] = "500"
		context["msg"] = "Error in deleting related Peminjaman records."
		c.Status(500)
		return c.JSON(context)
	}

	// Soft delete the record
	if err := database.DBConn.Delete(&record).Error; err != nil {
		log.Println("Error in deleting record:", err)
		context["status_code"] = "500"
		context["msg"] = "Error in deleting record."
		c.Status(500)
		return c.JSON(context)
	}

	context["status_code"] = "200"
	context["msg"] = "Record deleted successfully."
	c.Status(200)

	return c.JSON(context)
}
