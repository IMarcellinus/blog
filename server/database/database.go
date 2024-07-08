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
	log.Println(dbport)

	// Check for missing environment variables
	if user == "" || dbname == "" || dbhost == "" || dbport == "" || dbcharset == "" || dbloc == "" {
		log.Fatal("Missing one or more required environment variables")
	}

	// Use environment variables in DSN
	dsn := user + ":" + password + "@tcp(" + dbhost + ":" + dbport + ")/" + dbname + "?charset=" + dbcharset + "&parseTime=True&loc=" + dbloc
	log.Println("DSN:", dsn) // Log the DSN for debugging purposes

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})

	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	log.Println("Connection Successful.")

	// db.AutoMigrate(new(model.Blog))
	db.AutoMigrate(new(model.User))
	db.AutoMigrate(new(model.Book))
	db.AutoMigrate(new(model.Peminjaman))

	DBConn = db
}
