// blogController.go

package controller

import (
	"log"
	"math"
	"strconv"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

func WelcomeBlog(c *fiber.Ctx) error {

	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Welcome to Server SILAPER",
	}

	c.Status(200)
	return c.JSON(context)
}

func BlogList(c *fiber.Ctx) error {

	time.Sleep(time.Millisecond * 500)

	db := database.DBConn

	var records []model.Blog

	db.Find(&records)

	context := fiber.Map{
		"blog":       records,
		"statusText": "Ok",
		"msg":        "Blog List",
	}

	// context["blog_records"] = records

	c.Status(200)
	return c.JSON(context)
}

func SearchBlogList(c *fiber.Ctx) error {
	// Get path parameter 'keyword' for search
	keyword := c.Params("keyword")

	// Sleep for demonstration purposes
	time.Sleep(time.Millisecond * 500)

	db := database.DBConn

	var records []model.Blog

	// If there's a keyword, perform search, else fetch all records
	if keyword != "" {
		db.Where("title LIKE ? OR post LIKE ?", "%"+keyword+"%", "%"+keyword+"%").Find(&records)
	} else {
		db.Find(&records)
	}

	context := fiber.Map{
		"blog":       records,
		"statusText": "Ok",
		"msg":        "Blog List",
	}

	c.Status(200)
	return c.JSON(context)
}

func BlogListPagination(c *fiber.Ctx) error {
	currentPage, err := strconv.Atoi(c.Params("currentpage"))
	if err != nil || currentPage < 1 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid current page",
		})
	}

	totalPages, err := strconv.Atoi(c.Params("totalpages"))
	if err != nil || totalPages < 1 {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid total pages",
		})
	}

	db := database.DBConn
	var totalRecords int64
	db.Model(&model.Blog{}).Count(&totalRecords)

	// Calculate total pages based on total records and limit (10)
	totalPages = int(math.Ceil(float64(totalRecords) / 10))

	// Ensure current page does not exceed total pages
	if currentPage > totalPages {
		currentPage = totalPages
	}

	// Calculate offset and limit based on current page
	limit := 10
	offset := (currentPage - 1) * limit

	var records []model.Blog

	// Fetch paginated records from the database
	db.Offset(offset).Limit(limit).Find(&records)

	context := fiber.Map{
		"blog":        records,
		"statusText":  "Ok",
		"msg":         "Blog List",
		"currentpage": currentPage,
		"totalpages":  totalPages,
	}

	return c.Status(200).JSON(context)

}

func BlogListById(c *fiber.Ctx) error {
	c.Status(400)

	id := c.Params("id")

	var record model.Blog

	database.DBConn.First(&record, id)

	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Blog Detail",
	}

	if record.ID == 0 {
		log.Println("Record not found.")
		context["statusText"] = ""
		context["msg"] = "Blog data not Found."
		c.Status(400)
	} else {
		c.Status(200)
		context["blog"] = record
	}

	if err := c.BodyParser(&record); err != nil {
		log.Println("Error in parsing request.")
	}

	// c.Status(200)

	return c.JSON(context)
}

func BlogCreate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Add a Blog List",
	}

	// var formBlog formBlog

	record := new(model.Blog)

	if err := c.BodyParser(&record); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = ""
		context["msg"] = "Something went wrong"
	}

	// Check if Title and Post are empty
	if record.Title == "" || record.Post == "" {
		context["statusText"] = ""
		context["msg"] = "Title and Post cannot be empty"
		return c.Status(400).JSON(context)
	}

	result := database.DBConn.Create(record)

	if result.Error != nil {
		log.Println("Error in saving data.")
	}

	context["msg"] = "Record is saved successfully."
	context["data"] = record

	c.Status(201)
	return c.JSON(context)

}

func BlogUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Update Blog List",
	}

	id := c.Params("id")

	var record model.Blog

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
	}

	result := database.DBConn.Save(&record)

	if result.Error != nil {
		log.Println("Error in update data.")
	}

	context["msg"] = "Record updated success."
	context["data"] = record

	c.Status(200)

	return c.JSON(context)

}

func BlogDelete(c *fiber.Ctx) error {
	c.Status(400)

	context := fiber.Map{
		"statusText": "",
		"msg":        "",
	}

	id := c.Params("id")

	var record model.Blog

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
