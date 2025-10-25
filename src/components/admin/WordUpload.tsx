import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function WordUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      setResult({
        type: 'error',
        message: 'Lütfen geçerli bir CSV dosyası seçin.',
      });
    }
  };

  const parseCSV = (text: string): { class: string; english: string; turkish: string }[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const words = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        words.push({
          class: parts[0],
          english: parts[1],
          turkish: parts[2],
        });
      }
    }

    return words;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const words = parseCSV(text);

      if (words.length === 0) {
        setResult({
          type: 'error',
          message: 'CSV dosyasında geçerli kelime bulunamadı.',
          details: 'Format: class,english,turkish',
        });
        setUploading(false);
        return;
      }

      const { error } = await supabase.from('words').insert(words);

      if (error) {
        setResult({
          type: 'error',
          message: 'Kelimeler yüklenirken hata oluştu.',
          details: error.message,
        });
      } else {
        const { data: allStudents } = await supabase.from('students').select('id, class');

        if (allStudents) {
          const classesWithNewWords = [...new Set(words.map((w) => w.class))];

          for (const studentClass of classesWithNewWords) {
            const studentsInClass = allStudents.filter((s) => s.class === studentClass);
            const newWordsForClass = words.filter((w) => w.class === studentClass);

            const { data: newWordRecords } = await supabase
              .from('words')
              .select('id')
              .eq('class', studentClass)
              .in(
                'english',
                newWordsForClass.map((w) => w.english)
              );

            if (newWordRecords && studentsInClass.length > 0) {
              const progressRecords = [];
              for (const student of studentsInClass) {
                for (const word of newWordRecords) {
                  const { data: existing } = await supabase
                    .from('student_progress')
                    .select('id')
                    .eq('student_id', student.id)
                    .eq('word_id', word.id)
                    .maybeSingle();

                  if (!existing) {
                    progressRecords.push({
                      student_id: student.id,
                      word_id: word.id,
                      box_number: 1,
                      last_studied_date: null,
                    });
                  }
                }
              }

              if (progressRecords.length > 0) {
                await supabase.from('student_progress').insert(progressRecords);
              }
            }
          }
        }

        setResult({
          type: 'success',
          message: `Başarıyla yüklendi!`,
          details: `${words.length} kelime sisteme eklendi ve Kutu 1'e yerleştirildi.`,
        });
        setFile(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        type: 'error',
        message: 'Yükleme sırasında bir hata oluştu.',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-green-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Kelime Yükle</h3>

      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-gray-800 mb-2">CSV Format:</h4>
        <code className="text-sm text-gray-700">
          class,english,turkish
          <br />
          9,Hello,Merhaba;Selam
          <br />
          9,Book,Kitap
          <br />
          10,Computer,Bilgisayar
        </code>
        <p className="text-sm text-gray-600 mt-2">
          * Birden fazla Türkçe anlam için noktalı virgül (;) kullanın.
          <br />* Yeni kelimeler otomatik olarak Kutu 1'e eklenir.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            CSV Dosyası Seç:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
          />
        </div>

        {file && (
          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <p className="text-gray-700">
              <strong>Seçilen dosya:</strong> {file.name}
            </p>
          </div>
        )}

        {result && (
          <div
            className={`p-4 rounded-xl border-2 ${
              result.type === 'success'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <p
                className={`font-bold ${
                  result.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.message}
              </p>
            </div>
            {result.details && (
              <p className="text-sm text-gray-700">{result.details}</p>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>Yükleniyor...</>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Kelimeleri Yükle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
