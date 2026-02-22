# DailyPlus
To do list application tracking daily task.

> Feel the Pulse of Your Productivity.

DailyPulse is a responsive To-Do List web application designed to help users stay consistent with their daily tasks. It features a streak tracking system and monthly analytics to visualize productivity trends.

---

## 🚀 Features

### ✅ Task Management
- Add, edit, and delete tasks
- Mark tasks as completed
- Separate section for **Daily Routine Tasks** (recurring every day)
- Persistent storage using `localStorage`

### 🔥 Streak System
- If **all tasks (including daily routine tasks)** are completed in a day:
  - Streak increases by 1
- If any task remains incomplete:
  - Streak resets to 0
- Displays:
  - Current streak
  - (Optional) Longest streak achieved

### 📊 Monthly Analytics
- Tracks number of completed tasks per day
- Displays a **Monthly Line Chart**
- Visualizes daily productivity trends
- Built using Chart.js

### 📱 Responsive Design
- Clean and modern UI
- Fully mobile-friendly layout

---

## 🛠️ Tech Stack

- **HTML5** – Structure
- **CSS3** – Styling
- **JavaScript (ES6)** – Application logic
- **Chart.js** – Monthly line chart visualization
- **localStorage** – Persistent browser storage

---

## 📂 Project Structure
DailyPulse/
│── index.html
│── style.css
│── script.js


---

## ⚙️ How It Works

### 1️⃣ Task Handling
Tasks are stored in the browser using `localStorage`, ensuring data persists even after refreshing the page.

### 2️⃣ Streak Logic
At the end of each day:
- If all tasks are completed → streak increments
- If not → streak resets to 0

### 3️⃣ Monthly Chart
- Stores daily completion counts
- Displays a line chart for the current month
- Automatically updates when tasks are completed

---

## 💻 How to Run Locally

1. Clone the repository:
2. git clone https://github.com/niroshinimurugadas/DailyPulse.git


2. Navigate into the project folder:

cd DailyPulse

3. Open `index.html` in your browser

No installation required 🚀

---

## 🌟 Future Enhancements

- Dark mode toggle
- User authentication system
- Cloud database integration (Firebase)
- Weekly & yearly analytics
- Export productivity reports (PDF/CSV)
- Convert to Progressive Web App (PWA)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Niroshini murugadas
GitHub: https://github.com/niroshinimurugadas
