import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Word } from '../lib/supabase';
import { Box } from 'lucide-react';

interface ProgressViewProps {
  stats: {
    box1: number;
    box2: number;
    box3: number;
    box4: number;
    box5: number;
    total: number;
  };
}

interface WordInBox {
  id: string;
  english: string;
  turkish: string;
  box_number: number;
}

export default function ProgressView({ stats }: ProgressViewProps) {
  const { student } = useAuth();
  const [selectedBox, setSelectedBox] = useState<number>(1);
  const [wordsInBox, setWordsInBox] = useState<WordInBox[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWordsInBox(selectedBox);
  }, [selectedBox, student]);

  const loadWordsInBox = async (boxNumber: number) => {
    if (!student) return;

    setLoading(true);
    try {
      const { data: classWords } = await supabase
        .from('words')
        .select('*')
        .eq('class', student.class);

      if (!classWords) {
        setWordsInBox([]);
        setLoading(false);
        return;
      }

      const { data: progress } = await supabase
        .from('student_progress')
        .select('word_id, box_number')
        .eq('student_id', student.id)
        .eq('box_number', boxNumber);

      if (boxNumber === 1) {
        const progressedWordIds = new Set(
          (await supabase
            .from('student_progress')
            .select('word_id')
            .eq('student_id', student.id)).data?.map((p) => p.word_id) || []
        );

        const box1Words = classWords
          .filter((word) => !progressedWordIds.has(word.id))
          .map((word) => ({
            id: word.id,
            english: word.english,
            turkish: word.turkish,
            box_number: 1,
          }));

        const progressedBox1 = progress
          ? classWords
              .filter((word) => progress.some((p) => p.word_id === word.id))
              .map((word) => ({
                id: word.id,
                english: word.english,
                turkish: word.turkish,
                box_number: 1,
              }))
          : [];

        setWordsInBox([...box1Words, ...progressedBox1]);
      } else {
        const progressWordIds = progress?.map((p) => p.word_id) || [];
        const words = classWords
          .filter((word) => progressWordIds.includes(word.id))
          .map((word) => ({
            id: word.id,
            english: word.english,
            turkish: word.turkish,
            box_number: boxNumber,
          }));
        setWordsInBox(words);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      setLoading(false);
    }
  };

  const getBoxColor = (box: number) => {
    switch (box) {
      case 1:
        return 'from-red-400 to-red-500';
      case 2:
        return 'from-orange-400 to-orange-500';
      case 3:
        return 'from-yellow-400 to-yellow-500';
      case 4:
        return 'from-blue-400 to-blue-500';
      case 5:
        return 'from-green-400 to-green-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getBoxBorder = (box: number) => {
    switch (box) {
      case 1:
        return 'border-red-300';
      case 2:
        return 'border-orange-300';
      case 3:
        return 'border-yellow-300';
      case 4:
        return 'border-blue-300';
      case 5:
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Kelime Dağılımı
        </h3>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((box) => (
            <button
              key={box}
              onClick={() => setSelectedBox(box)}
              className={`p-4 rounded-xl transition-all ${
                selectedBox === box
                  ? `bg-gradient-to-br ${getBoxColor(box)} text-white shadow-lg scale-105`
                  : `bg-gray-50 hover:bg-gray-100 border-2 ${getBoxBorder(box)}`
              }`}
            >
              <Box className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold text-2xl">
                {stats[`box${box}` as keyof typeof stats]}
              </div>
              <div className="text-sm font-semibold">Kutu {box}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4">
            Kutu {selectedBox} Kelimeleri ({wordsInBox.length} kelime)
          </h4>

          {loading ? (
            <div className="text-center text-gray-600 py-8">Yükleniyor...</div>
          ) : wordsInBox.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Bu kutuda henüz kelime yok.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {wordsInBox.map((word) => (
                <div
                  key={word.id}
                  className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="font-bold text-lg text-gray-800 mb-1">
                    {word.english}
                  </div>
                  <div className="text-gray-600">{word.turkish}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-green-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Genel İlerleme
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">Toplam Kelime:</span>
            <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold">Kutu 5'e Ulaşan:</span>
            <span className="text-2xl font-bold text-green-600">{stats.box5}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all"
              style={{ width: `${(stats.box5 / stats.total) * 100}%` }}
            />
          </div>
          <div className="text-center text-gray-600 font-semibold">
            Başarı Oranı: {stats.total > 0 ? Math.round((stats.box5 / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}
