package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func AddLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	start := r.FormValue("start-time")
	end := r.FormValue("end-time")
	student := r.FormValue("student-name")
	topic := r.FormValue("lesson-topic")

	fmt.Println("Received lesson data:")
	fmt.Println("Start Time:", start)
	fmt.Println("End Time:", end)
	fmt.Println("Student Name:", student)
	fmt.Println("Topic:", topic)
}
