// database.go

package database

import (
	"log"
	"os"

	"github.com/IMarcellinus/blog/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DBConn *gorm.DB

func ConnectDB() {

	user := os.Getenv("db_user")
	password := os.Getenv("db_pass")
	dbname := os.Getenv("db_name")

	dsn := user + ":" + password + "@tcp(localhost:3306)/" + dbname + "?charset=utf8mb4&parseTime=True&loc=Local"
	// dsn := "root:root123@tcp(localhost)/fiber_blog?charset=utf8mb4&parseTime=True&loc=Local"
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
