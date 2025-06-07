import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  created_at: string;
  email: string;
  role: string;
}

function ArcersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', role: '' });
  const [authChecked, setAuthChecked] = useState(false);

  // Login kontrolü ve kullanıcı rolünü çek
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-token', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          if (isMounted) setAuthChecked(true); // her durumda set
          navigate('/login', { replace: true });
          return;
        }
        const data = await response.json();
        if (isMounted && data && data.user) {
          setUserRole(data.user.role);
          setUserEmail(data.user.email);
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

  // Kullanıcıları çek
  useEffect(() => {
    if (!authChecked) return;
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
  }, [authChecked]);

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
      const res = await fetch('http://localhost:8000/api/delete-arcers', {
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
        const deletedSelf = result.results.filter((r: any) => r.status === 'deleted_self').map((r: any) => r.id);
        const unauthorized = result.results.filter((r: any) => r.status === 'forbidden' || r.status === 'forbidden_self').map((r: any) => r.id);
        const notFound = result.results.filter((r: any) => r.status === 'not_found').map((r: any) => r.id);
        const errors = result.results.filter((r: any) => r.status === 'error').map((r: any) => `${r.id}${r.message ? ` (${r.message})` : ''}`);

        let alertMsg = '';
        alertMsg += `Silinenler: ${deleted.length > 0 ? deleted.join(', ') : 'Yok'}\n`;
        alertMsg += `Kendi hesabını silenler: ${deletedSelf.length > 0 ? deletedSelf.join(', ') : 'Yok'}\n`;
        alertMsg += `Yetkisiz: ${unauthorized.length > 0 ? unauthorized.join(', ') : 'Yok'}\n`;
        alertMsg += `Bulunamayanlar: ${notFound.length > 0 ? notFound.join(', ') : 'Yok'}`;
        if (errors.length > 0) {
          alertMsg += `\nHatalı: ${errors.join(', ')}`;
        }
        window.alert(alertMsg);
        // Eğer kendi hesabı silindiyse veya silme sırasında hata oluştuysa logout
        if (
          (userEmail && deletedSelf.includes(userEmail)) ||
          (userEmail && deleted.includes(userEmail)) ||
          (userEmail && errors.some((err: string) => err.includes(userEmail)))
        ) {
          window.alert('Hesabınız silindi veya silinirken hata oluştu. Oturumunuz kapatılıyor...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1200);
          return;
        }
      } else {
        window.alert('Silme işlemi başarısız oldu.');
      }
      setSelected([]);
      // Kullanıcı listesini tekrar çek
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

  // Edit kaydet
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/update-arcer/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: editForm.email,
          role: editForm.role
        })
      });
      const result = await res.json();
      if (res.ok) {
        // Eğer kendi mailini değiştirdiyse ve requireReauth döndüyse logout
        if (result.requireReauth) {
          window.alert(result.message || 'Email başarıyla güncellendi. Lütfen tekrar giriş yapın.');
          // Otomatik logout ve login sayfasına yönlendirme
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          return;
        }
        window.alert('Kullanıcı başarıyla güncellendi.');
        setUsers(users =>
          users.map(u =>
            u.id === editingId
              ? { ...u, email: editForm.email || u.email, role: editForm.role || u.role }
              : u
          )
        );
        cancelEdit();
      } else {
        window.alert(result.error || 'Güncelleme başarısız oldu.');
      }
    } catch (e) {
      window.alert('Güncelleme başarısız oldu.');
    }
  };

  // Kullanıcı ekle
  const handleAddUser = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/add-arcer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: addForm.email,
          password: addForm.password,
          role: addForm.role
        })
      });
      const result = await res.json();
      if (res.ok) {
        window.alert('Kullanıcı başarıyla eklendi.');
        setShowAddForm(false);
        setAddForm({ email: '', password: '', role: '' });
        // Kullanıcı listesini güncelle
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
      } else {
        window.alert(result.error || 'Kullanıcı ekleme başarısız oldu.');
      }
    } catch (e) {
      window.alert('Kullanıcı ekleme başarısız oldu.');
    }
  };

  // Return kısmı
  return (
    !authChecked ? (
      <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>
    ) : (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
        {/* Dashboard'a dön tuşu */}
        <div className="w-full max-w-3xl flex justify-start mb-4">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard'a Dön
          </button>
        </div>
        {/* Giriş yapan kullanıcının maili */}
        {userEmail && (
          <div className="mb-2 text-base font-medium text-gray-700">
            Giriş yapan kullanıcı maili: <span className="text-blue-600">{userEmail}</span>
          </div>
        )}
        {/* Kullanıcı rolü üstte gösteriliyor */}
        <div className="mb-4 text-lg font-semibold text-gray-700">
          {userRole && <>Giriş yapan kullanıcı rolü: <span className="text-blue-600">{userRole}</span></>}
        </div>
        <div className="w-full max-w-3xl bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowAddForm(true)}
            >
              Arcer Ekle
            </button>
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded border flex flex-col gap-4">
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="block text-xs text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={addForm.email}
                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Şifre</label>
                  <input
                    type="password"
                    name="password"
                    value={addForm.password}
                    onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Rol</label>
                  <select
                    name="role"
                    value={addForm.role}
                    onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Founder">Founder</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  onClick={() => { setShowAddForm(false); setAddForm({ email: '', password: '', role: '' }); }}
                  type="button"
                >
                  İptal
                </button>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  type="button"
                  onClick={handleAddUser}
                >
                  Ekle
                </button>
              </div>
            </div>
          )}
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
                                  {/* <option value="Student">Student</option> */}
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
                              <button
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                onClick={saveEdit}
                                type="button"
                              >
                                Kaydet
                              </button>
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
    )
  );
}

export default ArcersPage;
