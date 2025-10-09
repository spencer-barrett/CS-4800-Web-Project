package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

// WireMessage interface to handle clients connection/disconnection
type WireMessage struct {
	Author  string `json:"author"`
	Content string `json:"content"`
}

// stores websocket connections
var clients = make(map[*websocket.Conn]bool)

// converts html to websocket request
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// broadcast the current active user count as JSON
func broadcastCount() {
	payload := []byte(fmt.Sprintf(`{"type":"count","count":%d}`, len(clients)))
	broadcast(payload)
}

// handles incoming websocket requests
func serveWebSocket(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}

	// get username
	name := r.URL.Query().Get("name")

	if name == "" {
		name = "anonymous_user"
	}

	clients[conn] = true
	log.Printf("%s connected. Total clients: %d\n", name, len(clients))

	msg := WireMessage{
		Author:  "system",
		Content: fmt.Sprintf("%s joined the chat\t%s", name, time.Now().Format(time.RFC1123)),
	}

	b, _ := json.Marshal(msg)

	broadcast(b)
	broadcastCount()

	// cleanup on disconnection
	defer func() {
		delete(clients, conn)
		err := conn.Close()
		if err != nil {
			return
		}

		msg := WireMessage{
			Author:  "system",
			Content: fmt.Sprintf("%s left the chat\t%s", name, time.Now().Format(time.RFC1123)),
		}

		b, _ := json.Marshal(msg)

		broadcast(b)
		broadcastCount()

		log.Printf("%s disconnected. Total clients: %d\n", name, len(clients))
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			return
		}
		broadcast(message)
	}
}

// sends message to clients.
func broadcast(message []byte) {
	for client := range clients {
		err := client.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			return
		}
	}
}

// main function
func main() {
	mux := http.NewServeMux()

	// WS endpoint
	mux.HandleFunc("/ws", serveWebSocket)

	// files from ./public
	fs := http.FileServer(http.Dir("./public"))
	mux.Handle("/", fs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Server starting on " + port)
	err := http.ListenAndServe(":"+port, mux)
	if err != nil {
		return
	}
}
