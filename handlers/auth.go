package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
	UserType string `json:"user_type"` // "student" or "parent"
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		// Insert into DB
		stmt, err := db.Prepare("INSERT INTO users (username, password, user_type) VALUES (?, ?, ?)")
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
		defer stmt.Close()

		_, err = stmt.Exec(user.Username, user.Password, user.UserType)
		if err != nil {
			http.Error(w, "Failed to register", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("User registered successfully"))
	}
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		var creds User
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		var storedPassword string
		err := db.QueryRow("SELECT password FROM users WHERE username = ?", creds.Username).Scan(&storedPassword)
		if err != nil {
			http.Error(w, "Invalid username", http.StatusUnauthorized)
			return
		}

		if storedPassword != creds.Password {
			http.Error(w, "Invalid password", http.StatusUnauthorized)
			return
		}

		w.Write([]byte("Login successful"))
	}
}
