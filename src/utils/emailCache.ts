import { EmailMessage } from '../types/email';

const EMAIL_CACHE_PREFIX = 'cached_emails_';
const CACHE_TIMESTAMP_PREFIX = 'emails_cache_timestamp_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const emailCache = {
  save: (emails: EmailMessage[], userId: number) => {
    try {
      localStorage.setItem(`${EMAIL_CACHE_PREFIX}${userId}`, JSON.stringify(emails));
      localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache emails:', error);
    }
  },

  get: (userId: number): EmailMessage[] | null => {
    try {
      const cached = localStorage.getItem(`${EMAIL_CACHE_PREFIX}${userId}`);
      
      if (!cached) return null;
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to get cached emails:', error);
      return null;
    }
  },

  isExpired: (userId: number): boolean => {
    try {
      const timestamp = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`);
      if (!timestamp) return true;
      
      const age = Date.now() - parseInt(timestamp);
      return age > CACHE_DURATION;
    } catch {
      return true;
    }
  },

  clear: (userId: number) => {
    localStorage.removeItem(`${EMAIL_CACHE_PREFIX}${userId}`);
    localStorage.removeItem(`${CACHE_TIMESTAMP_PREFIX}${userId}`);
  },

  clearAll: () => {
    // Clear all email caches for all users
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(EMAIL_CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },
};

