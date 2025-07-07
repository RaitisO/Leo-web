package handlers

import (
	"database/sql"
	"html/template"
	"net/http"
	"yourproject/models" // adjust to your actual import path
	"yourproject/sessions"
)

func BlogHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	tmpl := template.Must(template.ParseFiles("views/blog.html"))

	loggedIn := false
	cookie, err := r.Cookie("session_token")
	if err == nil {
		_, exists := sessions.Sessions[cookie.Value]
		if exists {
			loggedIn = true
		}
	}

	data := models.PageData{
		LoggedIn: loggedIn,
	}

	err = tmpl.ExecuteTemplate(w, "blog.html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
