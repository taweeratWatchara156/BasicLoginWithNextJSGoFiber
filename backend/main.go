package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty"`
	Username string             `bson:"username"`
	Email    string             `bson:"email"`
	Password string             `bson:"password"`
}

var client *mongo.Client
var collection *mongo.Collection

func initDatabase() {
	var err error
	uri := "mongodb+srv://" + os.Getenv("DB_USER") + ":" + os.Getenv("DB_PASS") + "@" + os.Getenv("DB_CLUSTER")
	clientOptions := options.Client().ApplyURI(uri)
	client, err = mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal("❌ Could not connect to database :", err)
	}

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("❌ Could not ping database : ", err)
	}

	collection = client.Database(os.Getenv("DB_DATABASE")).Collection("users")
	log.Println("✅ Connected to database")
}

func createUserIndexes() {
	collection := client.Database(os.Getenv("DB_DATABASE")).Collection("users")

	// Unique index on username
	_, err := collection.Indexes().CreateOne(context.Background(),
		mongo.IndexModel{
			Keys:    bson.M{"username": 1},
			Options: options.Index().SetUnique(true),
		},
	)

	if err != nil {
		log.Fatal("❌ Could not create username index:", err)
	}

	// Unique index on email
	_, err = collection.Indexes().CreateOne(context.Background(),
		mongo.IndexModel{
			Keys:    bson.M{"email": 1},
			Options: options.Index().SetUnique(true),
		},
	)

	if err != nil {
		log.Fatal("❌ Could not create email index:", err)
	}

	log.Println("✅ User indexes created")
}

func initDotEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Error occured while loading .env file.")
	}
}

func loginHandler(c *fiber.Ctx) error {
	type LoginInput struct {
		Username   string `json:"username"`
		Password   string `json:"password"`
		RememberMe bool   `json:"rememberme"`
	}
	var loginInput LoginInput
	if err := c.BodyParser(&loginInput); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request",
		})
	}

	var user User
	err := collection.FindOne(context.Background(), bson.M{"username": loginInput.Username}).Decode(&user)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid username or password",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginInput.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid username or password",
		})
	}

	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["userId"] = 1
	claims["username"] = user.Username
	claims["email"] = user.Email

	if loginInput.RememberMe {
		claims["exp"] = time.Now().Add(time.Hour * 24 * 7).Unix()
	} else {
		claims["exp"] = time.Now().Add(time.Hour * 24).Unix()
	}

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET_KEY")))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to generate token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    tokenString,
		HTTPOnly: true,
		Secure:   false,
		SameSite: "Lax",
		Path:     "/",
		Expires:  time.Unix(claims["exp"].(int64), 0),
	})

	return c.JSON(fiber.Map{
		"success": true,
		"user": fiber.Map{
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func meHandler(c *fiber.Ctx) error {
	cookie := c.Cookies("token")
	if cookie == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized",
		})
	}

	// Parse and verify JWT
	token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.ErrUnauthorized
		}
		return []byte(os.Getenv("JWT_SECRET_KEY")), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid token",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid token claims",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"user": fiber.Map{
			"userId":   claims["userId"],
			"username": claims["username"],
			"email":    claims["email"],
		},
	})
}

func createUserHandler(c *fiber.Ctx) error {
	var user User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Error occured while hashing password",
		})
	}

	user.Password = string(hashedPassword)

	result, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Username or Email already exists",
			})
		} else {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Insert failed",
			})
		}
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User created successfully",
		"user": fiber.Map{
			"_id":      result.InsertedID,
			"username": user.Username,
			"email":    user.Email,
			"password": user.Password,
		},
	})
}

func logoutHandler(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		Secure:   false,                      // set true if using HTTPS
		Expires:  time.Now().Add(-time.Hour), // past time to expire
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logged out successfully",
	})
}

func main() {
	app := fiber.New()

	initDotEnv()
	initDatabase()
	createUserIndexes()

	app.Post("/api/users", createUserHandler)
	app.Post("/api/users/login", loginHandler)
	app.Get("/api/users/me", meHandler)
	app.Post("/api/users/logout", logoutHandler)

	defer client.Disconnect(context.Background())
	app.Listen(":8000")
}
