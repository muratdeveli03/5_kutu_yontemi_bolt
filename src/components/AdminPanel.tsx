import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, Users, BookOpen, Instagram, UserCog } from 'lucide-react';
import StudentUpload from './admin/StudentUpload';
import WordUpload from './admin/WordUpload';
import WordManagement from './admin/WordManagement';
import StudentManagement from './admin/StudentManagement';

type AdminView = 'students' | 'words' | 'manage' | 'studentManage';

export default function AdminPanel() {
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('students');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-4 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Paneli</h2>
                <p className="text-gray-600">Sistem Yönetimi</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setActiveView('students')}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              activeView === 'students'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Öğrenci Yükle
          </button>
          <button
            onClick={() => setActiveView('studentManage')}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              activeView === 'studentManage'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <UserCog className="w-5 h-5 inline mr-2" />
            Öğrenci Yönetimi
          </button>
          <button
            onClick={() => setActiveView('words')}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              activeView === 'words'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Kelime Yükle
          </button>
          <button
            onClick={() => setActiveView('manage')}
            className={`py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              activeView === 'manage'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Kelime Yönetimi
          </button>
        </div>

        {activeView === 'students' && <StudentUpload />}
        {activeView === 'studentManage' && <StudentManagement />}
        {activeView === 'words' && <WordUpload />}
        {activeView === 'manage' && <WordManagement />}

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
