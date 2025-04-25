# 🚀 PySpark Learning App

An interactive, beginner-friendly learning platform to explore PySpark basics with hands-on practice.  
This app provides small topic-wise explanations, accompanied by one practical coding challenge per topic. Built using **Flask** as the backend, with datasets in **CSV** and learning content in **JSON**.

---

## 🌟 Features

- 🔹 Topic-wise **PySpark concept explanations**
- 🔹 One **practice question** for each concept with sample datasets
- 🔹 Real-time data filtering and transformation
- 🔹 Backend powered by **Flask API**
- 🔹 Homepage with **important PySpark concepts** summary
- 🔹 User-friendly interface to interact and learn by doing

---

## 🧠 Sample Topics Covered

Each topic includes:
- 📘 A short explanation
- 📝 1 hands-on question with an example dataset

Examples:
- `filter()` → Filter out users with age less than 25
- `select()`, `withColumn()`, `groupBy()` and more...

---

## 🛠️ Tech Stack

- **Backend:** Flask
- **Data Handling:** PySpark, CSV, JSON
- **Frontend:** HTML/CSS (or React if used)
- **Data Storage:** 
  - CSV for datasets  
  - JSON for concept explanations and question bank

---

## 📁 Project Structure

```bash
pyspark-learning-app/
├── app.py
├── requirements.txt
├── README.md
├── data/
│   ├── users.csv
│   └── concepts.json
├── static/
│   └── style.css
├── templates/
│   └── index.html
└── .gitignore

```

## Installations
1. Clone the repository
    git clone https://github.com/payalgoyal/pyspark-learning-app.git
    cd pyspark-learning-app

2. Create virtual environment (optional but recommended)
    python -m venv myenv
    source myenv/bin/activate  # on Linux/macOS
    myenv\Scripts\activate     # on Windows

3. Install dependencies
   pip install -r requirements.txt

4. Run the Flask app
   python ./server/app.py

5. Run client code
   Naviagte to client folder cd client
   npm run dev

📃 License
This project is open-source and free to use under the MIT License.

💡 Author
Made with ❤️ by Payal Goyal
