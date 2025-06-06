import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  created_at: string;
  email: string;
  role: string;
}

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Login kontrolü ve kullanıcı rolünü çek
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          navigate('/login');
        } else {
          const data = await response.json();
          if (data && data.user && data.user.role) {
            setUserRole(data.user.role);
          }
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
    fetch('http://localhost:8000/api/get-arcers', {
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
    u.id.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.created_at.toLowerCase().includes(search.toLowerCase())
  );

  // Checkbox işlemleri
  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };
  const allSelected = selected.length === filteredUsers.length && filteredUsers.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filteredUsers.map(u => u.id));
  };

  // Toplu işlemler
  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm('Seçili kullanıcıları silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('http://localhost:8000/api/delete-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: selected })
      });
      let result: any = null;
      try {
        result = await res.json();
      } catch {
        result = null;
      }
      // Backend yeni format: { results: [{id, status, ...}] }
      if (res.ok && result && Array.isArray(result.results)) {
        const deleted = result.results.filter((r: any) => r.status === 'deleted').map((r: any) => r.id);
        const unauthorized = result.results.filter((r: any) => r.status === 'forbidden' || r.status === 'forbidden_self').map((r: any) => r.id);
        const notFound = result.results.filter((r: any) => r.status === 'not_found').map((r: any) => r.id);
        const errors = result.results.filter((r: any) => r.status === 'error').map((r: any) => `${r.id}${r.message ? ` (${r.message})` : ''}`);

        let alertMsg = '';
        alertMsg += `Silinenler: ${deleted.length > 0 ? deleted.join(', ') : 'Yok'}\n`;
        alertMsg += `Yetkisiz: ${unauthorized.length > 0 ? unauthorized.join(', ') : 'Yok'}\n`;
        alertMsg += `Bulunamayanlar: ${notFound.length > 0 ? notFound.join(', ') : 'Yok'}`;
        if (errors.length > 0) {
          alertMsg += `\nHatalı: ${errors.join(', ')}`;
        }
        window.alert(alertMsg);
      } else {
        window.alert('Silme işlemi başarısız oldu.');
      }
      setSelected([]);
      // Kullanıcı listesini tekrar çek
      setLoading(true);
      fetch('http://localhost:8000/api/get-arcers', {
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
    } catch (e) {
      window.alert('Silme işlemi başarısız oldu.');
    }
  };
  const handleSendMail = () => {
    alert('Seçili kullanıcılara mail gönderilecek: ' + selected.join(', '));
  };

  // Edit formunu başlat
  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  // Edit formu değişiklikleri
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Edit formunu kapat
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      {/* Kullanıcı rolü üstte gösteriliyor */}
      <div className="mb-4 text-lg font-semibold text-gray-700">
        {userRole && <>Giriş yapan kullanıcı rolü: <span className="text-blue-600">{userRole}</span></>}
      </div>
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
                <th className="p-2 border-b">ID</th>
                <th className="p-2 border-b">Oluşturulma</th>
                <th className="p-2 border-b">Email</th>
                <th className="p-2 border-b">Role</th>
                <th className="p-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr key="loading"><td colSpan={6} className="text-center py-6">Yükleniyor...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr key="empty"><td colSpan={6} className="text-center py-6">Kullanıcı bulunamadı.</td></tr>
              ) : filteredUsers.map(user => (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </td>
                    <td className="p-2 border-b font-mono text-xs">{user.id}</td>
                    <td className="p-2 border-b font-mono text-xs">{user.created_at}</td>
                    <td className="p-2 border-b">{user.email}</td>
                    <td className="p-2 border-b">{user.role}</td>
                    <td className="p-2 border-b text-right">
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                        onClick={() => startEdit(user)}
                        disabled={editingId !== null && editingId !== user.id}
                        type="button"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                  {editingId === user.id && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 border-b">
                        <div className="flex flex-col gap-2 p-4">
                          <div className="flex gap-4 flex-wrap">
                            <div>
                              <label className="block text-xs text-gray-600">ID</label>
                              <input
                                type="text"
                                name="id"
                                value={editForm.id || ''}
                                disabled
                                className="border rounded px-2 py-1 bg-gray-100 text-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Oluşturulma</label>
                              <input
                                type="text"
                                name="created_at"
                                value={editForm.created_at || ''}
                                disabled
                                className="border rounded px-2 py-1 bg-gray-100 text-gray-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Email</label>
                              <input
                                type="email"
                                name="email"
                                value={editForm.email || ''}
                                onChange={handleEditChange}
                                className="border rounded px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">Role</label>
                              <select
                                name="role"
                                value={editForm.role || ''}
                                onChange={handleEditChange}
                                className="border rounded px-2 py-1"
                              >
                                <option value="">Seçiniz</option>
                                <option value="Founder">Founder</option>
                                <option value="Admin">Admin</option>
                                <option value="Editor">Editor</option>
                                <option value="Student">Student</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                              onClick={cancelEdit}
                              type="button"
                            >
                              Kapat
                            </button>
                            {/* <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Kaydet</button> */}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
