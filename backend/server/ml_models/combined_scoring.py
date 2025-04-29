import sys
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import os
import tensorflow as tf
from tensorflow.keras.models import load_model
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

def load_models():
    """Load all trained ML models"""
    models_dir = os.path.join(os.path.dirname(__file__), 'trained_models')
    
    # Load main financial model
    financial_model = joblib.load(os.path.join(models_dir, 'financial_model.pkl'))
    
    # Load image comparison model
    image_model = load_model(os.path.join(models_dir, 'siamese_model.h5'))
    
    # Load sentiment analysis model
    sentiment_model = joblib.load(os.path.join(models_dir, 'sentiment_model.pkl'))
    vectorizer = joblib.load(os.path.join(models_dir, 'sentiment_vectorizer.pkl'))
    
    return financial_model, image_model, sentiment_model, vectorizer

def preprocess_financial_data(data):
    """Preprocess financial data for main model"""
    df = pd.DataFrame([data])
    
    # Feature engineering
    df['revenue_to_loan_ratio'] = df['annual_revenue'] / df['loan_amount']
    
    # One-hot encode categorical variables
    df = pd.get_dummies(df, columns=['business_type', 'loan_purpose'])
    
    # Scale numerical features
    scaler = StandardScaler()
    numerical_features = ['annual_revenue', 'loan_amount', 'credit_score', 'revenue_to_loan_ratio']
    df[numerical_features] = scaler.fit_transform(df[numerical_features])
    
    return df

def preprocess_image_data(street_view_path, user_photo_path):
    """Preprocess images for comparison"""
    def preprocess_single_image(img_path):
        img = tf.keras.preprocessing.image.load_img(img_path, target_size=(100, 100))
        img = tf.keras.preprocessing.image.img_to_array(img)
        img = img / 255.0
        return img
    
    street_view = preprocess_single_image(street_view_path)
    user_photo = preprocess_single_image(user_photo_path)
    
    return np.expand_dims(street_view, axis=0), np.expand_dims(user_photo, axis=0)

def preprocess_feedback_data(feedback_text, vectorizer):
    """Preprocess feedback text for sentiment analysis"""
    return vectorizer.transform([feedback_text])

def calculate_financial_score(model, data):
    """Calculate financial score (0-50)"""
    prediction = model.predict_proba(data)[0][1]
    return int(prediction * 50)

def calculate_address_score(model, street_view, user_photo):
    """Calculate address verification score (0-25)"""
    similarity_score = model.predict([street_view, user_photo])[0][0]
    return int(similarity_score * 25)

def calculate_social_score(model, feedback_data):
    """Calculate social trust score (0-25)"""
    sentiment_score = model.predict_proba(feedback_data)[0][1]
    return int(sentiment_score * 25)

def main():
    # Load input data
    input_data = json.loads(sys.argv[1])
    
    # Load models
    financial_model, image_model, sentiment_model, vectorizer = load_models()
    
    # Calculate financial score (50%)
    financial_data = preprocess_financial_data(input_data['financial_data'])
    financial_score = calculate_financial_score(financial_model, financial_data)
    
    # Calculate address score (25%)
    street_view, user_photo = preprocess_image_data(
        input_data['street_view_path'],
        input_data['user_photo_path']
    )
    address_score = calculate_address_score(image_model, street_view, user_photo)
    
    # Calculate social score (25%)
    feedback_scores = []
    for feedback in input_data['reference_feedback']:
        feedback_data = preprocess_feedback_data(feedback, vectorizer)
        feedback_score = calculate_social_score(sentiment_model, feedback_data)
        feedback_scores.append(feedback_score)
    
    # Average social score across all references
    social_score = int(np.mean(feedback_scores))
    
    # Calculate final score (0-100)
    final_score = financial_score + address_score + social_score
    
    # Prepare results
    results = {
        'final_score': final_score,
        'component_scores': {
            'financial_score': financial_score,
            'address_score': address_score,
            'social_score': social_score
        },
        'suggested_loan_amount': input_data['financial_data']['loan_amount'],
        'suggested_interest_rate': max(8, 15 - (final_score / 10)),  # Interest rate between 8-15%
        'repayment_period_months': min(60, 12 + (final_score / 2)),  # Repayment period between 12-60 months
        'model_confidence': min(1.0, final_score / 100 + 0.2)  # Confidence between 0.2-1.0
    }
    
    # Output results as JSON
    print(json.dumps(results))

if __name__ == '__main__':
    main() 