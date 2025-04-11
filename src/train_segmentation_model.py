import sqlite3
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
import joblib
import os
import ast
from sklearn.multiclass import OneVsRestClassifier

# Wrap LogisticRegression for multi-label classification


# Load user data
conn = sqlite3.connect("user_profiles.db")
df = pd.read_sql_query("SELECT cookie, interests FROM user_profiles", conn)
conn.close()

df['interests'] = df['interests'].apply(lambda x: ast.literal_eval(x) if x else [])

# Define cohort mapping
interest_to_cohort = {
    'art': 'Arts & Culture',
    'books': 'Arts & Culture',
    'photography': 'Arts & Culture',
    'education': 'Education',
    'fashion': 'Fashion & Lifestyle',
    'health': 'Fashion & Lifestyle',
    'finance': 'Finance',
    'food': 'Foodies',
    'gaming': 'Gamers',
    'movies': 'Movie & Music Lovers',
    'music': 'Movie & Music Lovers',
    'politics': 'Politics & Society',
    'sports': 'Sports Enthusiasts',
    'tech': 'Tech Savvy',
    'travel': 'Travel',
}

def map_to_cohorts(interests):
    cohorts = {interest_to_cohort.get(interest) for interest in interests if interest in interest_to_cohort}
    return list(filter(None, cohorts)) or ['Mixed/Other']

# Assign cohort(s)
df['cohorts'] = df['interests'].apply(map_to_cohorts)

# Multi-label binarization for cohorts
mlb = MultiLabelBinarizer()
y = mlb.fit_transform(df['cohorts'])

# Vectorize interests using CountVectorizer
df['interests_str'] = df['interests'].apply(lambda x: ' '.join(x))
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df['interests_str'])

# Train model
model = OneVsRestClassifier(LogisticRegression(max_iter=1000))
model.fit(X, y)

# Save model and transformers
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/interest_segment_model.pkl")
joblib.dump(vectorizer, "models/interest_vectorizer.pkl")
joblib.dump(mlb, "models/interest_label_binarizer.pkl")

print("Model trained and saved.")
