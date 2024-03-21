package controller

import (
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
	}

	if record.NamaBuku == "" || record.KodeBuku == "" {
		context["statusText"] = ""
		context["msg"] = "nama buku and kode buku cannot be empty"
		return c.Status(400).JSON(context)
	}

	result := database.DBConn.Create(record)

	if result.Error != nil {
		log.Println("Error in saving data.")
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
		"statusText": "",
		"msg":        "",
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
