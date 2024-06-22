package controller

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/helper"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
	"github.com/skip2/go-qrcode"
	"golang.org/x/crypto/bcrypt"
)

type formData struct {
	Username     string `json:"username"`
	Password     string `json:"password"`
	CodeQr       string `json:"codeqr"`
	Role         string `json:"role"`
	Nim          string `json:"nim"`
	Nama         string `json:"nama"`
	JenisKelamin string `json:"jeniskelamin"`
	Prodi        string `json:"prodi"`
}

type ChangePasswordRequest struct {
	OldPassword        string `json:"old_password"`
	NewPassword        string `json:"new_password"`
	ConfirmNewPassword string `json:"confirm_new_password"`
}

func WelcomeApi(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status_code": "200",
		"msg":         "Welcome To SILAPER API",
	}

	return c.Status(200).JSON(returnObject)
}

// Function Login
func Login(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status_code": "200",
		"msg":         "Something went wrong.",
	}

	// Check user for the given credentials

	var formData formData

	// Parse JSON request body
	if err := c.BodyParser(&formData); err != nil {
		log.Println("Error in json binding.")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	// Add formdata to model
	user := new(model.User)
	// var user model.User

	database.DBConn.First(&user, "username = ?", formData.Username)

	if user.ID == 0 {
		returnObject["msg"] = "User not found."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusBadRequest).JSON(returnObject)
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(formData.Password))

	if err != nil {
		log.Println("Invalid Password.")
		returnObject["msg"] = "Invalid Password."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
	}

	token, err := helper.GenerateToken(*user)

	if err != nil {
		returnObject["msg"] = "Could not Login."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
	}

	cookie := fiber.Cookie{
		Name:     "token",
		Value:    token,
		HTTPOnly: true,
	}

	c.Cookie(&cookie)

	returnObject["token"] = token
	returnObject["user"] = user
	returnObject["msg"] = "Success Login."
	returnObject["status"] = "Ok."

	c.Status(200)
	return c.JSON(returnObject)
}

// Function Register
func Register(c *fiber.Ctx) error {
	// Collect form data
	var formData formData

	// Parse JSON request body
	if err := c.BodyParser(&formData); err != nil {
		log.Println("Error in json binding.")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	// Log the received formData to verify the input
	log.Printf("Received formData: %+v\n", formData)

	// Set default value for Role if not provided
	if formData.Role == "" {
		formData.Role = "user"
	}

	// Validate input
	if formData.Username == "" || formData.Password == "" || formData.Nim == "" || formData.Nama == "" || formData.JenisKelamin == "" || formData.Prodi == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "username, password, nim, nama, jenis kelamin, and prodi cannot be empty",
		})
	}

	// Validate gender input
	if formData.JenisKelamin != "laki-laki" && formData.JenisKelamin != "perempuan" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Gender must be either 'laki-laki' or 'perempuan'",
		})
	}

	// Check if the username already exists
	existingUser := model.User{}
	if err := database.DBConn.Where("username = ?", formData.Username).First(&existingUser).Error; err == nil {
		// Username already exists
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Account already exists",
		})
	}

	// Create QR code from user data
	userData, err := json.Marshal(formData)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code",
		})
	}

	qr, err := qrcode.Encode(string(userData), qrcode.Medium, 256)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code",
		})
	}

	// Decode QR code using MD5
	hasher := md5.New()
	hasher.Write([]byte(qr))
	codeQr := hex.EncodeToString(hasher.Sum(nil))

	// Create user in database
	user := model.User{
		Username:     formData.Username,
		Password:     helper.HashPassword(formData.Password),
		Nim:          formData.Nim,
		Nama:         formData.Nama,
		JenisKelamin: formData.JenisKelamin,
		Prodi:        formData.Prodi,
		Role:         formData.Role,
		CodeQr:       codeQr,                          // Save decoded QR code to CodeQr column
		CreatedAt:    time.Now().Format("02-01-2006"), // Set the CreatedAt field with the specified date format
	}

	result := database.DBConn.Create(&user)
	if result.Error != nil {
		log.Println(result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to create user",
		})
	}

	// Create QR code from CodeQr column
	qrFromCodeQr, err := qrcode.Encode(user.CodeQr, qrcode.Medium, 256)
	if err != nil {
		log.Println("Error generating QR code from CodeQr:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code from CodeQr",
		})
	}

	base64.StdEncoding.EncodeToString(qrFromCodeQr)

	response := &fiber.Map{
		"status":    "Ok",
		"baseImage": base64.StdEncoding.EncodeToString(qrFromCodeQr),
		"users":     user,
	}

	// Return success response with QR code
	return c.Status(fiber.StatusOK).JSON(response)
}

