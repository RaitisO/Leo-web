package routes

import (
	"Leo-web/controllers"
	"Leo-web/handlers"
	"database/sql"
	"fmt"
	"net/http"
)

func LessonRoutes(db *sql.DB) {
	http.HandleFunc("/add_lesson", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			start := r.FormValue("start-time")
			end := r.FormValue("end-time")
			fmt.Println("start: ", start, "end: ", end)
			controllers.AddLesson(db, w, r)
		} else {
			fmt.Println("Not a POST request")
		}
	})
	http.HandleFunc("/api/users", handlers.GetUsersHandler(db))

}
