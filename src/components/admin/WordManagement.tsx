import { useState, useEffect } from 'react';
import { supabase, Word } from '../../lib/supabase';
import { Edit2, Trash2, Save, X, Search } from 'lucide-react';

export default function WordManagement() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ english: '', turkish: '', class: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [searchTerm, classFilter, words]);

  const loadWords = async () => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('class', { ascending: true })
        .order('english', { ascending: true });

      if (error) throw error;
      setWords(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      setLoading(false);
    }
  };

  const filterWords = () => {
    let filtered = words;

    if (classFilter !== 'all') {
      filtered = filtered.filter((word) => word.class === classFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (word) =>
          word.english.toLowerCase().includes(term) ||
          word.turkish.toLowerCase().includes(term)
      );
    }

    setFilteredWords(filtered);
  };

  const uniqueClasses = [...new Set(words.map((w) => w.class))].sort();

  const startEdit = (word: Word) => {
    setEditingId(word.id);
    setEditForm({
      english: word.english,
      turkish: word.turkish,
      class: word.class,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ english: '', turkish: '', class: '' });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('words')
        .update({
          english: editForm.english,
          turkish: editForm.turkish,
          class: editForm.class,
        })
        .eq('id', id);

      if (error) throw error;

      await loadWords();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating word:', error);
      alert('Kelime güncellenirken hata oluştu!');
    }
  };

  const deleteWord = async (id: string) => {
    if (!confirm('Bu kelimeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.from('words').delete().eq('id', id);

      if (error) throw error;

      await loadWords();
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('Kelime silinirken hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100 text-center">
        <div className="text-xl text-gray-600">Kelimeler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Kelime Yönetimi</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kelime ara..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
        >
          <option value="all">Tüm Sınıflar</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>
              Sınıf {cls}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 rounded-xl p-2 mb-4">
        <p className="text-gray-600 text-center">
          Toplam {filteredWords.length} kelime
        </p>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredWords.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Kelime bulunamadı.</div>
        ) : (
          filteredWords.map((word) => (
            <div
              key={word.id}
              className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
            >
              {editingId === word.id ? (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editForm.english}
                      onChange={(e) =>
                        setEditForm({ ...editForm, english: e.target.value })
                      }
                      placeholder="İngilizce"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.turkish}
                      onChange={(e) =>
                        setEditForm({ ...editForm, turkish: e.target.value })
                      }
                      placeholder="Türkçe"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.class}
                      onChange={(e) =>
                        setEditForm({ ...editForm, class: e.target.value })
                      }
                      placeholder="Sınıf"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(word.id)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold">
                        Sınıf {word.class}
                      </span>
                      <span className="font-bold text-lg text-gray-800">
                        {word.english}
                      </span>
                    </div>
                    <p className="text-gray-600">{word.turkish}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(word)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteWord(word.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
