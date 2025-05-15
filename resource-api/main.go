package main

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
)

func main() {
	logger := log.New(os.Stdout, "resource-api: ", log.LstdFlags)
	data, err := os.ReadFile("./data/response.payload.json")
	check(logger, err)
	var resourceList ResourceList
	err = json.Unmarshal(data, &resourceList)
	check(logger, err)
	r := gin.Default()
	resourceApi := r.Group("/resource-api")
	resourceApi.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, resourceList)
	})
	err = r.Run(":8585")
	check(logger, err)
}

type ResourceList struct {
	Resources []Resource `json:"resources"`
}
type Resource struct {
	Description string `json:"description"`
}

func check(logger *log.Logger, e error) {
	if e != nil {
		logger.Fatal(e)
	}
}
