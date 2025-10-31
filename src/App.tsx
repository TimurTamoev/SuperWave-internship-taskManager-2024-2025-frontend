import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import { User } from './types/user';
import { logout, getCurrentUser, getCachedUser } from './services/authService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        const cachedUser = getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
        }
        
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SW Task Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Система управления задачами
        </p>
        <LoginForm onLoginSuccess={setUser} />
      </div>
    </div>
  );
}

export default App;