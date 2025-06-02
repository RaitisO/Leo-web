package controllers

import (
	"Leo-web/models"
	"Leo-web/sessions"
	"database/sql"
	"log"
	"net/http"
	"time"
)

func RegisterUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	// Parse form values
	r.ParseForm()
	firstName := r.FormValue("first_name")
	lastName := r.FormValue("last_name")
	dobstr := r.FormValue("DoB")
	role := r.FormValue("role")
	email := r.FormValue("email")
	password := r.FormValue("password")
	dob, err := time.Parse("2006-01-02", dobstr)
	if err != nil {
		log.Println("Invalid date format:", err)
	}
	dateOfBirth := dob.Format("2006-01-02")
	// Create User struct
	user := models.User{
		FirstName:   firstName,
		LastName:    lastName,
		DateOfBirth: dateOfBirth,
		Role:        role,
		Email:       email,
		Password:    password,
	}

	// Check if user exists
	exists, err := models.UserExists(db, email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if exists {
		http.Redirect(w, r, "/views/signup.html?error=email", http.StatusSeeOther)
		return
	}

	// Create user
	err = models.CreateUser(db, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Redirect with success message
	http.Redirect(w, r, "/views/success.html", http.StatusSeeOther)
}
func LoginUser(db *sql.DB, w http.ResponseWriter, r *http.Request, ID int) {
	// Generate a new session ID
	existingSession, exists := sessions.GetSessionByUserID(ID)
	if exists {
		// If a session exists, delete it to invalidate the previous session
		sessions.DeleteSession(existingSession.Token)
	}

	// Generate a new session token
	sessionID := sessions.CreateSession(ID)
	// Set a cookie with the session ID
	http.SetCookie(w, &http.Cookie{
		Name:  "session_token",
		Value: sessionID,
	})

	http.Redirect(w, r, "http://localhost:8080", http.StatusSeeOther)
}
