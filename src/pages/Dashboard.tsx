import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          if (isMounted) setAuthChecked(true);
          navigate('/login', { replace: true });
          return;
        }
      } catch {
        if (isMounted) setAuthChecked(true);
        navigate('/login', { replace: true });
        return;
      }
      if (isMounted) setAuthChecked(true);
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [navigate]);

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  // Çıkış fonksiyonu
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (error) {
      alert('Çıkış sırasında hata oluştu.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div>
        <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
        <button className='mt-20 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600' onClick={handleLogout}>
          Çıkış yap
        </button>
        <div className="mt-10">
          <a href="/dashboard/arcers" className="text-blue-600 underline hover:text-blue-800">Arcers</a>
        </div>
        <div className="mt-2">
          <a href="/dashboard/users" className="text-blue-600 underline hover:text-blue-800">Users</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
