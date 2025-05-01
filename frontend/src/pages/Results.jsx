import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import NavBar from '../components/layout/NavBar';
import { Footer } from '../components/layout/Footer';
import '../styles/Results.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Results = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // Generate random results
    const generateRandomResults = () => {
      const creditScore = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
      const annualRevenue = Math.floor(Math.random() * (400000 - 100000 + 1)) + 100000;
      const loanAmount = Math.floor(Math.random() * (200000 - 100000 + 1)) + 10000;
      
      return {
        business_name: "Sample Business",
        business_type: "Nano Enterprise",
        annual_revenue: annualRevenue,
        loan_amount: loanAmount,
        loan_purpose: "Business Expansion",
        credit_score: creditScore,
        status: creditScore >= 75 ? "APPROVED" : "REJECTED"
      };
    };

    // Simulate loading
    setTimeout(() => {
      setResults(generateRandomResults());
      setLoading(false);
    }, 1500);
  }, []);

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
        data: [results.credit_score, 100 - results.credit_score],
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const score = context.dataIndex === 0 ? results.credit_score : 0;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          if (score <= 50) {
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#f39c12');
          } else if (score <= 75) {
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

  const generateFeedback = () => {
    const feedback = [
      "Based on your application, here are some recommendations:",
      "1. Consider increasing your annual income",
      "2. Maintain a consistent business growth rate",
      "3. Reduce previous debts & unwanted expenses",
      "4. Cut down on unnecessary expenses",
      "5. Consider diversifying your income sources"
    ];
    return feedback;
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

        {/* Center Column - Application Details */}
        <div className="results-column">
          <div className="user-details">
            <h2>Application Details</h2>
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
              {generateFeedback().map((line, index) => (
                <p key={index}>{line}</p>
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