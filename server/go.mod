module mc-bot-server

go 1.21

require (
	github.com/gofiber/fiber/v2 v2.52.0
	github.com/gofiber/contrib/websocket v1.3.0
	github.com/docker/docker v27.0.0+incompatible
	github.com/docker/go-connections v0.5.0
	github.com/joho/godotenv v1.5.1
	github.com/willroberts/minecraft-client v0.0.2
)

replace github.com/docker/docker/api => github.com/moby/moby/api v0.0.0-20240930164523-605b0c646893
