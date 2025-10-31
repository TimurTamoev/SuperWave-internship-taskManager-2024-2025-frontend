import { useState } from 'react';
import { User } from '../types/user';
import { EmailMessage } from '../types/email';
import { emailService } from '../services/emailService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleLoadEmails = async () => {
    setLoadingEmails(true);
    setEmailError(null);
    
    try {
      const response = await emailService.fetchEmails({ limit: 25 });
      
      if (response.success) {
        setEmails(response.emails);
      } else {
        setEmailError(response.message);
      }
    } catch (error: any) {
      console.error('Failed to load emails:', error);
      setEmailError(error.response?.data?.detail || 'Ошибка загрузки писем');
    } finally {
      setLoadingEmails(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">SW Task Manager</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.full_name || user.username}
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user.is_superuser 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.is_superuser ? 'Admin' : 'User'}
              </span>
              
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  user.is_active ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
            
            <button 
              onClick={onLogout} 
              className="ml-2 text-sm px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-red-200"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>

        <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_7fr_4fr] gap-6 h-full">
            
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Задачи</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  0
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Управление задачами и проектами
              </p>
              <div className="flex-1"></div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Почта</h2>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {emails.length}
                </span>
              </div>
              
              {emailError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {emailError}
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {emails.length === 0 && !loadingEmails ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Нажмите кнопку для загрузки писем
                  </p>
                ) : (
                  emails.map((email) => (
                    <div
                      key={email.uid}
                      className={`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        email.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-xs font-medium truncate flex-1 ${
                          email.is_read ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {email.subject || '(Без темы)'}
                        </span>
                        {email.has_attachments && (
                          <span className="ml-2 text-gray-400" title="Есть вложения">
                            📎
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate mb-1">
                        От: {email.from_address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(email.date)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={handleLoadEmails}
                disabled={loadingEmails}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingEmails ? 'Загрузка...' : 'Загрузить последние сообщения'}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Шаблоны</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  0
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Шаблоны ответов на письма
              </p>
              <div className="flex-1"></div>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded transition-colors">
                Изменить шаблоны
              </button>
            </div>

          </div>
        </div>
    </div>
  );
}