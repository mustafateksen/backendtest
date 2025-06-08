import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  totalItems: number;
}

const tabApiMap = {
  Student: {
    url: '/api/users/student', key: 'students', columns: [
      { key: 'eduUsername', label: 'Username' },
      { key: 'name', label: 'Name' },
      { key: 'surname', label: 'Surname' },
      { key: 'email', label: 'Email' }, // email = signUpMail
      { key: 'imageSrc', label: 'Image' },
      { key: 'gender', label: 'Gender' },
      { key: 'institution', label: 'Institution' },
      { key: 'department', label: 'Department' },
      { key: 'grade', label: 'Grade' },
      { key: 'bio', label: 'Bio' },
      { key: 'isVerifiedAccount', label: 'Verified Account' },
      { key: 'isEduMailVerified', label: 'Edu Mail Verified' },
      { key: 'arxps', label: 'XP' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
    ]
  },
  Community: {
    url: '/api/users/community',
    key: 'communities',
    columns: [
      { key: 'logoSrc', label: 'Logo' },
      { key: 'eduUsername', label: 'Username' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' }, // email = signUpMail
      { key: 'abbreviation', label: 'Abbreviation' },
      { key: 'foundingYear', label: 'Founding Year' },
      { key: 'fields', label: 'Fields' },
      { key: 'bio', label: 'Bio' },
      { key: 'about', label: 'About' },
      { key: 'website', label: 'Website' },
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'twitter', label: 'Twitter' },
      { key: 'instagram', label: 'Instagram' },
      { key: 'youtube', label: 'YouTube' },
      { key: 'university', label: 'University' },
      { key: 'campusLocation', label: 'Campus' },
      { key: 'buildingName', label: 'Building' },
      { key: 'roomNumber', label: 'Room' },
      { key: 'city', label: 'City' },
      { key: 'country', label: 'Country' },
      { key: 'contactMail', label: 'Contact Mail' },
      { key: 'isVerifiedAccount', label: 'Verified Account' },
      { key: 'isVerifiedOrganization', label: 'Verified Organization' },
      { key: 'arxps', label: 'XP' },
      { key: 'members', label: 'Members' },
      { key: 'followers', label: 'Followers' },
      { key: 'followings', label: 'Followings' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
    ],
  },
  Company: {
    url: '/api/users/company',
    key: 'companies',
    columns: [
      { key: 'logoSrc', label: 'Logo' },
      { key: 'eduUsername', label: 'Username' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' }, // email = signUpMail
      { key: 'foundingYear', label: 'Founding Year' },
      { key: 'sectors', label: 'Sectors' },
      { key: 'size', label: 'Size' },
      { key: 'bio', label: 'Bio' },
      { key: 'about', label: 'About' },
      { key: 'websiteUrl', label: 'Website' },
      { key: 'contactMail', label: 'Contact Mail' },
      { key: 'isOfficialMailVerified', label: 'Official Mail Verified' },
      { key: 'isVerifiedAccount', label: 'Verified Account' },
      { key: 'isVerifiedOrganization', label: 'Verified Organization' },
      { key: 'arxps', label: 'XP' },
      { key: 'followers', label: 'Followers' },
      { key: 'followings', label: 'Followings' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
    ],
  },
  Educator: {
    url: '/api/users/educator',
    key: 'educators',
    columns: [
      { key: 'eduUsername', label: 'Username' },
      { key: 'name', label: 'Name' },
      { key: 'surname', label: 'Surname' },
      { key: 'email', label: 'Email' }, // email = signUpMail
      { key: 'gender', label: 'Gender' },
      { key: 'institution', label: 'Institution' },
      { key: 'titles', label: 'Titles' },
      { key: 'bio', label: 'Bio' },
      { key: 'about', label: 'About' },
      { key: 'imageSrc', label: 'Image' },
      { key: 'isVerifiedAccount', label: 'Verified Account' },
      { key: 'isEduMailVerified', label: 'Edu Mail Verified' },
      { key: 'arxps', label: 'XP' },
      { key: 'followers', label: 'Followers' },
      { key: 'followings', label: 'Followings' },
    ],
  },
};

function UsersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Student' | 'Community' | 'Company' | 'Educator'>('Student');
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, hasMore: false, totalItems: 0 });
  const [limit, setLimit] = useState(15); // Sayfa başı kullanıcı
  const [showMailModal, setShowMailModal] = useState(false);
  const [templates, setTemplates] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);

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

  // Tab ve sayfa değişince kullanıcıları çek
  useEffect(() => {
    if (!authChecked) return;
    setLoading(true);
    setUsers([]);
    setSelected([]);
    const { url, key } = tabApiMap[activeTab];
    fetch(`http://localhost:8000${url}?page=${pagination.currentPage}&limit=${limit}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Kullanıcılar alınamadı');
        return res.json();
      })
      .then(data => {
        // CampusArc API pagination: { students: [...], pagination: {...} } veya { students: [...], page: 1, totalPages: 5, ... }
        if (Array.isArray(data[key])) setUsers(data[key]);
        else setUsers([]);
        // Pagination bilgisi farklı formatlarda gelebilir
        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.currentPage || data.page || 1,
            totalPages: data.pagination.totalPages || data.totalPages || 1,
            hasMore: data.pagination.hasMore ?? (data.pagination.currentPage < data.pagination.totalPages),
            totalItems: data.pagination.totalItems || data.totalItems || 0,
          });
        } else {
          setPagination(prev => ({
            ...prev,
            currentPage: data.page || prev.currentPage,
            totalPages: data.totalPages || prev.totalPages,
            hasMore: typeof data.hasMore === 'boolean' ? data.hasMore : (data.page < data.totalPages),
            totalItems: data.totalItems || prev.totalItems,
          }));
        }
      })
      .catch(() => {
        setUsers([]);
        setPagination({ currentPage: 1, totalPages: 1, hasMore: false, totalItems: 0 });
      })
      .finally(() => setLoading(false));
  }, [activeTab, authChecked, pagination.currentPage, limit]);

  // Sayfa değiştir
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Pagination değişince yeni veri çek
  useEffect(() => {
    if (!authChecked) return;
    setLoading(true);
    setUsers([]);
    setSelected([]);
    const { url, key } = tabApiMap[activeTab];
    fetch(`http://localhost:8000${url}?page=${pagination.currentPage}&limit=${limit}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Kullanıcılar alınamadı');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data[key])) setUsers(data[key]);
        else setUsers([]);
        setPagination(prev => ({ ...prev, ...(data.pagination || { currentPage: 1, totalPages: 1, hasMore: false, totalItems: 0 }) }));
      })
      .catch(() => {
        setUsers([]);
        setPagination(prev => ({ ...prev, currentPage: 1, totalPages: 1, hasMore: false, totalItems: 0 }));
      })
      .finally(() => setLoading(false));
  }, [activeTab, authChecked, pagination.currentPage, limit]);

  // Tab değişince sayfa 1'e dön
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [activeTab]);

  // Checkbox işlemleri
  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  };
  const allSelected = selected.length === users.length && users.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(users.map(u => u.id));
  };

  // Send mail butonu
  const handleSendMail = () => {
    setShowMailModal(true);
  };

  // Modalda template'leri çek
  useEffect(() => {
    if (!showMailModal) return;
    setLoadingTemplates(true);
    setMailError(null);
    fetch('http://localhost:8000/api/email-templates', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Mail şablonları alınamadı.');
        }
        return res.json();
      })
      .then(data => setTemplates(Array.isArray(data.templates) ? data.templates : []))
      .catch(e => setMailError(e.message || 'Mail şablonları alınamadı.'))
      .finally(() => setLoadingTemplates(false));
  }, [showMailModal]);

  // Modalda mail gönder
  const handleSendEmails = () => {
    if (!selectedTemplate) return;
    setSending(true);
    setMailError(null);
    // Seçili kullanıcıların mail adreslerini ve isimlerini bul
    const selectedUsers = users.filter(u => selected.includes(u.id || u.eduUsername || u.name));
    // Her user için mail adresi farklı key'de olabilir, öncelik sırası: signUpMail, contactMail, email
    const emails = selectedUsers.map(u => u.signUpMail || u.contactMail || u.email).filter(Boolean);
    // Her email için parametre objesi oluştur (ör: { email: { name: ... } })
    const templateParams: Record<string, any> = {};
    selectedUsers.forEach(u => {
      const email = u.signUpMail || u.contactMail || u.email;
      if (email) {
        templateParams[email] = { name: u.name || u.fullName || u.eduUsername || email };
      }
    });
    fetch('http://localhost:8000/api/send-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        emails,
        templateId: selectedTemplate,
        userType: activeTab,
        templateParams,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Mail gönderilemedi');
        return res.json();
      })
      .then(() => {
        setShowMailModal(false);
        setSelected([]);
      })
      .catch(() => setMailError('Mail gönderilemedi.'))
      .finally(() => setSending(false));
  };

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full bg-white rounded shadow p-8">

        <div className="flex justify-end mt-8">
          <button
            className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-900"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard'a Dön
          </button>
        </div>
        {/* Tab Navigation */}
        <div className="flex justify-between mb-8 border-b">
          {(['Student', 'Community', 'Company', 'Educator'] as const).map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-150 ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
              onClick={() => {
                setActiveTab(tab);
                setPagination({ currentPage: 1, totalPages: 1, hasMore: false, totalItems: 0 });
              }}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Sayfa başı kullanıcı sayısı seçimi */}
        <div className="flex items-center justify-end mb-4 gap-2">
          <label htmlFor="perPage" className="text-sm text-gray-600">Sayfa başı:</label>
          <select
            id="perPage"
            className="border rounded px-2 py-1 text-sm"
            value={limit}
            onChange={e => {
              setPagination(prev => ({ ...prev, currentPage: 1 }));
              setLimit(Number(e.target.value));
            }}
          >
            <option value={5}>5</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
        </div>
        {/* Send mail(s) butonu */}
        {selected.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleSendMail}
            >
              Send mail(s)
            </button>
          </div>
        )}
        {/* Mail Modal */}
        {showMailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowMailModal(false)}>&times;</button>
              <h2 className="text-lg font-bold mb-4">Mail Şablonu Seç</h2>
              {loadingTemplates ? (
                <div>Şablonlar yükleniyor...</div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <div>Hiç şablon yok.</div>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => navigate('/dashboard/add-template')}>Yeni Template Ekle</button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto mb-4">
                    {templates.map(t => (
                      <div
                        key={t.id}
                        className={`border rounded p-3 cursor-pointer transition-all duration-150 ${selectedTemplate === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                        onClick={() => setSelectedTemplate(t.id)}
                      >
                        <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                          <span>{t.name}</span>
                          {selectedTemplate === t.id && <span className="ml-2 text-blue-500">✓</span>}
                        </div>
                        {t.description && <div className="text-gray-500 text-sm mt-1">{t.description}</div>}
                      </div>
                    ))}
                  </div>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
                    disabled={!selectedTemplate || sending}
                    onClick={handleSendEmails}
                  >
                    {sending ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                  <button className="mt-2 text-blue-600 underline w-full" onClick={() => navigate('/dashboard/add-template')}>Yeni Template Ekle</button>
                </>
              )}
              {mailError && <div className="text-red-600 mt-2">{mailError}</div>}
            </div>
          </div>
        )}
        {/* Tab Content: Kullanıcı listesi */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="p-2 border-b"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                {tabApiMap[activeTab].columns.map(col => (
                  <th key={col.key} className="p-2 border-b">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={tabApiMap[activeTab].columns.length + 1} className="text-center py-6">Yükleniyor...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={tabApiMap[activeTab].columns.length + 1} className="text-center py-6">Kullanıcı bulunamadı.</td></tr>
              ) : users.map((user, idx) => (
                <tr key={user.id || user.eduUsername || user.name || idx} className="hover:bg-gray-50">
                  <td className="p-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(user.id || user.eduUsername || user.name || String(idx))}
                      onChange={() => toggleSelect(user.id || user.eduUsername || user.name || String(idx))}
                    />
                  </td>
                  {tabApiMap[activeTab].columns.map(col => (
                    <td key={col.key} className="p-2 border-b">
                      {col.key === 'imageSrc' && user[col.key] ? (
                        <img src={user[col.key]} alt="profile" className="w-8 h-8 rounded-full object-cover" />
                      ) : col.key === 'logoSrc' && user[col.key] ? (
                        <img src={user[col.key]} alt="logo" className="w-8 h-8 rounded object-contain bg-white border" />
                      ) : col.key === 'email' ? (
                        user.signUpMail ? <a href={`mailto:${user.signUpMail}`} className="text-blue-600 underline">{user.signUpMail}</a> : <span className="text-gray-400">-</span>
                      ) : Array.isArray(user[col.key]) ? (
                        user[col.key].length > 0 ? user[col.key].join(', ') : <span className="text-gray-400">-</span>
                      ) : (['website', 'linkedin', 'twitter', 'instagram', 'youtube'].includes(col.key) && user[col.key]) ? (
                        <a href={user[col.key].startsWith('http') ? user[col.key] : `https://${user[col.key]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{col.label}</a>
                      ) : col.key === 'contactMail' && user[col.key] ? (
                        <a href={`mailto:${user[col.key]}`} className="text-blue-600 underline">{user[col.key]}</a>
                      ) : (col.key === 'members' || col.key === 'followers' || col.key === 'followings') && Array.isArray(user[col.key]) ? (
                        user[col.key].length
                      ) : (col.key === 'bio' || col.key === 'about') && user[col.key] ? (
                        // Strip HTML tags for display
                        (user[col.key] as string).replace(/<[^>]+>/g, '').slice(0, 120) + (user[col.key].length > 120 ? '…' : '')
                      ) : (col.key === 'createdAt' || col.key === 'updatedAt') && user[col.key] ? (
                        new Date(user[col.key]).toLocaleString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      ) : col.key === 'arxps' && typeof user[col.key] === 'number' ? (
                        user[col.key].toLocaleString('en-US')
                      ) : typeof user[col.key] === 'boolean' ? (
                        <span className={user[col.key] ? 'text-green-600 font-bold' : 'text-gray-400'}>{user[col.key] ? 'Yes' : 'No'}</span>
                      ) : (user[col.key] ?? <span className="text-gray-400">-</span>)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
          >
            Önceki
          </button>
          <span className="mx-2">{pagination.currentPage} / {pagination.totalPages}</span>
          <button
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages || loading}
          >
            Sonraki
          </button>
        </div>
        {/* Dashboard'a dön butonu */}

      </div>
    </div>
  );
}

export default UsersPage;
