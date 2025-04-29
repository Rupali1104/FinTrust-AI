import UserDetails from '../models/UserDetails.js';
import MLResults from '../models/MLResults.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import Application from '../models/Application';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get ML results for a user's application
export const getResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if results already exist
    let application = await Application.findOne({ user: userId });
    
    if (!application) {
      return res.status(404).json({ message: 'No application found' });
    }

    if (!application.mlResults) {
      // Process application through ML models
      const mlResults = await processMLModels(application.userDetails);
      
      // Update application with ML results
      application.mlResults = mlResults;
      await application.save();
    }

    res.json(application.mlResults);
  } catch (error) {
    console.error('Error in getResults:', error);
    res.status(500).json({ message: 'Error processing results', error: error.message });
  }
};

// Process data through ML models
const processMLModels = async (userData) => {
  return new Promise((resolve, reject) => {
    try {
      // Prepare data for ML model
      const mlData = {
        financial_data: {
          annual_revenue: userData.annualRevenue,
          loan_amount: userData.loanAmount,
          credit_score: userData.creditScore,
          business_type: userData.businessType,
          loan_purpose: userData.loanPurpose
        },
        street_view_path: userData.streetViewPath,
        user_photo_path: userData.userPhotoPath,
        reference_feedback: userData.referenceFeedback
      };

      // Spawn Python process to run combined scoring
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../ml_models/combined_scoring.py'),
        JSON.stringify(mlData)
      ]);

      let results = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        results += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${error}`));
          return;
        }

        try {
          const parsedResults = JSON.parse(results);
          resolve(parsedResults);
        } catch (parseError) {
          reject(new Error(`Failed to parse ML results: ${parseError.message}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}; 