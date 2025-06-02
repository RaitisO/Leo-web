package handlers

import (
	"Leo-web/models"
	"Leo-web/sessions"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"text/template"
)

func IndexHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Add("Cache-Control", "no-store")
	tmpl := template.Must(template.ParseFiles("../frontend/index.html"))
	firstName, lastName := getUsername(db, r)

	data := models.PageData{
		LoggedIn:  checkIfUserIsLoggedIn(r), // Implement this function
		FirstName: firstName,
		LastName:  lastName, // Implement this function

	}
	err := tmpl.ExecuteTemplate(w, "index.html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)

		fmt.Println("\nError:", err)
		return
	}

}

func checkIfUserIsLoggedIn(r *http.Request) bool {
	// Get the session token from the cookies

	cookie, err := r.Cookie("session_token")
	if err != nil {
		return false
	}

	// Check if the session token exists in the session store
	_, exists := sessions.Sessions[cookie.Value]
	return exists
}

func getUsername(db *sql.DB, r *http.Request) (string, string) {
	// Get the session token from the cookies
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return "", ""
	}

	// Get the session from the session store
	token := cookie.Value
	sessionData, exists := sessions.Sessions[token]
	if !exists {
		return "", ""
	}

	// Fetch the username from the database using the user ID associated with the session
	userID := strconv.Itoa(sessionData.UserID)
	firstname, lastname, err := models.GetUserByID(db, userID)
	if err != nil {
		// Handle error, such as logging or returning a default value
		return "", ""
	}

	return firstname, lastname
}
