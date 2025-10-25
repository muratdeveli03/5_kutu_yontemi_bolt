import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Lock, Instagram } from 'lucide-react';

export default function Login() {
  const [code, setCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { login, adminLogin } = useAuth();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Lütfen öğrenci kodunuzu girin');
      return;
    }

    const success = await login(code.trim());
    if (!success) {
      setError('Öğrenci kodu bulunamadı. Lütfen kontrol edin.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await adminLogin(adminPassword);
    if (!success) {
      setError('Yanlış şifre!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              5 Kutu Yöntemi
            </h1>
            <p className="text-gray-600 text-lg">
              Kelime Öğrenme Sistemi
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsAdminMode(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                !isAdminMode
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Öğrenci Girişi
            </button>
            <button
              onClick={() => setIsAdminMode(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                isAdminMode
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-1" />
              Admin
            </button>
          </div>

          {!isAdminMode ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  Öğrenci Kodu
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Kodunuzu girin"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Giriş Yap
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  Admin Şifresi
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Admin Girişi
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6 text-gray-600">
          <p className="flex items-center justify-center gap-2">
            Prepared by Murat Develi |
            <Instagram className="w-5 h-5" />
            zoom_ingilizce
          </p>
        </div>
      </div>
    </div>
  );
}
