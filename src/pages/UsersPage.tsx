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

  // --- SEND EMAIL MODAL STATE ---
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [templates, setTemplates] = useState<Array<{ name: string; file: string; previewHtml: string; variables?: Array<{ key: string; label: string; defaultValue: string; currentValue?: string }> }>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [dynamicNameEnabled, setDynamicNameEnabled] = useState(false);

  // Send Email butonuna basınca modalı aç
  const handleSendEmail = () => {
    setShowSendEmailModal(true);
    setSelectedTemplate(null);
    setTemplateError(null);
    setShowPreview(false);
    setPreviewHtml('');
    setEmailSubject('');
    setDynamicNameEnabled(false);
    setLoadingTemplates(true);
    fetch('http://localhost:8000/api/email-templates', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Mail şablonları alınamadı.');
        }
        return res.json();
      })
      .then(data => {
        console.log('Tüm şablonlar:', data.templates);
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
      })
      .catch(e => setTemplateError(e.message || 'Mail şablonları alınamadı.'))
      .finally(() => setLoadingTemplates(false));
  };

  // Seçili template değişkenleri state
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});

  // Template seçildiğinde defaultları yükle (artık backendden gelen variables ile):
  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateVars({});
      setDynamicNameEnabled(false); // Template değiştiğinde dynamic name'i sıfırla
      return;
    }
    const selected = templates.find(t => String(t.file).trim() === String(selectedTemplate).trim());
    console.log('Seçili şablon:', selected);
    
    // Eğer template'de recipientName yoksa dynamic name'i kapat
    const hasRecipientName = selected?.variables?.some(v => v.key === 'recipientName');
    if (!hasRecipientName) {
      setDynamicNameEnabled(false);
    }
    
    if (selected && Array.isArray(selected.variables) && selected.variables.length > 0) {
      const vars = selected.variables.reduce((acc: Record<string, string>, v) => {
        // Önce currentValue varsa onu kullan, yoksa defaultValue'yu kullan
        acc[v.key] = v.currentValue ?? v.defaultValue ?? '';
        return acc;
      }, {});
      setTemplateVars(vars);
    } else {
      setTemplateVars({});
    }
  }, [selectedTemplate, templates]);

  // Input değişimi
  const handleVarChange = (key: string, value: string) => {
    setTemplateVars(vars => ({ ...vars, [key]: value }));
    // Değişken değiştiğinde preview'i sıfırla ki yeni preview alınsın
    setShowPreview(false);
    setPreviewHtml('');
  };

  // Dinamik isim özelliğini aç/kapat
  const toggleDynamicName = () => {
    setDynamicNameEnabled(!dynamicNameEnabled);
    if (!dynamicNameEnabled) {
      // Dinamik mod açılıyorsa recipientName'i placeholder ile doldur
      setTemplateVars(vars => ({ ...vars, recipientName: '[DYNAMIC_NAME]' }));
    } else {
      // Dinamik mod kapatılıyorsa boş string yap
      setTemplateVars(vars => ({ ...vars, recipientName: '' }));
    }
    // Preview'i sıfırla
    setShowPreview(false);
    setPreviewHtml('');
  };

  // Preview butonuna basınca template'i backend'den alıp göster
  const handlePreview = async () => {
    if (!selectedTemplate) return;
    
    setLoadingPreview(true);
    try {
      const response = await fetch('http://localhost:8000/api/email-templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateFile: selectedTemplate,
          variables: templateVars
        })
      });

      if (!response.ok) {
        throw new Error('Preview alınamadı');
      }

      const data = await response.json();
      setPreviewHtml(data.html || '');
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Template preview alınamadı');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Email gönderme fonksiyonu
  const handleSendEmailAction = async () => {
    if (!selectedTemplate || !emailSubject || selected.length === 0) return;
    
    const confirmMessage = dynamicNameEnabled 
      ? `${selected.length} kullanıcıya "${emailSubject}" konulu KİŞİSELLEŞTİRİLMİŞ email gönderilecek.\n\nHer kullanıcı kendi ismi ile email alacak. Emin misiniz?`
      : `${selected.length} kullanıcıya "${emailSubject}" konulu email gönderilecek. Emin misiniz?`;
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      // Seçili kullanıcıların email adreslerini ve bilgilerini topla
      const selectedUsers = users.filter(user => 
        selected.includes(user.id || user.eduUsername || user.name)
      );
      
      const emailAddresses = selectedUsers.map(user => user.signUpMail || user.email).filter(Boolean);
      
      if (emailAddresses.length === 0) {
        alert('Seçili kullanıcıların email adresleri bulunamadı.');
        return;
      }

      // Dinamik isim özelliği aktifse kullanıcı bilgilerini de gönder
      const emailData = {
        to: emailAddresses,
        subject: emailSubject,
        templateFile: selectedTemplate,
        variables: templateVars,
        ...(dynamicNameEnabled && {
          dynamicName: true,
          users: selectedUsers.map(user => ({
            email: user.signUpMail || user.email,
            name: user.name || user.fullName || user.eduUsername || 'Kullanıcı',
            // Diğer yararlı bilgiler
            institution: user.institution,
            department: user.department,
            title: user.titles?.[0] || user.title
          }))
        })
      };

      const response = await fetch('http://localhost:8000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      
      if (response.ok) {
        const message = dynamicNameEnabled 
          ? `Email başarıyla gönderildi! ${emailAddresses.length} kullanıcıya kişiselleştirilmiş email ulaştı.`
          : `Email başarıyla gönderildi! ${emailAddresses.length} kullanıcıya ulaştı.`;
        alert(message);
        setShowSendEmailModal(false);
        setShowPreview(false);
        setPreviewHtml('');
        setSelected([]);
        setDynamicNameEnabled(false);
      } else {
        throw new Error(result.error || 'Email gönderimi başarısız');
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert('Email gönderimi başarısız: ' + (error as Error).message);
    }
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
        {/* Send Email butonu */}
        {selected.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleSendEmail}
            >
              Send Email
            </button>
          </div>
        )}
        {/* Send Email Modal */}
        {showSendEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded shadow-lg p-8 w-full max-w-3xl relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-3xl" onClick={() => {
                setShowSendEmailModal(false);
                setShowPreview(false);
                setPreviewHtml('');
                setDynamicNameEnabled(false);
              }}>&times;</button>
              <h2 className="text-2xl font-bold mb-6">Send Email to Selected Users</h2>
              {/* Eposta konusu inputu */}
              <div className="mb-6">
                <label className="block text-lg font-medium mb-2" htmlFor="emailSubject">Email Subject</label>
                <input
                  id="emailSubject"
                  type="text"
                  className="w-full border rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>
              {/* Template seçimi dropdown */}
              <div className="mb-8">
                <label className="block text-lg font-medium mb-2" htmlFor="templateSelect">Select Template</label>
                <select
                  id="templateSelect"
                  className="w-full border rounded px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={selectedTemplate || ''}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  disabled={loadingTemplates || templates.length === 0}
                >
                  <option value="" disabled>Select a template...</option>
                  {templates.map(t => (
                    <option key={t.file} value={t.file}>{t.name}</option>
                  ))}
                </select>
                {loadingTemplates && <div className="mt-2 text-gray-500">Templates loading...</div>}
                {templateError && <div className="mt-2 text-red-600">{templateError}</div>}
                {!loadingTemplates && !templateError && templates.length === 0 && <div className="mt-2 text-gray-500">No templates found.</div>}
              </div>
              {/* Şablon değişkenleri paneli */}
              {selectedTemplate && (
                <div className="mb-8 border rounded bg-gray-50 p-4">
                  <div className="font-semibold text-lg mb-4">Şablon Değişkenleri</div>
                  {(() => {
                    const selected = templates.find(t => String(t.file).trim() === String(selectedTemplate).trim());
                    let vars = Array.isArray(selected?.variables) ? selected.variables : [];
                    if (!vars || vars.length === 0) {
                      // Ekstra uyarı: Backend'den variables hiç gelmiyorsa
                      if (selected && !Array.isArray(selected.variables)) {
                        return <div className="text-red-500 italic">Bu şablonun değişkenleri backend tarafından bulunamadı. Şablonun export şekli veya interface tanımı kontrol edilmeli.</div>;
                      }
                      return <div className="text-gray-500 italic">Bu şablonun değişkeni yok.</div>;
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vars.map((v) => (
                          <div key={v.key} className="flex flex-col mb-2">
                            <label className="text-base font-medium mb-1" htmlFor={`var-${v.key}`}>{v.label || v.key}</label>
                            <div className="relative">
                              <input
                                id={`var-${v.key}`}
                                type="text"
                                className={`border rounded px-3 py-2 text-base ${v.key === 'recipientName' ? 'pr-12' : ''} ${dynamicNameEnabled && v.key === 'recipientName' ? 'bg-gray-100' : ''}`}
                                value={templateVars[v.key] ?? v.currentValue ?? v.defaultValue ?? ''}
                                onChange={e => handleVarChange(v.key, e.target.value)}
                                placeholder={v.label || v.key}
                                disabled={dynamicNameEnabled && v.key === 'recipientName'}
                              />
                              {v.key === 'recipientName' && (
                                <button
                                  type="button"
                                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                                    dynamicNameEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                  onClick={toggleDynamicName}
                                  title={dynamicNameEnabled ? 'Manuel isim girişi yap' : 'Dinamik isim kullan (Her kullanıcıya kendi ismi)'}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            {v.key === 'recipientName' && dynamicNameEnabled && (
                              <div className="text-sm text-blue-600 mt-1">
                                📧 Her kullanıcıya kendi ismi ile email gönderilecek
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
              {/* Seçili template önizlemesi */}
              {showPreview && (
                <div className="mb-8">
                  <div className="font-semibold text-lg mb-2 flex items-center gap-2">
                    Template Preview
                    {dynamicNameEnabled && (
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        🔄 Dinamik isim aktif
                      </span>
                    )}
                  </div>
                  {dynamicNameEnabled && (
                    <div className="text-sm text-blue-600 mb-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                      💡 Preview'de "[DYNAMIC_NAME]" görüyorsanız, gerçek emailde her kullanıcının kendi ismi yer alacak.
                    </div>
                  )}
                  <div className="border rounded bg-gray-50 p-4 overflow-x-auto" style={{ minHeight: 200, maxHeight: 400 }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded text-lg flex-1 disabled:opacity-50"
                  disabled={!selectedTemplate || !emailSubject || loadingPreview}
                  onClick={handlePreview}
                >
                  {loadingPreview ? 'Loading Preview...' : 'Preview'}
                </button>
                
                {showPreview && (
                  <button
                    className="bg-green-600 text-white px-6 py-3 rounded text-lg flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={!selectedTemplate || !emailSubject}
                    onClick={handleSendEmailAction}
                  >
                    {dynamicNameEnabled && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                    {dynamicNameEnabled ? 'Send Personalized Emails' : 'Send Email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
