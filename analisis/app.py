from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import mean_squared_error

# Load datasets (replace 'your_path' with the actual paths)
datapinjam_new = pd.read_csv('../database/user-borrowrecord-updated.csv')
datauser_new = pd.read_csv('../database/use-datauser.csv')
databuku_new = pd.read_csv('../database/user-databuku-updated.csv')

# Create the user-item interaction matrix
interaction_matrix_new = datapinjam_new.pivot_table(index='user_id', columns='book_id', values='rating').fillna(0)

# Optimal number of components found
n_components = 75

# Train SVD model
svd = TruncatedSVD(n_components=n_components, random_state=42)
latent_matrix = svd.fit_transform(interaction_matrix_new)
latent_matrix_transposed = svd.components_

# Function to predict ratings using SVD
def predict_ratings_svd(user_id, book_id):
    if user_id not in interaction_matrix_new.index or book_id not in interaction_matrix_new.columns:
        return interaction_matrix_new.mean().mean()  # Default rating prediction if user_id or book_id is not found
    user_idx = interaction_matrix_new.index.get_loc(user_id)
    book_idx = interaction_matrix_new.columns.get_loc(book_id)
    return np.dot(latent_matrix[user_idx, :], latent_matrix_transposed[:, book_idx])

# Function to provide book recommendations
def recommend_books(user_id, num_recommendations=5):
    book_ids = interaction_matrix_new.columns
    predicted_ratings = [predict_ratings_svd(user_id, book_id) for book_id in book_ids]
    recommended_books = pd.Series(predicted_ratings, index=book_ids).sort_values(ascending=False).head(num_recommendations)
    return recommended_books

# Initialize Flask app
app = Flask(__name__)

@app.route('/recommend', methods=['GET'])
def recommend():
    user_id = int(request.args.get('user_id'))
    num_recommendations = int(request.args.get('num_recommendations', 5))
    recommendations = recommend_books(user_id, num_recommendations)
    recommendations = recommendations.to_dict()
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)
