import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { EmailMessage } from '../types/email';
import { emailService } from '../services/emailService';
import { emailCache } from '../utils/emailCache';

interface EmailsPageProps {
  user: User;
  onBack: () => void;
  initialSelectedEmail?: EmailMessage | null;
}

export default function EmailsPage({ user, onBack, initialSelectedEmail }: EmailsPageProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(initialSelectedEmail || null);
  const [emailLimit, setEmailLimit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const emailsPerPage = 10;

  useEffect(() => {
    handleLoadEmails(true);
  }, []);

  useEffect(() => {
    if (initialSelectedEmail) {
      setSelectedEmail(initialSelectedEmail);
    }
  }, [initialSelectedEmail]);

  const handleLoadEmails = async (useCache: boolean = false, limit: number = emailLimit) => {
    setEmailError(null);
    
    // Check if user has email configured
    if (!user.email_password) {
      setEmailError('В профиле пользователя отсутствует пароль от почты');
      setEmails([]);
      return;
    }
    
    if (useCache) {
      const cachedEmails = emailCache.get(user.id);
      if (cachedEmails && cachedEmails.length > 0) {
        const limitedEmails = cachedEmails.slice(0, limit);
        setEmails(limitedEmails);
        setHasMore(cachedEmails.length >= limit);
        setRefreshing(true);
        
        if (initialSelectedEmail) {
          const emailIndex = limitedEmails.findIndex(e => e.uid === initialSelectedEmail.uid);
          if (emailIndex !== -1) {
            const pageNumber = Math.floor(emailIndex / emailsPerPage) + 1;
            setCurrentPage(pageNumber);
          }
        }
      } else {
        setLoadingEmails(true);
      }
    } else {
      setLoadingEmails(true);
    }
    
    try {
      const response = await emailService.fetchEmails({ limit });
      
      if (response.success) {
        setEmails(response.emails);
        setHasMore(response.emails.length >= limit);
        emailCache.save(response.emails, user.id);
        
        if (initialSelectedEmail && response.emails.length > 0) {
          const emailIndex = response.emails.findIndex(e => e.uid === initialSelectedEmail.uid);
          if (emailIndex !== -1) {
            const pageNumber = Math.floor(emailIndex / emailsPerPage) + 1;
            setCurrentPage(pageNumber);
          } else {
            setCurrentPage(1);
          }
        } else {
          setCurrentPage(1);
        }
      } else {
        setEmailError(response.message);
        setEmails([]);
      }
    } catch (error: any) {
      console.error('Failed to load emails:', error);
      const errorMsg = error.response?.data?.detail || 'Ошибка загрузки писем';
      setEmailError(errorMsg);
      setEmails([]);
    } finally {
      setLoadingEmails(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const newLimit = emailLimit + 5;
    setEmailLimit(newLimit);
    
    try {
      const response = await emailService.fetchEmails({ limit: newLimit });
      
      if (response.success) {
        setEmails(response.emails);
        setHasMore(response.emails.length >= newLimit);
        emailCache.save(response.emails, user.id);
      } else {
        setEmailError(response.message);
      }
    } catch (error: any) {
      console.error('Failed to load more emails:', error);
      setEmailError(error.response?.data?.detail || 'Ошибка загрузки писем');
    } finally {
      setLoadingMore(false);
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

  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);
  const totalPages = Math.ceil(emails.length / emailsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedEmail(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Назад
            </button>
            <h1 className="text-xl font-bold text-gray-900">Почта</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => {
                setEmailLimit(12);
                handleLoadEmails(false, 12);
              }}
              disabled={loadingEmails || refreshing}
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {refreshing && (
                <div className="relative w-4 h-4">
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                </div>
              )}
              {loadingEmails ? 'Загрузка...' : refreshing ? 'Обновление...' : 'Обновить'}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-4 py-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Email List */}
          <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-800">
                  Входящие ({emails.length})
                </h2>
                {refreshing && (
                  <div className="relative w-4 h-4">
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {emailError ? (
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="text-red-500 text-5xl mb-4">❌</div>
                <p className="text-base font-semibold text-gray-900 mb-2 text-center">
                  Не удалось подключиться к почте
                </p>
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 max-w-md">
                  <p className="text-sm text-red-700 text-center">
                    {emailError}
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-center mb-4">
                  Возможные причины:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 max-w-md">
                  <li>• Отсутствует пароль от почты в профиле</li>
                  <li>• Неверный пароль от почты</li>
                  <li>• Проблемы с IMAP сервером</li>
                  <li>• Нет подключения к интернету</li>
                </ul>
              </div>
            ) : loadingEmails ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-green-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-sm text-gray-500">Загрузка писем...</div>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-gray-400 text-5xl mb-4">📭</div>
                <p className="text-sm text-gray-500">
                  Нет писем
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
                  {currentEmails.map((email) => (
                    <div
                      key={email.uid}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEmail?.uid === email.uid
                          ? 'border-green-500 bg-green-50'
                          : email.is_read
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span
                          className={`text-sm font-medium truncate flex-1 ${
                            email.is_read ? 'text-gray-900' : 'text-blue-900 font-semibold'
                          }`}
                        >
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
                      <div className="text-xs text-gray-500">{formatDate(email.date)}</div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="pt-2 border-t flex-shrink-0 space-y-2">
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ←
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 py-1 text-xs border rounded ${
                            currentPage === pageNum
                              ? 'bg-green-500 text-white border-green-500'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        →
                      </button>
                    </div>
                  )}
                  
                  {hasMore && (
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded transition-colors disabled:bg-gray-400"
                    >
                      {loadingMore ? 'Загрузка...' : `Загрузить ещё`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 overflow-y-auto h-full">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex-shrink-0">
                  {selectedEmail.subject || '(Без темы)'}
                </h3>
                
                <div className="space-y-2 mb-4 pb-3 border-b flex-shrink-0">
                  <div className="flex text-sm">
                    <span className="font-medium text-gray-600 w-20">От:</span>
                    <span className="text-gray-900 break-all">{selectedEmail.from_address}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="font-medium text-gray-600 w-20">Кому:</span>
                    <span className="text-gray-900 break-all">{selectedEmail.to_addresses.join(', ')}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="font-medium text-gray-600 w-20">Дата:</span>
                    <span className="text-gray-900">{formatDate(selectedEmail.date)}</span>
                  </div>
                  
                  {selectedEmail.has_attachments && (
                    <div className="flex text-sm">
                      <span className="font-medium text-gray-600 w-20">Вложения:</span>
                      <div className="flex-1">
                        {selectedEmail.attachments.map((attachment, idx) => (
                          <div key={idx} className="text-xs text-gray-700 flex items-center gap-1">
                            📎 {attachment.filename} ({(attachment.size / 1024).toFixed(1)} KB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {selectedEmail.body_html ? (
                    <div
                      className="text-sm text-gray-700 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                    />
                  ) : (
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {selectedEmail.body_plain || 'Нет содержимого'}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Выберите письмо для просмотра
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

