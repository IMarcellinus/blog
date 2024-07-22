import pandas as pd
import numpy as np
import os
from flask import Flask, request, jsonify
from sklearn.decomposition import TruncatedSVD
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS


app = Flask(__name__)
CORS(app)  # Tambahkan baris ini untuk mengaktifkan CORS

# Load environment variables from .env file
load_dotenv()

# Configure MySQL connection using environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://{}:{}@{}/{}'.format(
    os.getenv('DB_USER'),
    os.getenv('DB_PASSWORD'),
    os.getenv('DB_HOST'),
    os.getenv('DB_NAME')
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Load datasets from database
def load_data():
    with app.app_context():
        datapinjam_new = pd.read_sql('SELECT * FROM peminjamen', db.engine)
        datauser_new = pd.read_sql('SELECT * FROM users', db.engine)
        databuku_new = pd.read_sql('SELECT * FROM books', db.engine)
    return datapinjam_new, datauser_new, databuku_new

# Create the user-item interaction matrix
datapinjam_new, datauser_new, databuku_new = load_data()

# Debugging: Print the first few rows of datapinjam_new
print("Peminjaman Data:")
print(datapinjam_new.head())

interaction_matrix_new = datapinjam_new.pivot_table(index='user_id', columns='book_id', values='rating').fillna(0)

# Debugging: Print the interaction matrix
print("Interaction Matrix:")
print(interaction_matrix_new.head())

# Apply SVD
n_components = 35  # Set optimal number of components based on previous analysis
svd = TruncatedSVD(n_components=n_components, random_state=42)

# Check if the interaction matrix is not empty and has the right dimensions
if not interaction_matrix_new.empty and interaction_matrix_new.shape[1] >= 2:
    latent_matrix = svd.fit_transform(interaction_matrix_new)
    latent_matrix_transposed = svd.components_
else:
    print("Interaction matrix is not valid for SVD")
    latent_matrix = np.array([])
    latent_matrix_transposed = np.array([])

# Function to predict ratings
def predict_ratings_svd(user_id, book_id):
    if user_id not in interaction_matrix_new.index or book_id not in interaction_matrix_new.columns:
        return interaction_matrix_new.mean().mean()
    user_idx = interaction_matrix_new.index.get_loc(user_id)
    book_idx = interaction_matrix_new.columns.get_loc(book_id)
    rating = np.dot(latent_matrix[user_idx, :], latent_matrix_transposed[:, book_idx])
    # Clip the rating to be within the range 1 to 5
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
    
    recommendations = pd.DataFrame({'book_id': book_ids})
    recommendations = recommendations[~recommendations['book_id'].isin(already_rated)]
    recommendations = recommendations.head(num_recommendations)
    
    return recommendations

@app.route('/recommend', methods=['GET'])
def recommend():
    user_id = int(request.args.get('user_id'))
    num_recommendations = int(request.args.get('num_recommendations', 5))
    recommendations = recommend_books(user_id, num_recommendations)
    if isinstance(recommendations, str):
        return jsonify({'error': recommendations})
    else:
        return recommendations.to_json(orient='records')

@app.route('/bookdetails', methods=['GET'])
def book_details():
    book_id = int(request.args.get('book_id'))
    book_details = databuku_new[databuku_new['id'] == book_id].to_dict(orient='records')
    return jsonify(book_details)

if __name__ == '__main__':
    with app.app_context():
        datapinjam_new, datauser_new, databuku_new = load_data()
    app.run(debug=True)

