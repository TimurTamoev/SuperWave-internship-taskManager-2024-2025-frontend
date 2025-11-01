import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { EmailMessage } from '../types/email';
import { ResponseTemplate, EmailResponseAttachment } from '../types/template';
import { emailService } from '../services/emailService';
import { templateService } from '../services/templateService';
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
  
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  
  const [attachments, setAttachments] = useState<EmailResponseAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<EmailResponseAttachment | null>(null);
  const [unpinning, setUnpinning] = useState(false);

  useEffect(() => {
    const loadInitialEmails = async () => {
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

  useEffect(() => {
    const loadTemplatesAndAttachments = async () => {
      setLoadingTemplates(true);
      setLoadingAttachments(true);
      
      try {
        const [templatesData, attachmentsData] = await Promise.all([
          templateService.getAllTemplates(),
          templateService.getAllAttachments(),
        ]);
        setTemplates(templatesData);
        setAttachments(attachmentsData);
      } catch (error) {
        console.error('Failed to load templates or attachments:', error);
      } finally {
        setLoadingTemplates(false);
        setLoadingAttachments(false);
      }
    };

    loadTemplatesAndAttachments();
  }, []);

  const handleDeleteTemplate = async (templateId: number) => {
    // Check if template is being used in any attachments
    const isUsed = attachments.some(a => a.response_template_id === templateId);
    if (isUsed) {
      alert('Нельзя удалить шаблон, который прикреплен к письмам. Сначала открепите его от всех писем.');
      return;
    }

    if (!confirm('Удалить этот шаблон?')) return;
    
    try {
      await templateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      
      // Refresh attachments to remove any that referenced this template
      try {
        const attachmentsData = await templateService.getAllAttachments();
        setAttachments(attachmentsData);
      } catch (err) {
        console.error('Failed to refresh attachments:', err);
      }
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      const errorMsg = error.response?.data?.detail || 'Ошибка удаления шаблона';
      alert(errorMsg);
    }
  };

  const handleUnpinTemplate = async (attachmentId: number) => {
    if (!confirm('Открепить шаблон от этого письма?')) return;
    
    setUnpinning(true);
    try {
      await templateService.deleteAttachment(attachmentId);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      setSelectedAttachment(null);
    } catch (error: any) {
      console.error('Failed to unpin template:', error);
      alert(error.response?.data?.detail || 'Ошибка открепления шаблона');
    } finally {
      setUnpinning(false);
    }
  };

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
                  {attachments.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                {loadingAttachments ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-12 h-12 mb-3">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-sm text-gray-500">Загрузка...</div>
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">📋</div>
                    <p className="text-xs text-gray-500 text-center">
                      Нет задач с прикрепленными шаблонами
                    </p>
                  </div>
                ) : (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      onClick={() => setSelectedAttachment(attachment)}
                      className="p-2 border rounded-lg bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-xs font-medium text-blue-900 truncate mb-1">
                        {attachment.email_subject || 'Без темы'}
                      </div>
                      <div className="text-xs text-gray-600 truncate mb-1">
                        От: {attachment.email_from || 'Неизвестно'}
                      </div>
                      {attachment.response_template && (
                        <div className="text-xs text-purple-700 truncate">
                          → {attachment.response_template.title}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
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
                  {templates.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0">
                {loadingTemplates ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-12 h-12 mb-3">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-sm text-gray-500">Загрузка...</div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-gray-400 text-4xl mb-3">📝</div>
                    <p className="text-xs text-gray-500 text-center">
                      Нет шаблонов
                    </p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-2 border rounded-lg bg-purple-50 border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-purple-900">
                          {template.title}
                        </span>
                        {user.is_superuser && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Удалить"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {template.send_response ? '📨' : '⬇️'} {template.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {user.is_superuser && (
                <button
                  onClick={() => setShowAddTemplate(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-4 rounded transition-colors flex-shrink-0"
                >
                  Добавить шаблон
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Add Template Modal */}
        {showAddTemplate && (
          <AddTemplateModal
            onClose={() => setShowAddTemplate(false)}
            onSuccess={(newTemplate) => {
              setTemplates([...templates, newTemplate]);
              setShowAddTemplate(false);
            }}
          />
        )}

        {/* Task Detail Modal */}
        {selectedAttachment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Детали задачи</h2>
                <button
                  onClick={() => setSelectedAttachment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Email Info */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">📧 Исходное письмо</h3>
                <div className="space-y-1">
                  <div className="flex">
                    <span className="text-xs font-medium text-gray-600 w-24">Тема:</span>
                    <span className="text-xs text-gray-900">{selectedAttachment.email_subject || 'Без темы'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-xs font-medium text-gray-600 w-24">От:</span>
                    <span className="text-xs text-gray-900">{selectedAttachment.email_from || 'Неизвестно'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-xs font-medium text-gray-600 w-24">UID письма:</span>
                    <span className="text-xs text-gray-500">{selectedAttachment.email_uid}</span>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              {selectedAttachment.response_template && (
                <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {selectedAttachment.response_template.send_response ? '📨' : '⬇️'} Прикрепленный шаблон
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-600">Название:</span>
                      <p className="text-sm text-gray-900 mt-1">{selectedAttachment.response_template.title}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Текст ответа:</span>
                      <p className="text-sm text-gray-900 mt-1 p-2 bg-white rounded border">
                        {selectedAttachment.response_template.body}
                      </p>
                    </div>
                    {selectedAttachment.response_template.send_response && (
                      <div className="mt-2">
                        <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          ✓ Автоматическая отправка включена
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedAttachment.notes && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                  <span className="text-xs font-medium text-gray-600">Заметки:</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedAttachment.notes}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="mb-4 text-xs text-gray-500">
                Прикреплено: {new Date(selectedAttachment.attached_at).toLocaleString('ru-RU')}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAttachment(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => handleUnpinTemplate(selectedAttachment.id)}
                  disabled={unpinning}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                >
                  {unpinning ? 'Открепление...' : 'Открепить шаблон'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// Add Template Modal Component
function AddTemplateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (template: ResponseTemplate) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    send_response: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newTemplate = await templateService.createTemplate(formData);
      onSuccess(newTemplate);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания шаблона');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Добавить шаблон</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название шаблона <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="Например: Подтверждение получения"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Текст шаблона <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              maxLength={1000}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-purple-500 h-32 resize-none"
              placeholder="Ваше письмо отправлено на обработку"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.body.length} / 1000 символов
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.send_response}
                onChange={(e) => setFormData({ ...formData, send_response: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Автоматически отправлять ответ при прикреплении
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Если включено, письмо будет отправлено сразу после прикрепления шаблона
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? 'Создание...' : 'Создать'}
        </button>
          </div>
        </form>
      </div>
      </div>
    );
  }