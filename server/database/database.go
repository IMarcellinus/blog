package database

import (
	"log"

	"github.com/IMarcellinus/blog/server/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DBConn *gorm.DB

func ConnectDB() {
	dsn := "root:root123@tcp(localhost:3306)/fiber_blog?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})

	if err != nil {
		panic("Database connection failed")
	}

	log.Println("Connection Successfull.")

	db.AutoMigrate(new(model.Blog))

	DBConn = db
}
