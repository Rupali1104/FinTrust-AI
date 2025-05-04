import pdfplumber
import pandas as pd
import os

# Function to convert PDF to CSV
def pdf_to_csv(pdf_path, output_folder):
    # Create output folder if it doesn't exist
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        # Open the PDF using pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            # Extract tables from all pages
            tables = []
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    tables.append(table)
            
            if not tables:
                print("No tables found in the PDF.")
                return None
            
            # Concatenate all tables into a single DataFrame
            all_data = []
            for table in tables:
                for row in table:
                    all_data.append(row)
            
            # Create a DataFrame
            df = pd.DataFrame(all_data[1:], columns=all_data[0])  # Assuming first row is header
            
            # Output CSV file path
            csv_filename = os.path.join(output_folder, os.path.basename(pdf_path).replace('.pdf', '.csv'))
            
            # Save DataFrame to CSV
            df.to_csv(csv_filename, index=False)
            print(f"Successfully converted PDF to CSV: {csv_filename}")
            
            return csv_filename  # Return the path to the generated CSV
    except Exception as e:
        print(f"Error occurred: {e}")
        return None

# Input and output paths
pdf_file = input("Enter the path to the PDF file: ")
output_folder = 'outputs'

# Call the conversion function
csv_file = pdf_to_csv(pdf_file, output_folder)

# Provide download link if conversion was successful
if csv_file:
    print(f"Your CSV file is ready: {csv_file}")
