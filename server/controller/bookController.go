package controller

import (
	"fmt"
	"log"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

func BookList(c *fiber.Ctx) error {

	time.Sleep(time.Millisecond * 500)

	db := database.DBConn

	var records []model.Book

	db.Find(&records)

	context := fiber.Map{
		"book":       records,
		"statusText": "Ok",
		"msg":        "Book List",
	}

	c.Status(200)
	return c.JSON(context)
}

func getBookCodeByID(id uint) string {
	return fmt.Sprintf("A%d", id)
}

// function for BookCreate
func BookCreate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Add a Book List",
	}

	record := new(model.Book)

	if err := c.BodyParser(&record); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = ""
		context["msg"] = "Something went wrong JSON format"
		return c.Status(400).JSON(context)
	}

	if record.NamaBuku == "" {
		context["statusText"] = ""
		context["msg"] = "nama buku cannot be empty"
		return c.Status(400).JSON(context)
	}

	// Mengonversi string tanggal pengesahan ke dalam format time.Time
	tanggalPengesahan, err := time.Parse("02-01-2006", record.TanggalPengesahan)
	if err != nil {
		log.Println("Error in parsing tanggal pengesahan:", err)
		context["statusText"] = ""
		context["msg"] = "Invalid tanggal pengesahan format. Please use format dd-mm-yyyy"
		return c.Status(400).JSON(context)
	}

	// Set TanggalPengesahan field
	record.TanggalPengesahan = tanggalPengesahan.Format("02-01-2006")

	// Set CreatedAt field
	record.CreatedAt = time.Now().Format("02-01-2006")

	result := database.DBConn.Create(record)

	if result.Error != nil {
		log.Println("Error in saving data:", result.Error)
		context["statusText"] = ""
		context["msg"] = "Error in saving data"
		return c.Status(500).JSON(context)
	}

	// Set the book code based on the book ID
	record.KodeBuku = getBookCodeByID(record.ID)

	// Update the record with the generated book code
	result = database.DBConn.Save(record)
	if result.Error != nil {
		log.Println("Error in updating data:", result.Error)
		context["statusText"] = ""
		context["msg"] = "Error in updating data"
		return c.Status(500).JSON(context)
	}

	context["msg"] = "Record is saved successfully."
	context["data"] = record

	return c.Status(201).JSON(context)
}

func BookUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Update a Book List",
	}

	id := c.Params("id")

	record := new(model.Book)

	database.DBConn.First(&record, id)

	if record.ID == 0 {
		log.Println("Record not found.")
		context["statusText"] = ""
		context["msg"] = "Record not Found."
		c.Status(400)
		return c.JSON(context)
	}

	if err := c.BodyParser(&record); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = ""
		context["msg"] = "Something went wrong JSON format"
	}

	result := database.DBConn.Save(record)

	if result.Error != nil {
		log.Println("Error in update data.")
	}

	context["msg"] = "Record is update successfully."
	context["data"] = record

	return c.Status(201).JSON(context)
}

func BookDelete(c *fiber.Ctx) error {
	c.Status(400)

	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Delete Book",
	}

	id := c.Params("id")

	var record model.Book

	database.DBConn.First(&record, id)

	if record.ID == 0 {
		log.Println("Record not found.")
		context["statusText"] = ""
		context["msg"] = "Record not Found."
		c.Status(400)
		return c.JSON(context)
	}

	result := database.DBConn.Delete(record)

	if result.Error != nil {
		log.Println("Error in update data.")
		return c.JSON(context)
	}

	context["statusText"] = "Ok."
	context["msg"] = "Record delete success."
	c.Status(200)

	return c.JSON(context)
}

func SearchBooks(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Search Borrow Book List",
	}
	// Mendapatkan nilai parameter dari URL
	param := c.Params("search")

	db := database.DBConn

	// Mencari buku berdasarkan parameter yang diberikan
	var books []model.Book
	if err := db.Where("nama_buku LIKE ? OR kode_buku LIKE ? OR tanggal_pengesahan LIKE ?", "%"+param+"%", "%"+param+"%", "%"+param+"%").Find(&books).Error; err != nil {
		// Menangani kesalahan jika terjadi
		context["statusText"] = "Error"
		context["msg"] = "Failed to search books"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Mengembalikan daftar buku yang sesuai dengan kriteria pencarian
	if len(books) == 0 {
		// Menangani kasus jika tidak ada buku yang ditemukan
		context["statusText"] = "Not Found"
		context["msg"] = "No books found for the search query"
		return c.Status(fiber.StatusNotFound).JSON(context)
	}

	context["book"] = books

	return c.Status(fiber.StatusOK).JSON(context)

}