// Function Logout
func Logout(c *fiber.Ctx) error {
	// Cek jika JWT sudah kosong
	if c.Cookies("token") == "" {
		return c.Status(401).JSON(fiber.Map{
			"error": "Already logged out.",
		})
	}

	// Set cookie JWT dengan nilai kosong dan waktu kedaluwarsa yang sudah lewat
	cookie := fiber.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
	}

	// Menetapkan cookie
	c.Cookie(&cookie)

	// Respons berhasil
	return c.Status(200).JSON(fiber.Map{
		"status": "Ok",
		"msg":    "Success Logout",
	})
}

// Function get fetch user now login
func RefreshToken(c *fiber.Ctx) error {
	returnObject := fiber.Map{
		"status": "OK",
		"msg":    "Success Fetch User",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		returnObject["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(returnObject)
	}

	// Mencari pengguna berdasarkan username
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		// Jika terjadi kesalahan saat mencari user
		log.Println("Error while fetching user:", err)
		returnObject["msg"] = "Error while fetching user."
		return c.Status(fiber.StatusInternalServerError).JSON(returnObject)
	}

	// Memastikan user ditemukan
	if user.ID == 0 {
		returnObject["msg"] = "User not found."
		returnObject["status"] = "Error."
		return c.Status(fiber.StatusBadRequest).JSON(returnObject)
	}

	// Generate token baru
	token, err := helper.GenerateToken(user)
	if err != nil {
		log.Println("Error while generating token:", err)
		returnObject["msg"] = "Error while generating token."
		return c.Status(fiber.StatusInternalServerError).JSON(returnObject)
	}

	// Menyimpan token dan informasi user ke dalam response
	returnObject["token"] = token
	returnObject["user"] = user
	returnObject["status_code"] = "200"

	return c.Status(fiber.StatusOK).JSON(returnObject)
}

// Function User List
func UserList(c *fiber.Ctx) error {
	time.Sleep(time.Millisecond * 500)

	// Pengaturan koneksi database
	db := database.DBConn

	// Mengambil semua data pengguna dari database yang bukan admin
	var records []model.User
	db.Where("role != ?", "admin").Find(&records)

	// Membuat konteks dengan status code dan pesan
	context := fiber.Map{
		"status_code": fiber.StatusOK,
		"msg":         "User List",
	}

	// Menambahkan data pengguna ke dalam konteks
	context["users"] = records

	// Mengirimkan respons JSON
	return c.Status(200).JSON(context)
}

// Function User Pagination With Search nim, nama, jenis kelamin, and prodi
func UserPagination(c *fiber.Ctx) error {
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

	var users []model.User

	query := db

	// Mengecek apakah parameter keyword tidak kosong
	if keyword != "" {
		query = query.Where("nim LIKE ? OR nama LIKE ? OR jeniskelamin LIKE ? OR prodi LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	// Exclude users with the role 'admin'
	query = query.Where("role != ?", "admin")

	var totalData int64
	query.Model(&model.User{}).Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		context := fiber.Map{
			"msg":         "no users found",
			"status_code": http.StatusNotFound,
		}
		return c.Status(http.StatusNotFound).JSON(context)
	}

	offset := (numPage - 1) * numPerPage
	query = query.Offset(offset).Limit(numPerPage)

	if err := query.Find(&users).Error; err != nil {
		context := fiber.Map{
			"msg":         "error retrieving users",
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
		"users":       users,
		"status_code": fiber.StatusOK,
		"message":     "success getting users per page",
		"total_page":  totalPage,
		"page_now":    numPage,
	}

	return c.Status(fiber.StatusOK).JSON(context)
}

// Function Create User
func UserCreate(c *fiber.Ctx) error {
	// Collect Form Data
	var formData formData

	// Parse Json request body
	if err := c.BodyParser(&formData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	if formData.Username == "" || formData.Password == "" || formData.Nim == "" || formData.Nama == "" || formData.JenisKelamin == "" || formData.Prodi == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "All fields are required",
		})
	}

	if formData.JenisKelamin != "laki-laki" && formData.JenisKelamin != "perempuan" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Gender must be either 'laki-laki' atau 'perempuan'",
		})
	}

	var existingUser model.User
	if err := database.DBConn.Where("username = ?", formData.Username).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Username already exists",
		})
	}

	// Create QR code from user data
	userData, err := json.Marshal(formData)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code",
		})
	}

	qr, err := qrcode.Encode(string(userData), qrcode.Medium, 256)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code",
		})
	}

	// Decode QR code using MD5
	hasher := md5.New()
	hasher.Write([]byte(qr))
	codeQr := hex.EncodeToString(hasher.Sum(nil))

	user := model.User{
		Username:     formData.Username,
		Password:     helper.HashPassword(formData.Password),
		Nim:          formData.Nim,
		Nama:         formData.Nama,
		JenisKelamin: formData.JenisKelamin,
		Prodi:        formData.Prodi,
		Role:         formData.Role,
		CodeQr:       codeQr, // Save decoded QR code to CodeQr column
		CreatedAt:    time.Now().Format("02-01-2006"),
	}

	if err := database.DBConn.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to create user",
		})
	}

	// Create QR code from CodeQr column
	qrFromCodeQr, err := qrcode.Encode(user.CodeQr, qrcode.Medium, 256)
	if err != nil {
		log.Println("Error generating QR code from CodeQr:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code from CodeQr",
		})
	}

	base64.StdEncoding.EncodeToString(qrFromCodeQr)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "Success",
		"msg":    "User created successfully",
		"users":  user,
	})
}

