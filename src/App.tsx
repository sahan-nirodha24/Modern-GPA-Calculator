import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { AddGPA } from './pages/AddGPA';
import { GPAHistory } from './pages/GPAHistory';
import { Transcript } from './pages/Transcript';
import { Profile } from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes (Mocked protection) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gpa/add" element={<AddGPA />} />
        <Route path="/gpa/history" element={<GPAHistory />} />
        <Route path="/transcript" element={<Transcript />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
