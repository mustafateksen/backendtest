import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/auth/verify-token', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
    </div>
  );
}

export default Dashboard;
