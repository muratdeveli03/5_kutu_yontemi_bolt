import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentUpload() {
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

  const parseCSV = (text: string): { code: string; name: string; class: string }[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    const students = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 3) {
        students.push({
          code: parts[0],
          name: parts[1],
          class: parts[2],
        });
      }
    }

    return students;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const students = parseCSV(text);

      if (students.length === 0) {
        setResult({
          type: 'error',
          message: 'CSV dosyasında geçerli öğrenci bulunamadı.',
          details: 'Format: code,name,class',
        });
        setUploading(false);
        return;
      }

      let updated = 0;
      let inserted = 0;

      for (const student of students) {
        const { data: existing } = await supabase
          .from('students')
          .select('id')
          .ilike('code', student.code)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('students')
            .update({
              name: student.name,
              class: student.class,
            })
            .eq('id', existing.id);
          updated++;
        } else {
          await supabase.from('students').insert(student);
          inserted++;
        }
      }

      setResult({
        type: 'success',
        message: `Başarıyla yüklendi!`,
        details: `${inserted} yeni öğrenci eklendi, ${updated} öğrenci güncellendi.`,
      });
      setFile(null);
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
    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Öğrenci Yükle</h3>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-gray-800 mb-2">CSV Format:</h4>
        <code className="text-sm text-gray-700">
          code,name,class
          <br />
          9011,Ali ARIKAN,9
          <br />
          9012,Ayşe YILMAZ,9
        </code>
        <p className="text-sm text-gray-600 mt-2">
          * Aynı kod varsa öğrenci bilgileri güncellenir.
          <br />* Yeni kod ise öğrenci sisteme eklenir.
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
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
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>Yükleniyor...</>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Öğrencileri Yükle
            </>
          )}
        </button>
      </div>
    </div>
  );
}
