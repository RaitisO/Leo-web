package routes

import (
	"Leo-web/controllers"
	"Leo-web/handlers"
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
			userID, firstName, role, ok := models.GetUserLoginInfo(db, identifier, password)
			if !ok {
				http.Redirect(w, r, "/views/signin.html?error=signinerror", http.StatusSeeOther)
				return
			} else {
				controllers.LoginUser(db, w, r, userID, firstName, role)
			}
		} else {
			http.ServeFile(w, r, "/views/signin.html")
		}

	})
	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		// Delete the session cookie
		http.SetCookie(w, &http.Cookie{
			Name:   "session_token",
			Value:  "",
			MaxAge: -1, // MaxAge<0 means delete cookie now
		})

		// Redirect the user to the index page
		http.Redirect(w, r, "/", http.StatusSeeOther)
	})
	http.HandleFunc("/dashboard/", func(w http.ResponseWriter, r *http.Request) {
		handlers.DashboardHandler(w, r, db)
	})
	http.HandleFunc("/blog/", func(w http.ResponseWriter, r *http.Request) {
		handlers.BlogHandler(w, r, db)
	})
}
