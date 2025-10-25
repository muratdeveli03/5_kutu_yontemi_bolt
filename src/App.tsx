import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { student, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (student) {
    return <StudentDashboard />;
  }

  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
