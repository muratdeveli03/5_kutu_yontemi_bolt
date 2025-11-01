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
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 mb-6 border-2 border-green-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-12 md:w-14 h-12 md:h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 md:w-7 h-6 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Admin Paneli</h2>
                <p className="text-gray-600 text-sm md:text-base">Sistem Yönetimi</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold text-sm md:text-base whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
          <button
            onClick={() => setActiveView('students')}
            className={`py-3 md:py-4 px-2 md:px-6 rounded-2xl font-bold text-xs md:text-lg transition-all ${
              activeView === 'students'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Users className="w-4 md:w-5 h-4 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Öğrenci Yükle</span>
            <span className="sm:hidden">Yükle</span>
          </button>
          <button
            onClick={() => setActiveView('studentManage')}
            className={`py-3 md:py-4 px-2 md:px-6 rounded-2xl font-bold text-xs md:text-lg transition-all ${
              activeView === 'studentManage'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <UserCog className="w-4 md:w-5 h-4 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Öğrenci Yönetimi</span>
            <span className="sm:hidden">Yönet</span>
          </button>
          <button
            onClick={() => setActiveView('words')}
            className={`py-3 md:py-4 px-2 md:px-6 rounded-2xl font-bold text-xs md:text-lg transition-all ${
              activeView === 'words'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Upload className="w-4 md:w-5 h-4 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Kelime Yükle</span>
            <span className="sm:hidden">Yükle</span>
          </button>
          <button
            onClick={() => setActiveView('manage')}
            className={`py-3 md:py-4 px-2 md:px-6 rounded-2xl font-bold text-xs md:text-lg transition-all ${
              activeView === 'manage'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <BookOpen className="w-4 md:w-5 h-4 md:h-5 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Kelime Yönetimi</span>
            <span className="sm:hidden">Yönet</span>
          </button>
        </div>

        {activeView === 'students' && <StudentUpload />}
        {activeView === 'studentManage' && <StudentManagement />}
        {activeView === 'words' && <WordUpload />}
        {activeView === 'manage' && <WordManagement />}

        <div className="text-center mt-6 text-gray-600">
          <p className="flex items-center justify-center gap-2 text-xs md:text-sm">
            Prepared by Murat Develi |
            <Instagram className="w-4 md:w-5 h-4 md:h-5" />
            zoom_ingilizce
          </p>
        </div>
      </div>
    </div>
  );
}
