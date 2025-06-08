import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Basit bir React Email kod editörü (monaco, codemirror gibi gelişmiş editör entegre edilebilir)
export default function AddTemplate() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(`export default function MyTemplate({ name }) {
  return (
    <div>
      <h1>Merhaba, {name}</h1>
      <p>Bu bir örnek mail şablonudur.</p>
    </div>
  );
}
`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auth kontrolü (aynı UsersPage gibi)
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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // import ve export satırlarını otomatik olarak temizle
      const cleanedCode = code
        .split('\n')
        .filter(line => !/^\s*(import|export)/.test(line.trim()))
        .join('\n');
      const res = await fetch('http://localhost:8000/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description, code: cleanedCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Şablon kaydedilemedi');
      }
      setSuccess(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10">
      <div className="w-full max-w-2xl bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Yeni Mail Şablonu Ekle</h1>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Şablon Adı</label>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Açıklama</label>
          <input className="border rounded px-3 py-2 w-full" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">React Email Şablon Kodu (TSX)</label>
          <textarea
            className="border rounded px-3 py-2 w-full font-mono text-sm"
            rows={14}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!name || !code || saving}
            onClick={handleSave}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => navigate(-1)}>İptal</button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">Şablon kaydedildi!</div>}
      </div>
    </div>
  );
}
