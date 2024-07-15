# Book Recommendation System

This project is a book recommendation system built using Singular Value Decomposition (SVD) for collaborative filtering. The system is implemented with a Flask API to provide book recommendations to users.

## Setup

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

3. **Run the Flask server:**
    ```bash
    python app.py
    ```

## API Endpoints

### `/recommend`

**Method:** GET

**Parameters:**
- `user_id` (required): ID of the user for whom the recommendations are to be generated.
- `num_recommendations` (optional, default=5): Number of recommendations to return.

**Response:**
- `200 OK`: Successfully retrieved recommendations.
    ```json
    {
      "1": 4.5,
      "2": 4.2,
      "3": 4.1
    }
    ```
- `404 Not Found`: User ID not found.
    ```json
    {
      "error": "User ID not found"
    }
    ```
- `500 Internal Server Error`: Server error.
    ```json
    {
      "error": "Description of the error"
    }
    ```

## Example Usage

You can test the API using tools like Postman or cURL.

### Using Postman

1. Create a new GET request.
2. Enter the URL: `http://127.0.0.1:5000/recommend?user_id=1&num_recommendations=5`.
3. Send the request and view the recommendations in the response.

### Using cURL

```bash
curl -X GET "http://127.0.0.1:5000/recommend?user_id=1&num_recommendations=5"
