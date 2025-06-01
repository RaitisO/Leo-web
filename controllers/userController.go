package controllers

import (
	"Leo-web/models"
	"database/sql"
	"net/http"
)

func RegisterUser(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	// Parse form values
	r.ParseForm()
	firstName := r.FormValue("first_name")
	lastName := r.FormValue("last_name")
	dateOfBirth := r.FormValue("DoB")
	role := r.FormValue("role")
	email := r.FormValue("email")
	password := r.FormValue("password")

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
		http.Redirect(w, r, "/?error=User already exists", http.StatusSeeOther)
		return
	}

	// Create user
	err = models.CreateUser(db, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Redirect with success message
	http.Redirect(w, r, "/?success=Registration successful", http.StatusSeeOther)
}
