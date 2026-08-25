# 🚀 AI Resume Analyzer v2

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

AI Resume Analyzer v2 is a full-stack application designed to parse, analyze, and score resumes using Artificial Intelligence. It helps candidates optimize their resumes for Applicant Tracking Systems (ATS) by providing actionable feedback and insights.

## ✨ Features

* **Resume Parsing:** Automatically extracts text and key information from uploaded resume files.
* **ATS Scoring:** Evaluates resumes against job descriptions or standard ATS criteria.
* **Keyword Analysis:** Highlights missing or crucial keywords to improve resume visibility.
* **Detailed Reporting:** Generates comprehensive PDF reports (powered by ReportLab) with actionable feedback.
* **Modern UI:** Clean, intuitive frontend for seamless user experience.

## 🛠️ Tech Stack

* **Backend:** Python (`app.py`, `models.py`, `database.py`)
* **Frontend:** JavaScript / Node.js (`package.json` in `/frontend`)
* **Deployment:** [Railway](https://railway.app/) (Backend) & GitHub Pages (Frontend)

## 📁 Project Structure

```text
AI-Resume-Analyzer-v2/
├── backend/          # Python backend application logic
├── frontend/         # Frontend user interface 
├── routes/           # API endpoints and routing
├── uploads/          # Temporary storage for uploaded resumes
├── app.py            # Main application entry point
├── database.py       # Database connection and configuration
├── models.py         # Database schemas and models
├── requirements.txt  # Python dependencies
└── package.json      # Frontend/Node dependencies
