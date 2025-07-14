package handlers

import (
	"Leo-web/models"
	"Leo-web/sessions"
	"database/sql"
	"net/http"
	"strings"
)

// Make sure this uses your real session & model logic
func DashboardHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Parse URL parts
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) != 3 {
		http.NotFound(w, r)
		return
	}

	role := parts[1]
	firstName := parts[2]

	// Get session token
	cookie, err := r.Cookie("session_token")
	if err != nil {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		http.Error(w, "Unauthorized - no session", http.StatusUnauthorized)
		return
	}

	// Step 2: Get session from session token
	session, exists := sessions.Sessions[cookie.Value]
	if !exists {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		http.Error(w, "Unauthorized - invalid session", http.StatusUnauthorized)
		return
	}

	// Step 3: Get userID from session
	userID := session.UserID
	// Get full user data
	user, err := models.GetUserByID(db, userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	// Validate role and name
	if user.Role != role || user.FirstName != firstName {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Serve role-based dashboard
	RoleHandler(w, r, user)
}
