package controllers

import (
	"Leo-web/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

func AddLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
		return
	}

	startStr := r.FormValue("start-time")
	endStr := r.FormValue("end-time")
	topic := r.FormValue("lesson-topic")

	start, err := time.Parse("2006-01-02T15:04", startStr)
	if err != nil {
		http.Error(w, "Invalid start time", http.StatusBadRequest)
		return
	}

	end, err := time.Parse("2006-01-02T15:04", endStr)
	if err != nil {
		http.Error(w, "Invalid end time", http.StatusBadRequest)
		return
	}

	studentID, err := strconv.Atoi(r.FormValue("student-id"))
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	teacherID, err := strconv.Atoi(r.FormValue("teacher-id"))
	if err != nil {
		http.Error(w, "Invalid teacher ID", http.StatusBadRequest)
		return
	}

	lesson := models.Lesson{
		StartTime: start,
		EndTime:   end,
		Topic:     topic,
		StudentID: studentID,
		TeacherID: teacherID,
	}
	fmt.Println("Lesson: ", lesson)
	/*if err := models.AddLesson(db, lesson); err != nil {
		fmt.Println("DB error:", err)
		http.Error(w, "Failed to save lesson", http.StatusInternalServerError)
		return
	}*/

	w.WriteHeader(http.StatusOK)
}
func GetLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")
	role := r.URL.Query().Get("role")

	if startStr == "" || endStr == "" || role == "" {
		http.Error(w, "Missing query parameters", http.StatusBadRequest)
		return
	}
	var lessons []models.LessonInfo
	var err error
	switch role {
	case "teacher":
		/*lessons, err := models.GetTeacherLessons(db, startStr, endStr)
		if err != nil {
			http.Error(w, "error getting lessons", http.StatusBadRequest)
			return

		}*/
	case "admin":
		lessons, err = models.GetAllLessons(db, startStr, endStr)
		if err != nil {
			http.Error(w, "error getting lessons", http.StatusBadRequest)
			return

		}
	default:
		http.Error(w, "invalid role", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(lessons); err != nil {
		http.Error(w, "error encoding json", http.StatusInternalServerError)
	}

}