// Function User Update by nim, role, nama, jenis kelamin, dan prodi
func UserUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Update User Details",
	}

	id := c.Params("id")

	record := new(model.User)

	// Fetch user record by ID
	database.DBConn.First(&record, id)

	if record.ID == 0 {
		log.Println("Record not found.")
		context["statusText"] = ""
		context["msg"] = "Record not Found."
		c.Status(400)
		return c.JSON(context)
	}

	// Parsing body request
	updatedRecord := new(formData)
	if err := c.BodyParser(updatedRecord); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = ""
		context["msg"] = "Something went wrong JSON format"
		return c.Status(400).JSON(context)
	}

	// Validate input
	if updatedRecord.Role == "" || updatedRecord.Nim == "" || updatedRecord.Nama == "" || updatedRecord.JenisKelamin == "" || updatedRecord.Prodi == "" {
		log.Println("Some fields are missing.")
		context["statusText"] = ""
		context["msg"] = "All fields are required."
		return c.Status(400).JSON(context)
	}

	// Validate gender input
	if updatedRecord.JenisKelamin != "laki-laki" && updatedRecord.JenisKelamin != "perempuan" {
		log.Println("Invalid gender input.")
		context["statusText"] = ""
		context["msg"] = "Gender must be either 'laki-laki' or 'perempuan'."
		return c.Status(400).JSON(context)
	}

	// Update user details
	record.Role = updatedRecord.Role
	record.Nim = updatedRecord.Nim
	record.Nama = updatedRecord.Nama
	record.JenisKelamin = updatedRecord.JenisKelamin
	record.Prodi = updatedRecord.Prodi

	// Save updated record to database
	result := database.DBConn.Save(record)

	if result.Error != nil {
		log.Println("Error in updating data.")
		context["statusText"] = ""
		context["msg"] = "Error in updating data"
		return c.Status(500).JSON(context)
	}

	context["msg"] = "Record is updated successfully."
	context["data"] = record

	return c.Status(200).JSON(context)

}

// Function User Delete by Id
func UserDelete(c *fiber.Ctx) error {
	c.Status(400)

	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Delete User",
	}

	id := c.Params("id")

	var record model.User

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

// Function Change Password
func ChangePassword(c *fiber.Ctx) error {
	// Get username from context (you might use a middleware to set this)
	username, exists := c.Locals("username").(string)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Unauthorized",
		})
	}

	// Parse JSON request body
	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Invalid JSON format",
		})
	}

	// Validate new password and confirmation
	if req.NewPassword != req.ConfirmNewPassword {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "New password and confirmation do not match",
		})
	}

	// Fetch the user from the database
	var user model.User
	database.DBConn.First(&user, "username = ?", username)
	if user.ID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "Error",
			"msg":    "User not found",
		})
	}

	// Check if the old password is correct
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Old password is incorrect",
		})
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to hash new password",
		})
	}

	// Update the user's password in the database
	user.Password = string(hashedPassword)
	if err := database.DBConn.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to update password",
		})
	}

	// Return a success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "Success",
		"msg":    "Password changed successfully",
	})
}

// Function Get User By Id
func GetUserByID(c *fiber.Ctx) error {
	// Get the ID parameter from the URL
	id := c.Params("id")

	// Initialize the User struct
	var user model.User

	// Fetch the user from the database by ID
	if err := database.DBConn.First(&user, "id = ?", id).Error; err != nil {
		log.Println("Error fetching user:", err)
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"status": "Error",
			"msg":    "User not found",
		})
	}

	// Create QR code from CodeQr column
	qrFromCodeQr, err := qrcode.Encode(user.CodeQr, qrcode.Medium, 256)
	if err != nil {
		log.Println("Error generating QR code from CodeQr:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "Error",
			"msg":    "Failed to generate QR code from CodeQr",
		})
	}

	encodeBase64 := base64.StdEncoding.EncodeToString(qrFromCodeQr)

	// Return the user details
	return c.Status(http.StatusOK).JSON(fiber.Map{
		"status":    "Success Get User By Id",
		"baseImage": encodeBase64,
	})
}
