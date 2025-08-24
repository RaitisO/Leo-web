package models

import "time"

type User struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	DateOfBirth string `json:"date_of_birth"`
	Role        string `json:"role"` // "student" or "parent"
	Password    string `json:"password"`
}
type PageData struct {
	LoggedIn    bool
	LogUserID   int
	FirstName   string
	LastName    string
	Email       string
	Role        string
	DateOfBirth string
	Users       []User
}

type Lesson struct {
	StartTime time.Time
	EndTime   time.Time
	SubjectID int
	StudentID int
	TeacherID int
}
type LessonInfo struct {
	LessonID    int       `json:"lesson_id"`
	SubjectID   int       `json:"subject_id"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	StudentID   int       `json:"student_id"`
	StudentName string    `json:"student_name"`
	TeacherID   int       `json:"teacher_id"`
	TeacherName string    `json:"teacher_name"`
}
