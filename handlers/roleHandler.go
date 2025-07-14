package handlers

import (
	"Leo-web/models"
	"Leo-web/sessions"
	"fmt"
	"net/http"
	"text/template"
)

func RoleHandler(w http.ResponseWriter, r *http.Request, user models.User) {
	w.Header().Add("Cache-Control", "no-store")
	tmpl := template.Must(template.ParseFiles("views/" + user.Role + ".html"))

	data := models.PageData{
		LoggedIn:    checkIfUserIsLoggedIn(r),
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Role:        user.Role,
		Email:       user.Email,
		DateOfBirth: user.DateOfBirth,
	}

	err := tmpl.ExecuteTemplate(w, user.Role+".html", data)
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
