import { useState } from 'react';
import { login } from '../services/authService';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(username, password);
      console.log('Login successful:', userData);
      // Store token, redirect, etc.
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="border p-2 mb-2"
        required
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2 mb-2"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2">
        Sign In
      </button>
    </form>
  );
}