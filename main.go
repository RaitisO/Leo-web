package main

import (
	"Leo-web/routes"
	"Leo-web/sessions"
	"database/sql"
	"io/ioutil"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Serve static files like CSS and JS
	db, err := sql.Open("sqlite3", "database/Data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	sqlBytes, err := ioutil.ReadFile("database/db.sql")
	if err != nil {
		log.Fatal(err)
	}

	sqlStmt := string(sqlBytes)
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Fatalf("SQL execution failed: %v\nStatement: %s", err, sqlStmt)
	}

	sessions.Init()

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.Handle("/views/", http.StripPrefix("/views/", http.FileServer(http.Dir("views"))))

	// Serve HTML files from /views
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "views/index.html")
	})

	routes.UserRoutes(db)
	routes.LessonRoutes(db)

	// Start the server
	log.Println("Server started at http://localhost:8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
