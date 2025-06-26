# Jobber - Frontend

🚀 **Jobber** is an AI-powered recruitment platform designed to match candidates with job opportunities using semantic similarity. This repository contains **only the frontend** of the project — originally built with Create React App and later migrated to **Vite** for better performance and developer experience.

> ⚠️ **Note**: This repo includes only the frontend. The backend — which includes the AI/ML matching — is not yet published here.

---

## 📌 Features

Jobber was developed as a **graduation project** by me and my teammate **Halil İbrahim Taşkömür**.

- It aims to improve the hiring process by leveraging **natural language processing (NLP)** techniques.
- Uses machine learning models like **MiniLM** and **MPNet** to compute similarity scores between job descriptions and resumes.
- These scores help companies find better matches and guide applicants toward more relevant roles.

---

## 🛠 Tech Stack

- **React**
- **Vite**
- **Tailwind CSS**
- **React Router**
- **Redux** for state management

---

## 🚧 Project Status

The application is designed to integrate with a custom **backend API** and **machine learning service** for full functionality.

- These services are **not currently available** in this repository.
- When you run this project locally, the **user interface will be displayed**, but features that depend on the backend — such as user login, job posting, and candidate matching — will **not work**.
- The backend will be integrated and pushed as a separate repository soon.

---

## ▶️ Getting Started

To run the frontend locally:

```bash
git clone https://github.com/eeyll18/jobber-frontend.git
cd frontend
npm install
npm run dev
