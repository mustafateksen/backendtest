import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ArcersPage from './pages/ArcersPage';
import UsersPage from './pages/UsersPage';
import AddTemplate from './pages/AddTemplate';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/arcers" element={<ArcersPage />} />
        <Route path="/dashboard/users" element={<UsersPage />} />
        <Route path="/dashboard/add-template" element={<AddTemplate />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
