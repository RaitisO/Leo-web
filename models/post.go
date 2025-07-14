// models/post.go
package models

import (
	"database/sql"
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
func AddLesson(db *sql.DB, lesson Lesson) error {
	_, err := db.Exec(`
		INSERT INTO lessons (start_time, end_time, topic, student_id, teacher_id)
		VALUES (?, ?, ?, ?, ?)`,
		lesson.StartTime, lesson.EndTime, lesson.Topic, lesson.StudentID, lesson.TeacherID,
	)
	return err
}
