package sessions

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
)

// Session represents a user session
type Session struct {
	UserID int
	Token  string
}

// Sessions maps session tokens to Session objects
var Sessions map[string]Session
var mu sync.Mutex

// Init initializes the Sessions map
func Init() {
	Sessions = make(map[string]Session)
}

// CreateSession creates a new session for the given user ID and returns the session token
func CreateSession(userID int) string {
	token := generateToken()
	mu.Lock()
	Sessions[token] = Session{UserID: userID, Token: token}
	mu.Unlock()
	return token
}

// DeleteSession deletes the session associated with the given token
func DeleteSession(token string) {
	mu.Lock()
	delete(Sessions, token)
	mu.Unlock()
}

// CheckSession checks if the session with the given token exists
func CheckSession(token string) bool {
	mu.Lock()
	_, exists := Sessions[token]
	mu.Unlock()
	return exists
}

// GetSessionByUserID retrieves a session by user ID
func GetSessionByUserID(userID int) (Session, bool) {
	mu.Lock()
	defer mu.Unlock()
	for _, session := range Sessions {
		if session.UserID == userID {
			return session, true
		}
	}
	return Session{}, false
}
func generateToken() string {
	// Generate a random byte slice
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		panic(err)
	}
	// Convert the byte slice to a hex string
	return hex.EncodeToString(bytes)
}
