import { User } from '../types/user';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SW Task Manager</h1>
          <button 
            onClick={onLogout} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Выйти
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Профиль пользователя</h2>
          
          <div className="space-y-3">
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">Имя:</span>
              <span className="text-gray-900">{user.full_name || 'Не указано'}</span>
            </div>
            
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">Логин:</span>
              <span className="text-gray-900">{user.username}</span>
            </div>
            
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">Роль:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                user.is_superuser 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.is_superuser ? 'Администратор' : 'Пользователь'}
              </span>
            </div>
            
            <div className="flex">
              <span className="font-medium w-32 text-gray-600">Статус:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                user.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Панель управления</h2>
          <p className="text-gray-600">Здесь будет основной контент приложения</p>
        </div>
      </div>
    </div>
  );
}