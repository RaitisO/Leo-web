package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func AddLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	start := r.FormValue("start-time")
	end := r.FormValue("end-time")
	studentID := r.FormValue("student-id")
	teacherID := r.FormValue("teacher-id")
	topic := r.FormValue("lesson-topic")

	fmt.Println("Received lesson data:")
	fmt.Println("Start Time:", start)
	fmt.Println("End Time:", end)
	fmt.Println("Student ID:", studentID)
	fmt.Println("Teacher ID:", teacherID)
	fmt.Println("Topic:", topic)
}
