package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type User struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

func GetUsersHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users := struct {
			Students []User `json:"students"`
			Teachers []User `json:"teachers"`
		}{}

		// Fetch students
		rows, err := db.Query("SELECT id, first_name, last_name FROM users WHERE role = 'student'")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var user User
				if err := rows.Scan(&user.ID, &user.FirstName, &user.LastName); err == nil {
					users.Students = append(users.Students, user)
				}
			}
		}

		// Fetch teachers
		rows, err = db.Query("SELECT id, first_name, last_name FROM users WHERE role = 'teacher'")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var user User
				if err := rows.Scan(&user.ID, &user.FirstName, &user.LastName); err == nil {
					users.Teachers = append(users.Teachers, user)
				}
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}
