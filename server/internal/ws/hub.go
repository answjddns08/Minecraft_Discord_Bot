package ws

import (
	"encoding/json"
	"log"
	"sync"

	"mc-bot-server/internal/models"

	"github.com/fasthttp/websocket"
	"github.com/gofiber/fiber/v3"
	"github.com/valyala/fasthttp"
)

type Client struct {
	Hub  *Hub
	Conn *websocket.Conn
	Send chan []byte
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("Client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Broadcast(message models.WSMessage) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Failed to marshal WebSocket message: %v", err)
		return
	}
	h.broadcast <- data
}

var upgrader = websocket.FastHTTPUpgrader{
	CheckOrigin: func(ctx *fasthttp.RequestCtx) bool {
		return true // Allow all origins, configure properly in production
	},
}

func HandleWebSocket(c fiber.Ctx, hub *Hub) error {
	// Check if it's a WebSocket upgrade request
	if string(c.Request().Header.Peek("Upgrade")) != "websocket" {
		return fiber.ErrUpgradeRequired
	}

	// Get the underlying fasthttp RequestCtx by converting through the Context method
	// The Context() method returns *fasthttp.RequestCtx in Fiber v3
	fasthttpCtx, ok := c.Context().(*fasthttp.RequestCtx)
	if !ok {
		log.Printf("Failed to get fasthttp.RequestCtx from fiber.Ctx")
		return fiber.ErrInternalServerError
	}

	// Upgrade to WebSocket
	err := upgrader.Upgrade(fasthttpCtx, func(ws *websocket.Conn) {
		client := &Client{
			Hub:  hub,
			Conn: ws,
			Send: make(chan []byte, 256),
		}
		client.Hub.register <- client

		// Start goroutines for reading and writing
		go client.writePump()
		client.readPump()
	})

	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return err
	}

	return nil
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming messages if needed
		log.Printf("Received message: %s", message)
	}
}

func (c *Client) writePump() {
	defer func() {
		c.Conn.Close()
	}()

	for message := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Failed to write message: %v", err)
			return
		}
	}
}
