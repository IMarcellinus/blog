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

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")
	dbhost := os.Getenv("DB_HOST")
	dbport := os.Getenv("DB_PORT")
	dbcharset := os.Getenv("DB_CHARSET")
	dbloc := os.Getenv("DB_LOC")

	dsn := user + ":" + password + "@tcp(" + dbhost + ":" + dbport + ")/" + dbname + "?charset=" + dbcharset + "&parseTime=True&loc=" + dbloc
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})

	if err != nil {
		panic("Database connection failed")
	}

	log.Println("Connection Successfull.")

	// db.AutoMigrate(new(model.Blog))
	db.AutoMigrate(new(model.User))
	db.AutoMigrate(new(model.Book))
	db.AutoMigrate(new(model.Peminjaman))

	DBConn = db
}
