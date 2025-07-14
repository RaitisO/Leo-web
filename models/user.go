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
func GetUserLoginInfo(db *sql.DB, email string, password string) (int, string, string, bool) {
	var id int
	var hashedPassword string
	var firstName string
	var role string

	err := db.QueryRow(
		"SELECT id, password_hash, first_name, role FROM users WHERE email = ?",
		email,
	).Scan(&id, &hashedPassword, &firstName, &role)

	if err != nil {
		fmt.Println("Error fetching user:", err)
		return 0, "", "", false
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	if err != nil {
		return 0, "", "", false
	}

	return id, firstName, role, true
}

func GetUserByID(db *sql.DB, userID int) (User, error) {
	var user User
	err := db.QueryRow(`
		SELECT id, email, password_hash, first_name, last_name, role, COALESCE(date_of_birth, '')
		FROM users WHERE id = ?
	`, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.DateOfBirth,
	)

	if err != nil {
		return User{}, err
	}

	return user, nil
}

func GetAllUsers(db *sql.DB) ([]User, error) {
	rows, err := db.Query(`
		SELECT id, first_name, last_name, email, role 
		FROM users
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Role)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
