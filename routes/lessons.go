package routes

import (
	"Leo-web/controllers"
	"Leo-web/handlers"
	"database/sql"
	"net/http"
)

func LessonRoutes(db *sql.DB) {
	http.HandleFunc("/add_lesson", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			controllers.AddLesson(db, w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/users", handlers.GetUsersHandler(db))

}
