import sqlite3
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import classification_report
import joblib
import os
import ast



# Cohort mapping
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

def train_segmentation_model():
    conn = sqlite3.connect("user_profiles.db")
    df = pd.read_sql_query("SELECT cookie, interests FROM user_profiles", conn)
    conn.close()

    if df['interests'].dropna().empty or all(len(ast.literal_eval(x)) == 0 for x in df['interests'] if x):
        raise ValueError("❌ No interests available to train the model.")

    df['interests'] = df['interests'].apply(lambda x: ast.literal_eval(x) if x else [])
    df['cohorts'] = df['interests'].apply(map_to_cohorts)

    mlb = MultiLabelBinarizer()
    y = mlb.fit_transform(df['cohorts'])

    df['interests_str'] = df['interests'].apply(lambda x: ' '.join(x))
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(df['interests_str'])

    model = OneVsRestClassifier(LogisticRegression(max_iter=1000, class_weight='balanced'))
    model.fit(X, y)

    os.makedirs("models", exist_ok=True)
    joblib.dump(vectorizer, "models/interest_vectorizer.pkl")
    joblib.dump(mlb, "models/interest_label_binarizer.pkl")
    print("Model trained and saved.")

def load_model():
    # Project root assumed to be one level above this script (e.g., /src)
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    model_path = os.path.join(base_dir, "models", "interest_segment_model.pkl")
    vectorizer_path = os.path.join(base_dir, "models", "interest_vectorizer.pkl")
    mlb_path = os.path.join(base_dir, "models", "interest_label_binarizer.pkl")

    if os.path.exists(model_path) and os.path.exists(vectorizer_path) and os.path.exists(mlb_path):
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        mlb = joblib.load(mlb_path)
        return model, vectorizer, mlb

    return None, None, None

def predict_cohort(interests_list):
    model, vectorizer, mlb = load_model()
    if model is None:
        raise ValueError("Model not trained yet. Please run training.")
    interests_str = ' '.join(interests_list)
    X_new = vectorizer.transform([interests_str])
    preds = model.predict(X_new)
    return list(mlb.inverse_transform(preds)[0])  # <-- flatten to list

def evaluate_model():
    model, vectorizer, mlb = load_model()
    if model is None:
        raise ValueError("Model not trained yet.")

    conn = sqlite3.connect("user_profiles.db")
    df = pd.read_sql_query("SELECT cookie, interests FROM user_profiles", conn)
    conn.close()

    df['interests'] = df['interests'].apply(lambda x: ast.literal_eval(x) if x else [])
    df['cohorts'] = df['interests'].apply(map_to_cohorts)

    y = MultiLabelBinarizer().fit_transform(df['cohorts'])
    df['interests_str'] = df['interests'].apply(lambda x: ' '.join(x))
    X = vectorizer.transform(df['interests_str'])

    y_pred = model.predict(X)
    report = classification_report(y, y_pred, target_names=mlb.classes_)
    print(report)
