import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { Footer } from "../components/layout/Footer";
import axios from "axios";

export const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    businessType: '',
    phoneNumber: '',
    businessName: '',
    businessSeasonality: '',
    yearsInBusiness: '',
    businessDescription: '',
    loanType: '',
    loanAmount: '',
    loanPurpose: '',
    currentLoanAmount: '',
    annualIncome: '',
    full_name: '',
    business_type: '',
    loan_amount: '',
    risk_score: 0
  });
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: "Personal Information" },
    { id: 2, title: "Business Details" },
    { id: 3, title: "Document Upload" },
    { id: 4, title: "Social References" },
    { id: 5, title: "Loan Application" },
    { id: 6, title: "Review & Submit" },
  ];

  const loadingMessages = [
    "Validating location data...",
    "Evaluating social feedback...",
    "Checking financial records...",
    "Analyzing your application..."
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    console.log('Submit button clicked');
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    setLoadingMessage('Submitting application...');
    console.log('Form data:', formData);

    try {
      // Generate random score between 65 and 90
      const riskScore = Math.floor(Math.random() * (90 - 65 + 1)) + 65;
      console.log('Generated risk score:', riskScore);

      // Store the risk score in localStorage
      localStorage.setItem('currentRiskScore', riskScore);

      // Prepare the data in the format expected by the backend
      const applicationData = {
        full_name: formData.fullName,
        business_type: formData.businessType,
        loan_amount: parseFloat(formData.loanAmount),
        risk_score: riskScore
      };

      console.log('Sending data to backend:', applicationData);
      const response = await axios.post('http://localhost:5000/api/applications', applicationData);
      console.log('Response from backend:', response.data);

      if (response.data.application_id) {
        // Store the application ID in localStorage
        localStorage.setItem('currentApplicationId', response.data.application_id);
        // Redirect to results page
        navigate('/results');
      } else {
        throw new Error('No application ID received from server');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setLoadingMessage('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Personal Information</h3>
            <div className="form-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="input"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input full-width"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              className="input full-width"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h3>Business Details</h3>
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              className="input full-width"
              value={formData.businessName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="businessType"
              placeholder="Business Type"
              className="input full-width"
              value={formData.businessType}
              onChange={handleInputChange}
            />
            <select 
              name="businessSeasonality"
              className="input full-width"
              value={formData.businessSeasonality}
              onChange={handleInputChange}
            >
              <option value="" disabled>Select Business Seasonality Type</option>
              <option value="seasonal">Seasonal</option>
              <option value="non-seasonal">Non-Seasonal</option>
              <option value="year-round">Year Round</option>
            </select>
            <input
              type="text"
              name="yearsInBusiness"
              placeholder="Years in Business"
              className="input full-width"
              value={formData.yearsInBusiness}
              onChange={handleInputChange}
            />
            <textarea
              name="businessDescription"
              placeholder="Business Description"
              className="input full-width"
              value={formData.businessDescription}
              onChange={handleInputChange}
            ></textarea>
          </div>
        );
      case 3:
        return (
          <div>
            <h3>Document Upload</h3>
            <h2>Required Documents:</h2>
            <ul className="doc-list">
              <li>Business Registration (If available)</li>
              <li>Recent Bank Statements (If available)</li>
              <li>Any Govt. ID Proof</li>
              <li>Proof of Business Location</li>
            </ul>
            <div className="upload-area">
              <input
                type="file"
                multiple
                className="upload-input"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3>Social References</h3>
            <p>Provide references of credible individuals like landlords & suppliers for verification</p>
            <div className="form-group">
              <p>Person 1:</p>
              <input
                type="text"
                name="reference1Name"
                placeholder="Name"
                className="input full-width"
                value={formData.reference1Name || ''}
                onChange={handleInputChange}
              />
              <input
                type="tel"
                name="reference1Phone"
                placeholder="Phone Number"
                className="input full-width"
                value={formData.reference1Phone || ''}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="reference1Email"
                placeholder="Email"
                className="input full-width"
                value={formData.reference1Email || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <p>Person 2:</p>
              <input
                type="text"
                name="reference2Name"
                placeholder="Name"
                className="input full-width"
                value={formData.reference2Name || ''}
                onChange={handleInputChange}
              />
              <input
                type="tel"
                name="reference2Phone"
                placeholder="Phone Number"
                className="input full-width"
                value={formData.reference2Phone || ''}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="reference2Email"
                placeholder="Email"
                className="input full-width"
                value={formData.reference2Email || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h3>Loan Application</h3>
            <select 
              name="loanType"
              className="input full-width"
              value={formData.loanType}
              onChange={handleInputChange}
            >
              <option value="" disabled>Select Loan Type</option>
              <option value="nano-loan">Nano Business Loan</option>
              <option value="working-capital">Working Capital Loan</option>
              <option value="equipment-financing">Equipment Financing</option>
              <option value="inventory-loan">Inventory Loan</option>
              <option value="growth-loan">Growth and Expansion Loan</option>
            </select>
            <input
              type="number"
              name="loanAmount"
              placeholder="Requested Amount"
              className="input full-width"
              value={formData.loanAmount}
              onChange={handleInputChange}
            />
            <textarea
              name="loanPurpose"
              placeholder="Loan Purpose"
              className="input full-width"
              value={formData.loanPurpose}
              onChange={handleInputChange}
            ></textarea>
            <input
              type="number"
              name="currentLoanAmount"
              placeholder="Current Loan Amount (if any)"
              className="input full-width"
              value={formData.currentLoanAmount}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="annualIncome"
              placeholder="Annual Income"
              className="input full-width"
              value={formData.annualIncome}
              onChange={handleInputChange}
            />
          </div>
        );
      case 6:
        return (
          <div>
            <h3>Review & Submit</h3>
            <p>Review your application before submitting.</p>
            <div className="review-section">
              <h4>Personal Information</h4>
              <p>Name: {formData.fullName}</p>
              <p>Email: {formData.email}</p>
              <p>Phone: {formData.phoneNumber}</p>

              <h4>Business Details</h4>
              <p>Business Name: {formData.businessName}</p>
              <p>Business Type: {formData.businessType}</p>
              <p>Years in Business: {formData.yearsInBusiness}</p>

              <h4>Loan Details</h4>
              <p>Loan Type: {formData.loanType}</p>
              <p>Loan Amount: ₹{formData.loanAmount}</p>
              <p>Annual Income: ₹{formData.annualIncome}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          FinTrust<i className="ri-money-rupee-circle-fill"></i>AI
        </div>
      </nav>

      {/* Main Content */}
      <section className="dashboard-content d-text">
        <h1>
          AI-Driven <span>Credit Access Portal</span>
        </h1>
        <p>
          Start exploring your journey to better credit access and management.
        </p>

        {/* Steps Navigation */}
        <div className="steps-nav">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step ${currentStep === step.id ? "active" : ""}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <span>{step.id}</span>
              <p>{step.title}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="step-content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-message">{loadingMessage}</p>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="step-buttons">
          <button
            className="prev-btn"
            disabled={currentStep === 1 || isLoading}
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <button 
            className="btn"
            disabled={isLoading}
            onClick={(e) => {
              if (currentStep === steps.length) {
                handleSubmit(e);
              } else {
                setCurrentStep((prev) => Math.min(prev + 1, steps.length));
              }
            }}
          >
            {currentStep === steps.length ? "Submit Application" : "Next"}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};
