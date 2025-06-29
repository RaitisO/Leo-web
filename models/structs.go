package models

type User struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	DateOfBirth string `json:"date_of_birth"`
	Role        string `json:"role"` // "student" or "parent"
	Password    string `json:"password"`
}
type PageData struct {
	LoggedIn    bool
	LogUserID   int
	FirstName   string
	LastName    string
	Email       string
	Role        string
	DateOfBirth string
	Users       []User
}
