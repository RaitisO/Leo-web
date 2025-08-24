// models/post.go
package models

import (
	"database/sql"
	"fmt"
	"time"
)

type Post struct {
	ID        int
	Title     string
	Content   string
	CreatedAt time.Time
}

func GetAllPosts(db *sql.DB) ([]Post, error) {
	rows, err := db.Query("SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []Post

	for rows.Next() {
		var post Post
		err := rows.Scan(&post.ID, &post.Title, &post.Content, &post.CreatedAt)
		if err != nil {
			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}
func AddLesson(db *sql.DB, lesson Lesson) (int64, error) {
	result, err := db.Exec(`
		INSERT INTO lessons (start_time, end_time, subject_id, student_id, teacher_id)
		VALUES (?, ?, ?, ?, ?)`,
		lesson.StartTime, lesson.EndTime, lesson.SubjectID, lesson.StudentID, lesson.TeacherID,
	)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}

func GetAllLessons(db *sql.DB, startStr string, endStr string) ([]LessonInfo, error) {
	// Parse time
	start, err := time.Parse(time.RFC3339, startStr)
	if err != nil {
		return nil, fmt.Errorf("invalid start time: %w", err)
	}
	end, err := time.Parse(time.RFC3339, endStr)
	if err != nil {
		return nil, fmt.Errorf("invalid end time: %w", err)
	}

	query := `
		SELECT 
			l.id AS lesson_id,
			l.subject_id,
			l.start_time,
			l.end_time,
			s.id AS student_id,
			(s.first_name || ' ' || s.last_name) AS student_name,
			t.id AS teacher_id,
			(t.first_name || ' ' || t.last_name) AS teacher_name
		FROM lessons l
		JOIN users s ON l.student_id = s.id
		JOIN users t ON l.teacher_id = t.id
		WHERE l.start_time BETWEEN ? AND ?
	`

	rows, err := db.Query(query, start, end)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var lessons []LessonInfo

	for rows.Next() {
		var lesson LessonInfo
		err := rows.Scan(
			&lesson.LessonID,
			&lesson.SubjectID,
			&lesson.StartTime,
			&lesson.EndTime,
			&lesson.StudentID,
			&lesson.StudentName,
			&lesson.TeacherID,
			&lesson.TeacherName,
		)
		if err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		fmt.Println(lesson.SubjectID)
		lessons = append(lessons, lesson)
	}

	return lessons, nil
}
func DeleteLesson(db *sql.DB, lessonID int) error {
	_, err := db.Exec(`DELETE FROM lessons WHERE id = ?`, lessonID)
	return err
}
func UpdateLesson(db *sql.DB, lessonID int, startTime, endTime, teacherID, studentID, topic string) error {
	query := `
		UPDATE lessons
		SET  start_time = ?, end_time = ?, teacher_id = ?, student_id = ?, lesson_topic = ?
		WHERE id = ?
	`
	_, err := db.Exec(query, startTime, endTime, teacherID, studentID, topic, lessonID)
	return err
}
