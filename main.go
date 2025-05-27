package main

import (
	"log"
	"net/http"
)

func main() {
	// Serve static files like CSS and JS
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.Handle("/views/", http.StripPrefix("/views/", http.FileServer(http.Dir("views"))))

	// Serve HTML files from /views
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "views/index.html")
	})

	// Start the server
	log.Println("Server started at http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
