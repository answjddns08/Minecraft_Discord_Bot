package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v3"
)

// Auth is a simple authentication middleware
// In production, use proper JWT or OAuth
func Auth() fiber.Handler {
	apiKey := os.Getenv("API_KEY")
	if apiKey == "" {
		apiKey = "dev-key-change-in-production"
	}

	return func(c fiber.Ctx) error {
		// Get token from Authorization header
		auth := c.Get("Authorization")

		if auth == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "missing_authorization",
				"message": "Authorization header is required",
			})
		}

		// Check Bearer token
		token := strings.TrimPrefix(auth, "Bearer ")
		if token == auth { // Bearer prefix not found
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "invalid_authorization_format",
				"message": "Authorization must be Bearer token",
			})
		}

		// Validate token
		if token != apiKey {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "invalid_token",
				"message": "Invalid authorization token",
			})
		}

		return c.Next()
	}
}
