package controller

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/IMarcellinus/blog/database"
	"github.com/IMarcellinus/blog/model"
	"github.com/gofiber/fiber/v2"
)

type BorrowInfo struct {
	ID        uint       `json:"id"`
	BookID    uint       `json:"book_id"`
	UserID    uint       `json:"user_id"`
	Book      model.Book `json:"book"`
	Mahasiswa string     `json:"mahasiswa"`
	CreatedAt time.Time  `json:"created_at"`
	ReturnAt  time.Time  `json:"return_at"`
	IsPinjam  bool       `json:"is_pinjam"`
}

func GetBorrowBookPagination(c *fiber.Ctx) error {
	page := c.Params("page")
	perPage := c.Params("perPage")
	keyword := c.Params("keyword") // Get keyword from URL path parameters

	numPage, err := strconv.Atoi(page)
	if err != nil || numPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Invalid page number",
			"status_code": http.StatusBadRequest,
		})
	}

	numPerPage, err := strconv.Atoi(perPage)
	if err != nil || numPerPage <= 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Invalid perPage number",
			"status_code": http.StatusBadRequest,
		})
	}

	context := fiber.Map{
		"status_code": "200",
		"msg":         "Get Borrow Book List",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Mendapatkan userID pengguna yang sedang login
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID not found in context"})
	}

	db := database.DBConn

	var totalData int64
	query := db.Model(&model.Peminjaman{}).Where("user_id = ?", userID)

	// Apply keyword filter if provided
	if keyword != "" {
		query = query.Joins("JOIN books ON books.id = peminjamans.book_id").
			Where("books.nama_buku LIKE ? OR books.kode_buku LIKE ? OR books.tanggal_pengesahan LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&totalData)

	totalPage := int(totalData) / numPerPage
	if int(totalData)%numPerPage != 0 {
		totalPage++
	}

	if totalPage == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No borrow records found",
			"status_code": http.StatusNotFound,
		})
	}

	if numPage > totalPage {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"msg":         "Page number out of range",
			"status_code": http.StatusBadRequest,
		})
	}

	offset := (numPage - 1) * numPerPage

	var Peminjaman []model.Peminjaman
	if err := query.Preload("Book").Preload("User").Offset(offset).Limit(numPerPage).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Buat slice untuk menyimpan informasi peminjaman
	borrowInfoList := make([]BorrowInfo, len(Peminjaman))

	// Loop melalui setiap objek Peminjaman dan isi informasi peminjaman
	for i, p := range Peminjaman {
		var returnAt time.Time
		if p.ReturnAt != nil {
			returnAt = *p.ReturnAt
		}
		borrowInfoList[i] = BorrowInfo{
			ID:        p.ID,
			BookID:    p.BookID,
			UserID:    p.UserID,
			Book:      p.Book,
			Mahasiswa: username, // Menggunakan username pengguna yang login
			CreatedAt: p.CreatedAt,
			ReturnAt:  returnAt,
			IsPinjam:  p.IsPinjam,
		}
	}

	context["data"] = borrowInfoList
	context["total_page"] = totalPage
	context["page_now"] = numPage
	context["limit"] = numPerPage

	return c.JSON(context)
}

func GetBorrowBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Get Borrow Book List",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Mendapatkan userID pengguna yang sedang login
	userID, exists := c.Locals("userid").(uint)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "UserID not found in context"})
	}

	var Peminjaman []model.Peminjaman
	if err := database.DBConn.Preload("Book").Preload("User").Where("user_id = ?", userID).Find(&Peminjaman).Error; err != nil {
		return err
	}

	// Buat slice untuk menyimpan informasi peminjaman
	borrowInfoList := []BorrowInfo{}

	// Loop melalui setiap objek Peminjaman dan isi informasi peminjaman
	for _, p := range Peminjaman {
		var returnAt time.Time
		if p.ReturnAt != nil {
			returnAt = *p.ReturnAt
		}
		borrowInfoList = append(borrowInfoList, BorrowInfo{
			ID:        p.ID,
			BookID:    p.BookID,
			UserID:    p.UserID,
			Book:      p.Book,
			Mahasiswa: username, // Menggunakan username pengguna yang login
			CreatedAt: p.CreatedAt,
			ReturnAt:  returnAt,
			IsPinjam:  p.IsPinjam,
		})
	}

	// Periksa apakah borrowInfoList kosong
	if len(borrowInfoList) == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"msg":         "No borrow records found",
			"status_code": http.StatusNotFound,
		})
	}

	context["data"] = borrowInfoList

	return c.JSON(context)
}

func BorrowBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"status_code": "200",
		"msg":         "Add a Book List",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Parsing request body JSON
	var requestBody struct {
		KodeBuku string `json:"kode_buku"`
		UserID   uint   `json:"user_id"`
	}

	if err := c.BodyParser(&requestBody); err != nil {
		log.Println("Error in parsing request.")
		context["statusText"] = "Error"
		context["msg"] = "Something went wrong JSON format"
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Memeriksa keberadaan kode_buku
	if requestBody.KodeBuku == "" {
		log.Println("kode_buku is required.")
		context["statusText"] = "Error"
		context["msg"] = "kode_buku is required."
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Cari buku berdasarkan kode buku
	var book model.Book
	if err := database.DBConn.Where("kode_buku = ?", requestBody.KodeBuku).First(&book).Error; err != nil {
		log.Println("Book not found:", err)
		context["statusText"] = "Error"
		context["msg"] = "Book not found."
		return c.Status(fiber.StatusNotFound).JSON(context)
	}

	// Ambil informasi pengguna yang meminjam
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		// Jika terjadi kesalahan saat mencari user
		log.Println("Error while fetching user:", err)
		context["statusText"] = "Error"
		context["msg"] = "Error while fetching user."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Periksa apakah buku sudah dipinjam sebelumnya
	var existingPeminjaman model.Peminjaman
	if err := database.DBConn.Where("book_id = ? AND is_pinjam = ?", book.ID, true).First(&existingPeminjaman).Error; err == nil {
		context["statusText"] = "Error"
		context["msg"] = "Buku sedang dipinjam"
		return c.Status(fiber.StatusConflict).JSON(context)
	}

	// Simpan peminjaman ke database
	peminjaman := model.Peminjaman{
		BookID:    book.ID,
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ReturnAt:  nil, // Ensure ReturnAt is nil if no return date is set
		IsPinjam:  true,
	}

	if err := database.DBConn.Create(&peminjaman).Error; err != nil {
		log.Println("Error while saving peminjaman:", err)
		context["statusText"] = "Error"
		context["msg"] = "Failed to save peminjaman."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	context["msg"] = "Buku Berhasil Dipinjam."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku

	return c.Status(fiber.StatusCreated).JSON(context)
}

func ReturnBook(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Return a Book",
	}

	// Mendapatkan nilai username dari Local storage
	username, exists := c.Locals("username").(string)
	log.Println(username)

	// Memeriksa keberadaan username
	if !exists {
		log.Println("username key not found.")
		context["msg"] = "username not found."
		return c.Status(fiber.StatusUnauthorized).JSON(context)
	}

	// Mendapatkan ID peminjaman dari parameter
	peminjamanID := c.Params("id")

	// Ambil informasi peminjaman berdasarkan ID
	var peminjaman model.Peminjaman
	if err := database.DBConn.First(&peminjaman, peminjamanID).Error; err != nil {
		// Jika terjadi kesalahan saat mencari peminjaman
		log.Println("Error while fetching peminjaman:", err)
		context["msg"] = "Error while fetching peminjaman."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Ambil informasi pengguna yang mengembalikan
	var user model.User
	if err := database.DBConn.First(&user, "username=?", username).Error; err != nil {
		// Jika terjadi kesalahan saat mencari user
		log.Println("Error while fetching user:", err)
		context["msg"] = "Error while fetching user."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Periksa apakah buku sudah dipinjam oleh pengguna yang ingin mengembalikan
	if peminjaman.UserID != user.ID || !peminjaman.IsPinjam {
		context["statusText"] = "Error"
		context["msg"] = "Buku tidak dipinjam oleh pengguna ini atau status peminjaman tidak sesuai"
		return c.Status(fiber.StatusBadRequest).JSON(context)
	}

	// Mengupdate status peminjaman menjadi kembali dan mengatur waktu pengembalian
	if err := database.DBConn.Model(&peminjaman).Updates(map[string]interface{}{"is_pinjam": false, "return_at": time.Now()}).Error; err != nil {
		return err
	}

	// Ambil informasi buku yang dikembalikan
	var book model.Book
	if err := database.DBConn.First(&book, peminjaman.BookID).Error; err != nil {
		log.Println("Error while fetching book:", err)
		context["msg"] = "Error while fetching book."
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	context["msg"] = "Buku Berhasil Dikembalikan."
	context["Nama Mahasiswa"] = username
	context["Kode Buku"] = book.KodeBuku
	context["Returned At"] = peminjaman.ReturnAt

	return c.Status(fiber.StatusOK).JSON(context)
}

func SearchPeminjaman(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "Ok",
		"msg":        "Search Peminjaman List",
	}
	// Mendapatkan nilai parameter dari URL
	param := c.Params("search")

	db := database.DBConn

	// Mencari peminjaman berdasarkan parameter yang diberikan
	var peminjamans []model.Peminjaman
	if err := db.Where("(Book.kode_buku) LIKE ? OR return_at LIKE ? OR (Book.nama_buku LIKE ?)", "%"+param+"%", "%"+param+"%", "%"+param+"%").Preload("Book").Find(&peminjamans).Error; err != nil {
		// Menangani kesalahan jika terjadi
		context["statusText"] = "Error"
		context["msg"] = "Failed to search peminjaman"
		return c.Status(fiber.StatusInternalServerError).JSON(context)
	}

	// Mengembalikan daftar peminjaman yang sesuai dengan kriteria pencarian
	if len(peminjamans) == 0 {
		// Menangani kasus jika tidak ada peminjaman yang ditemukan
		context["statusText"] = "Not Found"
		context["msg"] = "No peminjaman found for the search query"
		return c.Status(fiber.StatusNotFound).JSON(context)
	}

	context["peminjaman"] = peminjamans

	return c.Status(fiber.StatusOK).JSON(context)
}
