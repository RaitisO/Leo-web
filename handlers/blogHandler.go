package handlers

import (
	"Leo-web/models" // adjust to your actual import path
	"Leo-web/sessions"
	"database/sql"
	"html/template"
	"net/http"
)

type BlogPageData struct {
	LoggedIn bool
	Posts    []models.Post
}

func BlogHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	posts, err := models.GetAllPosts(db)
	if err != nil {
		http.Error(w, "Unable to load posts", http.StatusInternalServerError)
		return
	}

	// Check if user is logged in
	loggedIn := false
	cookie, err := r.Cookie("session_token")
	if err == nil {
		_, exists := sessions.Sessions[cookie.Value] // or sessions.Sessions if using a separate sessions package
		if exists {
			loggedIn = true
		}
	}

	data := BlogPageData{
		LoggedIn: loggedIn,
		Posts:    posts,
	}

	tmpl := template.Must(template.ParseFiles("views/blog.html"))
	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
