package models

import (
	"database/sql"

	"golang.org/x/crypto/bcrypt"
)

func UserExists(db *sql.DB, email string) (bool, error) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", email).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		return false, err
	}
	return exists, nil
}
func CreateUser(db *sql.DB, user User) error {
	// Hash the password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	// SQL query to insert user data into the database
	statement := `
	INSERT INTO users (email, first_name, last_name, date_of_birth, role,  password_hash)
	VALUES (?, ?, ?, ?, ?, ?)
	`
	_, err = db.Exec(statement, user.Email, user.FirstName, user.LastName, user.DateOfBirth, user.Role, user.Password)
	return err
}
