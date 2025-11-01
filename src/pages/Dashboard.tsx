import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { EmailMessage } from '../types/email';
import { emailService } from '../services/emailService';
import { emailCache } from '../utils/emailCache';
import EmailsPage from './EmailsPage';
import AdminPanel from './AdminPanel';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'emails' | 'admin'>('dashboard');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [refreshingEmails, setRefreshingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    const loadInitialEmails = async () => {
      // Check if user has email configured
      if (!user.email_password) {
        setEmails([]);
        return;
      }

      const cachedEmails = emailCache.get(user.id);
      if (cachedEmails && cachedEmails.length > 0) {
        setEmails(cachedEmails.slice(0, 12));
        setRefreshingEmails(true);
      } else {
        setLoadingEmails(true);
      }

      try {
        const response = await emailService.fetchEmails({ limit: 12 });
        if (response.success) {
          setEmails(response.emails);
          emailCache.save(response.emails, user.id);
        } else {
          setEmails([]);
        }
      } catch (error) {
        console.error('Failed to load emails:', error);
        setEmails([]);
      } finally {
        setLoadingEmails(false);
        setRefreshingEmails(false);
      }
    };

    loadInitialEmails();
  }, [user.id, user.email_password]);

  const handleEmailClick = (email: EmailMessage) => {
    setSelectedEmail(email);
    setCurrentView('emails');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (currentView === 'emails') {
    return (
      <EmailsPage
        user={user}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedEmail(null);
        }}
        initialSelectedEmail={selectedEmail}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <AdminPanel
        currentUser={user}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <nav className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">SW Task Manager</h1>
            
            {user.is_superuser && (
              <button
                onClick={() => setCurrentView('admin')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Админ-панель
              </button>
            )}
          </div>
          
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

        <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_7fr_4fr] gap-6 h-full">
            
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Задачи</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  0
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-shrink-0">
                Управление задачами и проектами
              </p>
              <div className="flex-1"></div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">Почта</h2>
                  {refreshingEmails && (
                    <div className="relative w-4 h-4">
                      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  )}
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {emails.length}
                </span>
              </div>
              
              {/* Email preview list */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0">
                {!user.email_password ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="text-yellow-500 text-4xl mb-3">⚠️</div>
                    <p className="text-sm text-gray-700 text-center font-medium mb-1">
                      Почта не настроена
                    </p>
                    <p className="text-xs text-gray-500 text-center">
                      В профиле пользователя отсутствует пароль от почты
                    </p>
                  </div>
                ) : loadingEmails ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-12 h-12 mb-3">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-green-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-sm text-gray-500">Загрузка писем...</div>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <div className="text-gray-400 text-4xl mb-3">📭</div>
                    <p className="text-sm text-gray-500 text-center">
                      Нет писем
                    </p>
                  </div>
                ) : (
                  emails.map((email) => (
                    <div
                      key={email.uid}
                      className={`p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        email.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => handleEmailClick(email)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span
                          className={`text-xs font-medium truncate flex-1 ${
                            email.is_read ? 'text-gray-900' : 'text-blue-900 font-semibold'
                          }`}
                        >
                          {email.subject || '(Без темы)'}
                        </span>
                        {email.has_attachments && (
                          <span className="ml-1 text-gray-400 text-xs" title="Есть вложения">
                            📎
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 truncate mb-0.5">
                        {email.from_address}
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(email.date)}</div>
                    </div>
                  ))
                )}
              </div>
              
              <button
                onClick={() => {
                  setSelectedEmail(null);
                  setCurrentView('emails');
                }}
                disabled={!user.email_password}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded transition-colors flex-shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Открыть недавние
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Шаблоны</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  0
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex-shrink-0">
                Шаблоны ответов на письма
              </p>
              <div className="flex-1"></div>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded transition-colors flex-shrink-0">
                Изменить шаблоны
              </button>
            </div>

          </div>
        </div>
    </div>
  );
}