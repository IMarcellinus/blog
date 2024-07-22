
# Library Management System

## Overview
This is a library management system that provides book recommendations to users based on their borrowing history using machine learning. The backend is built with Flask and the frontend is built with React.

## Requirements
- Python 3.8+
- pip (Python package installer)

## Setup Instructions

### 1. Clone the Repository
Clone this repository to your local machine using:
\```bash
git clone <repository-url>
cd <repository-directory>
\```

### 2. Create a Virtual Environment
Create a virtual environment to manage your dependencies:
\```bash
python -m venv env
\```

### 3. Activate the Virtual Environment
Activate the virtual environment:

- **Command Prompt:**
  \```cmd
  env\Scripts\Activate
  \```

- **PowerShell:**
  \```powershell
  .\env\Scripts\Activate.ps1
  \```

- **Linux, Unix, macOS:**
  \```powershell
  source env/bin/activate
  \```

### 4. Install Dependencies
Install the required Python packages:
\```bash
pip install -r requirements.txt
\```

### 5. Configure Database
Make sure you have MySQL installed and create a database named `perpustakaan`. Update the database configuration in `app.py` if necessary.

### 6. Run the Application
Start the Flask application:
\```bash
python ./app.py
\```

The application will run on `http://127.0.0.1:5000`.

## Troubleshooting
If you encounter any issues, ensure you have followed all steps correctly and that your virtual environment is activated.

## Contributing
Feel free to fork this repository and submit pull requests.

## License
This project is licensed under the MIT License.
