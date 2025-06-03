import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id?: string;
  uuid?: string;
  email: string;
  role: string;
}

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Login kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Kullanıcıları çek
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/arcers', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Kullanıcılar alınamadı');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  // Arama filtresi
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.uuid?.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  // Checkbox işlemleri
  const toggleSelect = (uuid: string) => {
    setSelected(sel => sel.includes(uuid) ? sel.filter(id => id !== uuid) : [...sel, uuid]);
  };
  const allSelected = selected.length === filteredUsers.length && filteredUsers.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filteredUsers.map(u => u.uuid || ''));
  };

  // Toplu işlemler (dummy)
  const handleDelete = () => {
    alert('Seçili kullanıcılar silinecek: ' + selected.join(', '));
  };
  const handleSendMail = () => {
    alert('Seçili kullanıcılara mail gönderilecek: ' + selected.join(', '));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Kullanıcı Ekle</button>
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        {selected.length > 0 && (
          <div className="flex gap-4 mb-4">
            <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Seçili Kullanıcıları Sil</button>
            <button onClick={handleSendMail} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Seçili Kullanıcılara Mail Gönder</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="p-2 border-b"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                <th className="p-2 border-b">UUID</th>
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading"><td colSpan={4} className="text-center py-6">Yükleniyor...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr key="empty"><td colSpan={4} className="text-center py-6">Kullanıcı bulunamadı.</td></tr>
              ) : filteredUsers.map(user => {
                const userId = user.id || user.uuid || user.email;
                return (
                  <tr key={userId} className="hover:bg-gray-50">
                    <td className="p-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(userId)}
                        onChange={() => toggleSelect(userId)}
                      />
                    </td>
                    <td className="p-2 border-b font-mono text-xs">{userId}</td>
                    <td className="p-2 border-b">{user.email}</td>
                    <td className="p-2 border-b">{user.role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
