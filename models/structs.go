package models

type User struct {
	Email       string `json:"email"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	DateOfBirth string `json:"date_of_birth"`
	Role        string `json:"role"` // "student" or "parent"
	Password    string `json:"password"`
}
