import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, WordWithProgress } from '../lib/supabase';
import { LogOut, BookOpen, TrendingUp, Box, Instagram } from 'lucide-react';
import VocabularyPractice from './VocabularyPractice';
import ProgressView from './ProgressView';

export default function StudentDashboard() {
  const { student, logout } = useAuth();
  const [view, setView] = useState<'practice' | 'progress'>('practice');
  const [stats, setStats] = useState({
    box1: 0,
    box2: 0,
    box3: 0,
    box4: 0,
    box5: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [student]);

  const loadStats = async () => {
    if (!student) return;

    try {
      const { data: classWords } = await supabase
        .from('words')
        .select('id')
        .eq('class', student.class);

      if (!classWords) return;

      const wordIds = classWords.map((w) => w.id);

      const { data: progress } = await supabase
        .from('student_progress')
        .select('box_number')
        .eq('student_id', student.id)
        .in('word_id', wordIds);

      const stats = {
        box1: 0,
        box2: 0,
        box3: 0,
        box4: 0,
        box5: 0,
        total: classWords.length,
      };

      if (progress) {
        progress.forEach((p) => {
          if (p.box_number === 1) stats.box1++;
          else if (p.box_number === 2) stats.box2++;
          else if (p.box_number === 3) stats.box3++;
          else if (p.box_number === 4) stats.box4++;
          else if (p.box_number === 5) stats.box5++;
        });
      }

      stats.box1 += classWords.length - (stats.box1 + stats.box2 + stats.box3 + stats.box4 + stats.box5);

      setStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const handleProgressUpdate = () => {
    loadStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-4 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{student?.name}</h2>
                <p className="text-gray-600">
                  Kod: {student?.code} | Sınıf: {student?.class}
                </p>
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

          <div className="grid grid-cols-5 gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((box) => (
              <div
                key={box}
                className={`p-3 rounded-xl text-center ${
                  box === 1
                    ? 'bg-red-100 border-2 border-red-300'
                    : box === 2
                    ? 'bg-orange-100 border-2 border-orange-300'
                    : box === 3
                    ? 'bg-yellow-100 border-2 border-yellow-300'
                    : box === 4
                    ? 'bg-blue-100 border-2 border-blue-300'
                    : 'bg-green-100 border-2 border-green-300'
                }`}
              >
                <Box className="w-6 h-6 mx-auto mb-1" />
                <div className="font-bold text-xl">
                  {stats[`box${box}` as keyof typeof stats]}
                </div>
                <div className="text-xs font-semibold">Kutu {box}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView('practice')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              view === 'practice'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Kelime Çalış
          </button>
          <button
            onClick={() => setView('progress')}
            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
              view === 'progress'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            İlerleme Durumu
          </button>
        </div>

        {view === 'practice' ? (
          <VocabularyPractice onProgressUpdate={handleProgressUpdate} />
        ) : (
          <ProgressView stats={stats} />
        )}

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
