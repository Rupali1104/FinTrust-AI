import sys
import json
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import os

def load_models():
    """Load all trained ML models"""
    models_dir = os.path.join(os.path.dirname(__file__), 'trained_models')
    
    # Load risk assessment model
    risk_model = joblib.load(os.path.join(models_dir, 'risk_assessment_model.pkl'))
    
    # Load loan approval model
    approval_model = joblib.load(os.path.join(models_dir, 'loan_approval_model.pkl'))
    
    # Load loan terms model
    terms_model = joblib.load(os.path.join(models_dir, 'loan_terms_model.pkl'))
    
    return risk_model, approval_model, terms_model

def preprocess_data(data):
    """Preprocess the input data for ML models"""
    # Convert to DataFrame
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

def predict_risk_score(model, data):
    """Predict risk score (0-100)"""
    prediction = model.predict_proba(data)[0][1]
    risk_score = int(prediction * 100)
    return risk_score

def predict_approval_probability(model, data):
    """Predict loan approval probability (0-1)"""
    probability = model.predict_proba(data)[0][1]
    return float(probability)

def predict_loan_terms(model, data):
    """Predict suggested loan terms"""
    terms = model.predict(data)[0]
    return {
        'suggested_loan_amount': float(terms[0]),
        'suggested_interest_rate': float(terms[1]),
        'repayment_period_months': int(terms[2])
    }

def main():
    # Load input data
    input_data = json.loads(sys.argv[1])
    
    # Load models
    risk_model, approval_model, terms_model = load_models()
    
    # Preprocess data
    processed_data = preprocess_data(input_data)
    
    # Make predictions
    risk_score = predict_risk_score(risk_model, processed_data)
    approval_probability = predict_approval_probability(approval_model, processed_data)
    loan_terms = predict_loan_terms(terms_model, processed_data)
    
    # Calculate model confidence
    model_confidence = min(approval_probability, 1 - (risk_score / 100))
    
    # Prepare results
    results = {
        'risk_score': risk_score,
        'loan_approval_probability': approval_probability,
        'suggested_loan_amount': loan_terms['suggested_loan_amount'],
        'suggested_interest_rate': loan_terms['suggested_interest_rate'],
        'repayment_period_months': loan_terms['repayment_period_months'],
        'model_confidence': model_confidence,
        'model_version': '1.0.0',
        'features_used': list(processed_data.columns)
    }
    
    # Output results as JSON
    print(json.dumps(results))

if __name__ == '__main__':
    main() 