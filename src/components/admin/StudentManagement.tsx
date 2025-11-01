import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Trash2, Save, X, Search } from 'lucide-react';

interface Student {
  id: string;
  code: string;
  name: string;
  class: string;
  created_at: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ code: '', name: '', class: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, classFilter, students]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('class', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading students:', error);
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (classFilter !== 'all') {
      filtered = filtered.filter((student) => student.class === classFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.code.toLowerCase().includes(term)
      );
    }

    setFilteredStudents(filtered);
  };

  const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditForm({
      code: student.code,
      name: student.name,
      class: student.class,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ code: '', name: '', class: '' });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          code: editForm.code,
          name: editForm.name,
          class: editForm.class,
        })
        .eq('id', id);

      if (error) throw error;

      await loadStudents();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Öğrenci güncellenirken hata oluştu!');
    }
  };

  const deleteStudent = async (id: string) => {
    if (
      !confirm(
        'Bu öğrenciyi silmek istediğinizden emin misiniz? Tüm ilerleme kaydı da silinecektir.'
      )
    )
      return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);

      if (error) throw error;

      await loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Öğrenci silinirken hata oluştu!');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100 text-center">
        <div className="text-xl text-gray-600">Öğrenciler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Öğrenci Yönetimi</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Öğrenci ara..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
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
          Toplam {filteredStudents.length} öğrenci
        </p>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Öğrenci bulunamadı.</div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
            >
              {editingId === student.id ? (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editForm.code}
                      onChange={(e) =>
                        setEditForm({ ...editForm, code: e.target.value })
                      }
                      placeholder="Kod"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="İsim"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.class}
                      onChange={(e) =>
                        setEditForm({ ...editForm, class: e.target.value })
                      }
                      placeholder="Sınıf"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(student.id)}
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
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                        Sınıf {student.class}
                      </span>
                      <span className="font-bold text-lg text-gray-800">
                        {student.name}
                      </span>
                    </div>
                    <p className="text-gray-600">Kod: {student.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(student)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
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
