package routes

import (
	"Leo-web/controllers"
	"Leo-web/models"
	"database/sql"
	"net/http"
)

func UserRoutes(db *sql.DB) {
	http.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {

			controllers.RegisterUser(db, w, r)
		}
	})

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			identifier := r.PostFormValue("identifier")
			password := r.PostFormValue("password")

			// Check if the user exists
			id, role, exists := models.GetUserByEmailAndPassword(db, identifier, password)
			if exists {
				controllers.LoginUser(db, w, r, id, role)
			} else {
				// Redirect back to the login page with an error message
				http.Redirect(w, r, "/views/signup.html?error=Invalid email or password", http.StatusSeeOther)
			}
		}
	})
}
