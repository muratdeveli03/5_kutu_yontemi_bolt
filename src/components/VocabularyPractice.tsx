import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Word, StudentProgress } from '../lib/supabase';
import { CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';

interface VocabularyPracticeProps {
  onProgressUpdate: () => void;
}

export default function VocabularyPractice({ onProgressUpdate }: VocabularyPracticeProps) {
  const { student } = useAuth();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [movedToBox, setMovedToBox] = useState<number | null>(null);
  const [wordsToStudy, setWordsToStudy] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadWordsForToday();
  }, [student]);

  const loadWordsForToday = async () => {
    if (!student) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: classWords } = await supabase
        .from('words')
        .select('*')
        .eq('class', student.class);

      if (!classWords || classWords.length === 0) {
        setCompleted(true);
        setLoading(false);
        return;
      }

      const { data: progressData } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', student.id);

      const progressMap = new Map<string, StudentProgress>();
      if (progressData) {
        progressData.forEach((p) => progressMap.set(p.word_id, p));
      }

      const wordsWithProgress = classWords.map((word) => ({
        word,
        progress: progressMap.get(word.id),
      }));

      const unstudiedToday = wordsWithProgress.filter(
        ({ progress }) =>
          !progress || progress.last_studied_date !== today
      );

      if (unstudiedToday.length === 0) {
        setCompleted(true);
        setLoading(false);
        return;
      }

      const highestBox = Math.max(
        ...unstudiedToday.map(({ progress }) => progress?.box_number || 1)
      );

      const wordsForToday: Word[] = [];
      for (let box = highestBox; box >= 1; box--) {
        const boxWords = unstudiedToday
          .filter(({ progress }) => (progress?.box_number || 1) === box)
          .map(({ word }) => word);
        wordsForToday.push(...boxWords);
      }

      setWordsToStudy(wordsForToday);
      if (wordsForToday.length > 0) {
        setCurrentWord(wordsForToday[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!currentWord || !userAnswer.trim()) return;

    const turkishMeanings = currentWord.turkish
      .split(';')
      .map((m) => m.trim().toLowerCase());
    const userAnswerLower = userAnswer.trim().toLowerCase();

    const isCorrect = turkishMeanings.some((meaning) =>
      meaning.includes(userAnswerLower) || userAnswerLower.includes(meaning)
    );

    setFeedback(isCorrect ? 'correct' : 'incorrect');
  };

  const handleNext = async () => {
    if (!currentWord || !student || feedback === null) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: existingProgress } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', student.id)
        .eq('word_id', currentWord.id)
        .maybeSingle();

      let newBoxNumber = 1;
      if (feedback === 'correct') {
        newBoxNumber = existingProgress
          ? Math.min(existingProgress.box_number + 1, 5)
          : 2;
      } else {
        newBoxNumber = existingProgress?.box_number || 1;
      }

      if (existingProgress) {
        await supabase
          .from('student_progress')
          .update({
            box_number: newBoxNumber,
            last_studied_date: today,
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase.from('student_progress').insert({
          student_id: student.id,
          word_id: currentWord.id,
          box_number: newBoxNumber,
          last_studied_date: today,
        });
      }

      if (feedback === 'correct') {
        setMovedToBox(newBoxNumber);
        setTimeout(() => setMovedToBox(null), 2000);
      }

      onProgressUpdate();

      const nextIndex = currentIndex + 1;
      if (nextIndex < wordsToStudy.length) {
        setCurrentIndex(nextIndex);
        setCurrentWord(wordsToStudy[nextIndex]);
        setUserAnswer('');
        setFeedback(null);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 border-2 border-blue-100 text-center">
        <div className="text-lg md:text-xl text-gray-600">Kelimeler yükleniyor...</div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 border-2 border-green-200 text-center">
        <Trophy className="w-16 md:w-20 h-16 md:h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Tebrikler!
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-4">
          Bugünlük çalışma tamamlandı!
        </p>
        <p className="text-gray-500 text-base md:text-lg">
          Yarın yeni kelimelerle devam edebilirsin.
        </p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 border-2 border-blue-100 text-center">
        <p className="text-lg md:text-xl text-gray-600">Henüz kelime yüklenmedi.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 border-2 border-blue-100">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <span className="text-gray-600 font-semibold text-sm md:text-base">
            Kelime {currentIndex + 1} / {wordsToStudy.length}
          </span>
          <div className="flex gap-1 flex-wrap">
            {wordsToStudy.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                  idx < currentIndex
                    ? 'bg-green-500'
                    : idx === currentIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / wordsToStudy.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-6 md:mb-8 overflow-x-auto">
        <div className="inline-block bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 md:px-8 py-4 md:py-6 rounded-3xl shadow-lg mb-4">
          <p className="text-3xl md:text-6xl font-bold">{currentWord.english}</p>
        </div>
      </div>

      {feedback === null ? (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-base md:text-lg">
              Türkçe karşılığını yaz:
            </label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Cevabını buraya yaz..."
              className="w-full px-3 md:px-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-base md:text-lg"
              autoFocus
            />
          </div>

          <button
            onClick={checkAnswer}
            disabled={!userAnswer.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kontrol Et
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback === 'correct' ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 md:p-6 text-center">
              <CheckCircle className="w-12 md:w-16 h-12 md:h-16 text-green-500 mx-auto mb-3" />
              <p className="text-xl md:text-2xl font-bold text-green-700 mb-2">Doğru!</p>
              {movedToBox && (
                <p className="text-green-600 text-base md:text-lg">
                  Kelime Kutu {movedToBox}'ya taşındı!
                </p>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 md:p-6 text-center">
              <XCircle className="w-12 md:w-16 h-12 md:h-16 text-red-500 mx-auto mb-3" />
              <p className="text-xl md:text-2xl font-bold text-red-700 mb-2">Yanlış!</p>
              <p className="text-gray-700 text-base md:text-lg break-words">
                Doğru cevap: <span className="font-bold">{currentWord.turkish}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Sonraki Kelime</span>
            <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
