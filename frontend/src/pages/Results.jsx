import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { gsap } from 'gsap';
import axios from 'axios';
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
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [completionProgress, setCompletionProgress] = useState(0);
  const resultCardsRef = useRef([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/results', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data) {
          setResults(response.data);
          generateFeedback(response.data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
    if (!data) return;

    const feedback = `
      Based on your application, here are some recommendations to improve your creditworthiness:
      1. Consider increasing your annual revenue by ${Math.round((data.loan_amount - data.annual_revenue * 0.3) / 1000)}k
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
        <p>Loading your results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="no-results">
        <p>No results found. Please submit an application first.</p>
        <button 
          className="dashboard-btn"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const semiDonutData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [results.credit_score, 100 - results.credit_score],
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const score = context.dataIndex === 0 ? results.credit_score : 0;
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
              <span className="score">{results.credit_score}</span>
              <span className="total">/ 100</span>
            </div>
          </div>
        </div>

        {/* Center Column - User Details */}
        <div className="results-column">
          <div className="user-details">
            <h2>Application Details</h2>
            <div className="detail-item">
              <span className="label">Business Name:</span>
              <span className="value">{results.business_name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Business Type:</span>
              <span className="value">{results.business_type}</span>
            </div>
            <div className="detail-item">
              <span className="label">Annual Revenue:</span>
              <span className="value">{formatCurrency(results.annual_revenue)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Loan Amount:</span>
              <span className="value">{formatCurrency(results.loan_amount)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Loan Purpose:</span>
              <span className="value">{results.loan_purpose}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value status-${results.status.toLowerCase()}`}>
                {results.status}
              </span>
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
              {feedback.split('\n').map((line, index) => (
                <p key={index}>{line.trim()}</p>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results; 