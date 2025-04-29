import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { gsap } from 'gsap';
import NavBar from '../components/layout/NavBar';
import { Footer } from '../components/layout/Footer';
import '../styles/Results.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-fill"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [completionProgress, setCompletionProgress] = useState(0);
  const resultCardsRef = useRef([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockResults = {
      risk_score: 65,
      loan_approval_probability: 0.75,
      suggested_loan_amount: 50000,
      suggested_interest_rate: 8.5,
      repayment_period_months: 36,
      model_confidence: 0.85,
      model_version: '1.0.0'
    };

    // Simulate API call delay
    setTimeout(() => {
      setResults(mockResults);
      generateFeedback(mockResults);
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (!loading && resultCardsRef.current.length > 0) {
      // Animate completion progress
      gsap.to({}, {
        duration: 2,
        onUpdate: () => {
          setCompletionProgress(prev => Math.min(prev + 0.01, 0.8));
        }
      });

      // Animate result cards
      gsap.from(resultCardsRef.current, {
        duration: 1,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const generateFeedback = (data) => {
    const feedback = `
      Based on your application, here are some recommendations to improve your creditworthiness:
      1. Consider increasing your annual revenue by ${Math.round((data.suggested_loan_amount - 40000) / 1000)}k
      2. Maintain a consistent business growth rate
      3. Reduce outstanding debts if any
      4. Build a longer credit history
      5. Consider diversifying your income sources
    `;
    setFeedback(feedback);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Analyzing your application...</p>
      </div>
    );
  }

  const semiDonutData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [77, 23],
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const score = context.dataIndex === 0 ? 77 : 0;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          if (score <= 30) {
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#f39c12');
          } else if (score <= 70) {
            gradient.addColorStop(0, '#f39c12');
            gradient.addColorStop(1, '#2ecc71');
          } else {
            gradient.addColorStop(0, '#2ecc71');
            gradient.addColorStop(1, '#27ae60');
          }
          return [gradient, '#f0f0f0'];
        },
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }
    ]
  };

  const semiDonutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className="results-page">
      <NavBar />
      
      <main className="results-main">
        {/* Left Column - Graph */}
        <div className="results-column">
          <div className="graph-container">
            <h2 className="score-label">Your Score is:</h2>
            <div className="semi-donut-container">
              <Doughnut data={semiDonutData} options={semiDonutOptions} />
            </div>
            <div className="score-text">
              <span className="score">77</span>
              <span className="total">/ 100</span>
            </div>
          </div>
        </div>

        {/* Center Column - User Details */}
        <div className="results-column">
          <div className="user-details">
            <h2>User Information</h2>
            <div className="detail-item">
              <span className="label">Name:</span>
              <span className="value">Ramesh</span>
            </div>
            <div className="detail-item">
              <span className="label">Risk Score:</span>
              <span className="value">77/100</span>
            </div>
            <div className="detail-item">
              <span className="label">Loan Amount:</span>
              <span className="value">{formatCurrency(results.suggested_loan_amount)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Interest Rate:</span>
              <span className="value">{results.suggested_interest_rate}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Term:</span>
              <span className="value">36 months</span>
            </div>
            <div className="action-buttons">
              <button 
                className="dashboard-btn"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
              <button 
                className="print-btn"
                onClick={handlePrint}
              >
                Print Results
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - AI Suggestions */}
        <div className="results-column">
          <div className="ai-suggestions">
            <h2>AI Recommendations</h2>
            <div className="suggestion-list">
              <p>1. Consider increasing your annual revenue by Rs. 10,000</p>
              <p>2. Maintain consistent business growth</p>
              <p>3. Reduce outstanding debts</p>
              <p>4. Build longer credit history</p>
              <p>5. Diversify income sources</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results; 