import { useState } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import { User } from './types/user';
import { logout } from './services/authService';

function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

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