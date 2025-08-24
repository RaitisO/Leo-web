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
	subjectID, err := strconv.Atoi(r.FormValue("subject-id"))
	if err != nil {
		http.Error(w, "Invalid subject ID", http.StatusBadRequest)
		return
	}

	recurring := r.FormValue("recurring") == "true"

	if recurring {
		// Decide period end date
		var endPeriod time.Time
		year := start.Year()
		if start.Month() >= time.June && start.Month() <= time.August {
			// Summer: until Aug 31
			endPeriod = time.Date(year, time.August, 31, end.Hour(), end.Minute(), 0, 0, start.Location())
		} else {
			// School period: until May 31 next year if in Sep–Dec, otherwise same year
			if start.Month() >= time.September {
				endPeriod = time.Date(year+1, time.May, 31, end.Hour(), end.Minute(), 0, 0, start.Location())
			} else {
				endPeriod = time.Date(year, time.May, 31, end.Hour(), end.Minute(), 0, 0, start.Location())
			}
		}

		// Call recurring function
		err = AddRecurringLesson(db, start, end, subjectID, studentID, teacherID, endPeriod)
		if err != nil {
			fmt.Println("DB error (recurring):", err)
			http.Error(w, "Failed to save recurring lessons", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "recurring lessons added"})
		return
	}

	// Single lesson
	lesson := models.Lesson{
		StartTime: start,
		EndTime:   end,
		SubjectID: subjectID,
		StudentID: studentID,
		TeacherID: teacherID,
	}
	id, err := models.AddLesson(db, lesson)
	if err != nil {
		fmt.Println("DB error:", err)
		http.Error(w, "Failed to save lesson", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"lesson_id": id})
}
func AddRecurringLesson(db *sql.DB, start, end time.Time, subjectID int, studentID, teacherID int, endPeriod time.Time) error {
	currentStart := start
	currentEnd := end

	for !currentStart.After(endPeriod) {
		lesson := models.Lesson{
			StartTime: currentStart,
			EndTime:   currentEnd,
			SubjectID: subjectID,
			StudentID: studentID,
			TeacherID: teacherID,
		}
		_, err := models.AddLesson(db, lesson)
		if err != nil {
			return err
		}

		// Add 1 week
		currentStart = currentStart.AddDate(0, 0, 7)
		currentEnd = currentEnd.AddDate(0, 0, 7)
	}

	return nil
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
func DeleteLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	lessonIDStr := r.URL.Query().Get("id") // get from query string
	if lessonIDStr == "" {
		http.Error(w, "Missing lesson ID", http.StatusBadRequest)
		return
	}

	lessonID, err := strconv.Atoi(lessonIDStr)
	if err != nil {
		http.Error(w, "Invalid lesson ID", http.StatusBadRequest)
		return
	}
	err = models.DeleteLesson(db, lessonID)
	if err != nil {
		http.Error(w, "Failed to delete lesson", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
func EditLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // Allow up to 10MB for safety
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Get lesson ID from query param
	lessonIDStr := r.URL.Query().Get("id")
	if lessonIDStr == "" {
		http.Error(w, "Lesson ID is required", http.StatusBadRequest)
		return
	}

	lessonID, err := strconv.Atoi(lessonIDStr)
	if err != nil {
		http.Error(w, "Invalid lesson ID", http.StatusBadRequest)
		return
	}

	// Collect form data
	startTime := r.FormValue("start-time")
	endTime := r.FormValue("end-time")
	teacherID := r.FormValue("teacher-id")
	studentID := r.FormValue("student-id")
	lessonTopic := r.FormValue("lesson-topic")
	fmt.Println(startTime)
	// Basic validation
	if startTime == "" || endTime == "" || teacherID == "" || studentID == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Call the model function to update the lesson
	err = models.UpdateLesson(db, lessonID, startTime, endTime, teacherID, studentID, lessonTopic)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update lesson: %v", err), http.StatusInternalServerError)
		return
	}

	// Send success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Lesson updated successfully",
	})

}
