from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from flask_sqlalchemy import SQLAlchemy
import mysql.connector
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

# Get database connection details from environment variables
db_host = os.getenv('DB_HOST')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_name = os.getenv('DB_NAME')

# Debug: print the database connection details
print(f"DB Host: {db_host}, DB User: {db_user}, DB Password: {db_password}, DB Name: {db_name}")

# Establish database connection
try:
    conn = mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database=db_name
    )
    if conn.is_connected():
        print('Connected to MySQL database')
except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if conn.is_connected():
        conn.close()

# Configure MySQL connection
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/perpustakaan'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Enable CORS
CORS(app)

# Load datasets from database
def load_data():
    with app.app_context():
        datapinjam_new = pd.read_sql('SELECT * FROM peminjamen', db.engine)
        datauser_new = pd.read_sql('SELECT * FROM users', db.engine)
        databuku_new = pd.read_sql('SELECT * FROM books', db.engine)
        # Debug: print the head of the datasets
        print(datapinjam_new.head())
        print(datauser_new.head())
        print(databuku_new.head())
    return datapinjam_new, datauser_new, databuku_new

# Create the user-item interaction matrix
datapinjam_new, datauser_new, databuku_new = load_data()
# Debug: print columns to verify
print(databuku_new.columns)

interaction_matrix_new = datapinjam_new.pivot_table(index='user_id', columns='book_id', values='rating').fillna(0)

# Apply SVD
n_components = 35  # Set optimal number of components based on previous analysis
svd = TruncatedSVD(n_components=n_components, random_state=42)
latent_matrix = svd.fit_transform(interaction_matrix_new)
latent_matrix_transposed = svd.components_

# Function to predict ratings
def predict_ratings_svd(user_id, book_id):
    if user_id not in interaction_matrix_new.index or book_id not in interaction_matrix_new.columns:
        return interaction_matrix_new.mean().mean()
    user_idx = interaction_matrix_new.index.get_loc(user_id)
    book_idx = interaction_matrix_new.columns.get_loc(book_id)
    rating = np.dot(latent_matrix[user_idx, :], latent_matrix_transposed[:, book_idx])
    rating = np.clip(rating, 0, 5)
    return rating

# Function to recommend books for a given user
def recommend_books(user_id, num_recommendations=5):
    if user_id not in interaction_matrix_new.index:
        return "User not found in the database."
    
    user_ratings = interaction_matrix_new.loc[user_id]
    already_rated = user_ratings[user_ratings > 0].index.tolist()
    
    book_ids = interaction_matrix_new.columns.tolist()
    predictions = [predict_ratings_svd(user_id, book_id) for book_id in book_ids]
    
    recommendations = pd.DataFrame({'book_id': book_ids, 'predicted_rating': predictions})
    recommendations = recommendations[~recommendations['book_id'].isin(already_rated)]
    recommendations = recommendations.sort_values(by='predicted_rating', ascending=False).head(num_recommendations)
    
    # Debug: print recommendations
    print(f"Recommendations for user {user_id}: {recommendations}")
    
    return recommendations[['book_id']]

# Set up logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/recommend', methods=['GET'])
def recommend():
    user_id = int(request.args.get('user_id'))
    num_recommendations = int(request.args.get('num_recommendations', 5))
    recommendations = recommend_books(user_id, num_recommendations)
    if isinstance(recommendations, str):
        app.logger.info(f"No recommendations found for user {user_id}")
        return jsonify({'error': recommendations})
    else:
        app.logger.info(f"Recommendations for user {user_id}: {recommendations.to_json(orient='records')}")
        return recommendations.to_json(orient='records')

@app.route('/bookdetails', methods=['GET'])
def book_details():
    book_id = int(request.args.get('book_id'))
    # Debug: print columns to verify
    print(databuku_new.columns)
    book_details = databuku_new[databuku_new['id'] == book_id].to_dict(orient='records')  # Use 'id' instead of 'book_id'
    if book_details:
        return jsonify(book_details[0])
    else:
        return jsonify({'error': 'Book not found'})

if __name__ == '__main__':
    app.run(debug=True)
