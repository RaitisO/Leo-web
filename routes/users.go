package routes

import (
	"database/sql"
	"leo-web/controllers"
	"net/http"
)

func UserRoutes(db *sql.DB) {
	http.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {

			controllers.RegisterUser(db, w, r)
		}
	})
}
