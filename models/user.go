package models

import (
	"database/sql"
	"fmt"

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
func GetUserByEmailOrUsernameAndPassword(db *sql.DB, identifier string, password string) (int, bool) {
	var user User
	err := db.QueryRow(
		"SELECT id, password_hash FROM users WHERE email = ?",
		identifier,
	).Scan(
		&user.ID, &user.Password,
	)
	if err != nil {
		fmt.Println("Error fetching user:", err)
		return user.ID, false
	}

	// Compare the entered password with the stored hashed password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return user.ID, false
	}

	return user.ID, true
}
func GetUserByID(db *sql.DB, userID string) (string, string, error) {
	var firstname, lastname string
	err := db.QueryRow("SELECT first_name, last_name FROM users WHERE id = ?", userID).Scan(&firstname, &lastname)
	if err != nil {
		return "", "", err
	}
	return firstname, lastname, nil
}
