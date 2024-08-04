
# Sistem Layanan Perpustakaan (SILAPER)

The Silaper application is intended to develop a Library Service System Application (SILAPER) based on QRcode/Barcode and Machine Learning to increase the efficiency and effectiveness of library services. SILAPER allows borrowing, collecting and returning books digitally through QR Code scanning, as well as providing real-time book availability information.

The SILAPER development method uses the Machine Learning Singular Value Decomposition (SVD) model including data preparation, data preprocessing, Exploratory Data Analysis (EDA), modeling, and Evaluation model. The SVD model test results show an average MSE level of 0.02 (0.2%) and RMSE of 0.16 (1.6%). The results of this research can provide a book recommendation system for library borrowers that is more accurate.



## Tech Stack

**Client:** React, Redux Toolkit, TailwindCSS

**Server:** Golang, Fiber Golang, Flask, Mysql

**IoT:** Arduino Uno, Esp 8266

## Authors

- [@imarcellinus](https://github.com/IMarcellinus)
- [@syaffaamf](https://github.com/syaffaamf)



# Setup Project

Clone the project

```bash
  git clone https://github.com/IMarcellinus/blog.git
```

Go to the project directory

```bash
  cd blog
```

### Perpustakaan Database Setup

Ensure you have the following installed:
- MySQL or any compatible SQL database system
- Golang

Create Database Manually in MySQL
- Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or the command line).
- Create a new database named perpustakaan:

```
CREATE DATABASE perpustakaan;
```

### Running Server Golang

Go to the server directory

```
cd server
```

Setup environment in file .env.example rename .env

```
DB_USER="root"
DB_PASS=""
DB_NAME="perpustakaan"
DB_PORT="3306"
DB_CHARSET="utf8mb4"
DB_LOC=Local
DB_HOST="localhost"
PORT=":4040"
```

Running golang server and Install dependencies using terminal

```
go run .\server.go
```

### import the database using the dbeaver in folder database:
- tables books using fix-use-databuku (revisi).csv
- tables users using fix-use-datauser-1.csv
- tables peminjamen using fix-use-borrowrecords.csv


### Running Client React

Go to the server directory

```
cd client
```

Install dependencies

```
npm install
```

Running Client 

```
npm run dev
```

### Running Algorithm SVD Machine Learning

Go to the analisis directory

```
cd analisis
```

Setup environment in file .env.example rename .env

```
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="perpustakaan"

```

Ensure you have the following installed:
- Python 3

Create a virtual environment to manage your dependencies:

```
python -m venv env
```

Lakukan kebijakan eksekusi pada terminal:
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Activate the virtual environment:

- **Command Prompt:**
  ```cmd
  env\Scripts\Activate
  ```

- **PowerShell:**
  ```powershell
  .\env\Scripts\Activate.ps1
  ```

- **Linux, Unix, macOS:**
  ```powershell
  source env/bin/activate
  ```

Install the required Python packages:
```bash
pip install -r requirements.txt
```

Make sure you have MySQL installed and created a database named `library`. Update the database configuration in `app.py` if necessary. Then check again on the `books` table whether it matches the book borrowed from the user's study program.

Start the Flask application:
```bash
python ./app.py
```


## Used By

This project is used by the following libraries:

- Semarang State Polytechnic Electronics Department Library

