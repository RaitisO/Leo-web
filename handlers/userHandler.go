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

type Subject struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func GetUsersHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users := struct {
			Students []User    `json:"students"`
			Teachers []User    `json:"teachers"`
			Subjects []Subject `json:"subjects"`
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

		rows, err = db.Query("SELECT id, name FROM subjects")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var subject Subject
				if err := rows.Scan(&subject.ID, &subject.Name); err == nil {
					users.Subjects = append(users.Subjects, subject)
				}
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	}
}
