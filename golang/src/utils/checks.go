package utils

import (
	"fmt"
	"os"
)

func GetDSN(asSession bool) string {
	var dbName string
	if asSession {
		dbName = os.Getenv("DB_NAME_SESSION")
	} else {
		dbName = os.Getenv("DB_NAME")
	}
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		dbName,
		os.Getenv("DB_PORT"),
		os.Getenv("DB_TIMEZONE"),
	)
	return dsn
}
