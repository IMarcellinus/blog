// seeders.go
package seeders

import (
	"time"

	"github.com/IMarcellinus/blog/model"
	"gorm.io/gorm"
)

func UserFaker() *model.User {
	return &model.User{
		Username:  "admin3",
		Password:  "$2a$10$TIyWA1kMZmlDUsM8zNvYS.d8sHSjmMIWEWG5G2OwwipxZpUpJ7ZpK",
		CodeQr:    "-",
		CreatedAt: time.Now().Format("02-01-2006"),
	}
}

type Seeder struct {
	Seeder interface{}
}

func AdminSeeders() []Seeder {
	return []Seeder{
		{Seeder: UserFaker()},
	}
}

func DBSeed(db *gorm.DB) error {
	for _, seeder := range AdminSeeders() {
		err := db.Debug().Create(seeder.Seeder).Error
		if err != nil {
			return err
		}
	}
	return nil
}
