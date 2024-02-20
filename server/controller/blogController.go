// blogController.go

package controller

import (
	"log"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

func WelcomeBlog(c *fiber.Ctx) error {

	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Welcome to my CRUD Golang",
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

	record := new(model.Blog)

	if err := c.BodyParser(&record); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = ""
		context["msg"] = "Something went wrong"
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
