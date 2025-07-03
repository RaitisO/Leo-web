package controllers

import (
	"database/sql"
	"fmt"
	"net/http"
)

func AddLesson(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	start := r.FormValue("start-time")
	end := r.FormValue("end-time")
	fmt.Println("start: ", start, "end: ", end)
}
