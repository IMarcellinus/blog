FROM golang:1.22.2-alpine
WORKDIR /app
# Copy go.mod and go.sum to the working directory
COPY ./server/go.mod ./server/go.sum ./
# Download necessary Go modules
RUN go mod tidy
# Copy the entire project directory into the Docker container's working directory
COPY ./server .
# Build the Go application
RUN go build -o server ./server.go
# Ensure the built application is executable
RUN chmod +x server
# Expose the application port
EXPOSE 8080
# Command to run the application
CMD ["./server"]
