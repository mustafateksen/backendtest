import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UsersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Student' | 'Community' | 'Company' | 'Educator'>('Student');
  const [authChecked, setAuthChecked] = useState(false);

  // Login kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          navigate('/login', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [navigate]);

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded shadow p-6">
        {/* Tab Navigation */}
        <div className="flex justify-between mb-8 border-b">
          {['Student', 'Community', 'Company', 'Educator'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-150 ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
              onClick={() => setActiveTab(tab as any)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {activeTab === 'Student' && (
          <div className="text-gray-700 text-center py-10">Student tabı içeriği</div>
        )}
        {activeTab === 'Community' && (
          <div className="text-gray-700 text-center py-10">Community tabı içeriği</div>
        )}
        {activeTab === 'Company' && (
          <div className="text-gray-700 text-center py-10">Company tabı içeriği</div>
        )}
        {activeTab === 'Educator' && (
          <div className="text-gray-700 text-center py-10">Educator tabı içeriği</div>
        )}
        {/* Dashboard'a dön butonu */}
        <div className="flex justify-end mt-8">
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-900"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
