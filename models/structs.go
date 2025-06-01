package models

type User struct {
	Email       string `json:"email"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	DateOfBirth string `json:"date_of_birth"`
	UserType    string `json:"user_type"` // "student" or "parent"
	Password    string `json:"password"`
}
