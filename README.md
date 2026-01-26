# 🎓 Smart GPA Calculator

A modern, comprehensive Grade Point Average (GPA) management application built for university students. Track your academic progress, visualize your performance history, and generate printable transcripts with a premium, glassmorphism-inspired UI.

## ✨ Features

- **📊 Interactive Dashboard**: Visualizes your GPA progression over semesters using dynamic area charts.
- **🔐 Secure Authentication**: Robust Login and Signup system powered by **Firebase Auth**.
- **📝 GPA Management**:
  - Add courses, credits, and grades for any semester.
  - Automatically fetches previous entries for easy editing.
  - Prevents duplicate semester records by intelligently merging data.
- **📜 Transcript Generation**: View and print a formatted academic transcript with your cumulative GPA and Class standing (e.g., First Class, Second Class).
- **👤 User Profile**: Manage your academic details (Degree, University, Duration) with a visual avatar generator.
- **🌙 Dark Mode**: Fully responsive dark/light theme toggling for study-late-at-night sessions.
- **📱 Responsive Design**: Works seamlessly on desktops, tablets, and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript
- **Styling**: Vanilla CSS (Custom Variables, Glassmorphism), Framer Motion (Animations)
- **Database & Auth**: Firebase Realtime Database, Firebase Authentication
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase Project (for Auth & Database)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/gpa-calculator.git
    cd gpa-calculator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    - Create a file named `firebase.ts` in `src/` (or check if it exists).
    - Add your Firebase configuration keys:
    ```typescript
    // src/firebase.ts
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getDatabase } from "firebase/database";

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT_ID.firebasedatabase.app",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getDatabase(app);
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 📖 Usage Guide

1.  **Sign Up**: Create an account with your email.
2.  **Setup Profile**: Enter your generic details like University, Degree Name, and Duration.
3.  **Add GPA**:
    - Navigate to "Add New GPA".
    - Select Year and Semester.
    - Add your courses, credit values, and obtained grades.
    - Hit Save.
4.  **View Dashboard**: See your immediate GPA stats and credit progress.
5.  **Transcript**: improved view of all your semesters combined, ready for export.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---
*Built with ❤️ by Sahan*
