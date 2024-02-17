package controller

import (
	"github.com/IMarcellinus/blog/server/database"
	"github.com/IMarcellinus/blog/server/model"
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

	db := database.DBConn

	var records model.Blog

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

func BlogCreate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Add a Blog List",
	}

	c.Status(201)
	return c.JSON(context)

}

func BlogUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Update Blog List",
	}
	c.Status(200)

	return c.JSON(context)

}

func BlogDelete(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Delete Blog List",
	}
	c.Status(200)

	return c.JSON(context)
}
