import { useState } from 'react';
import { login, getCurrentUser } from '../services/authService';
import { User } from '../types/user';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
      const user = await getCurrentUser();
      console.log('Login successful:', user);
      onLoginSuccess(user);
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.detail || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Имя пользователя"
        className="w-full border border-gray-300 p-3 mb-3 rounded focus:outline-none focus:border-blue-500"
        required
        disabled={loading}
      />
      
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
        className="w-full border border-gray-300 p-3 mb-4 rounded focus:outline-none focus:border-blue-500"
        required
        disabled={loading}
      />
      
      <button 
        type="submit" 
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        disabled={loading}
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}