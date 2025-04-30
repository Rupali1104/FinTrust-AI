import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { Footer } from "../components/layout/Footer";

export const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
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

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      console.log("Uploaded files:", files);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Show loading messages at intervals
    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingMessage(loadingMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      // Here you would typically make an API call to submit the application
      // For now, we'll just navigate to the results page
      navigate("/results");
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
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
                placeholder="First Name"
                className="input"
                defaultValue=""
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input"
                defaultValue=""
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="input full-width"
              defaultValue=""
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="input full-width"
            />
          </div>
        );
      case 2:
        return (
          <div>
            <h3>Business Details</h3>
            <input
              type="text"
              placeholder="Business Name"
              className="input full-width"
            />
            <select className="input full-width" defaultValue="">
              <option value="" disabled>
                Select Business Seasonality Type
              </option>
              <option value="seasonal">Seasonal</option>
              <option value="non-seasonal">Non-Seasonal</option>
              <option value="year-round">Year Round</option>
            </select>
            <input
              type="text"
              placeholder="Years in Business"
              className="input full-width"
            />
            <textarea
              placeholder="Business Description"
              className="input full-width"
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
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="upload-input"
              />
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="upload-input"
              />
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="upload-input"
              />
              <input
                type="url"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="upload-input"
                placeholder="Enter business location"
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
                placeholder="Name"
                className="input full-width"
                defaultValue=""
              />
            <input
              type="tel"
              placeholder="Phone Number"
              className="input full-width"
            />
            <input
              type="email"
              placeholder="Email"
              className="input full-width"
              defaultValue=""
            />
            </div>
            <div className="form-group">
              <p>Person 2:</p>
            <input
                type="text"
                placeholder="Name"
                className="input full-width"
                defaultValue=""
              />
            <input
              type="tel"
              placeholder="Phone Number"
              className="input full-width"
            />
            <input
              type="email"
              placeholder="Email"
              className="input full-width"
              defaultValue=""
            />
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h3>Loan Application</h3>
            <select className="input full-width" defaultValue="">
              <option value="" disabled>
                Select Loan Type
              </option>
              <option value="nano-loan">Nano Business Loan</option>
              <option value="working-capital">Working Capital Loan</option>
              <option value="equipment-financing">Equipment Financing</option>
              <option value="inventory-loan">Inventory Loan</option>
              <option value="growth-loan">Growth and Expansion Loan</option>
            </select>
            <input
              type="number"
              placeholder="Requested Amount"
              className="input full-width"
            />
            <textarea
              placeholder="Loan Purpose"
              className="input full-width"
            ></textarea>
            <input
              type="number"
              placeholder="Current Loan Amount (if any)"
              className="input full-width"
            />
            <input
              type="number"
              placeholder="Annual Income"
              className="input full-width"
            />
          </div>
        );
      case 6:
        return (
          <div>
            <h3>Review & Submit</h3>
            <p>Review your application before submitting.</p>
            {/* <button className="btn" onClick={handleSubmit}>
              Submit Application
            </button> */}
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
            onClick={() => {
              if (currentStep === steps.length) {
                handleSubmit();
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
