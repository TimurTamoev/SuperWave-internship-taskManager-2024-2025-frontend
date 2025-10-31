import { EmailMessage } from '../types/email';

const EMAIL_CACHE_KEY = 'cached_emails';
const CACHE_TIMESTAMP_KEY = 'emails_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const emailCache = {
  save: (emails: EmailMessage[]) => {
    try {
      localStorage.setItem(EMAIL_CACHE_KEY, JSON.stringify(emails));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache emails:', error);
    }
  },

  get: (): EmailMessage[] | null => {
    try {
      const cached = localStorage.getItem(EMAIL_CACHE_KEY);
      
      if (!cached) return null;
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to get cached emails:', error);
      return null;
    }
  },

  isExpired: (): boolean => {
    try {
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return true;
      
      const age = Date.now() - parseInt(timestamp);
      return age > CACHE_DURATION;
    } catch {
      return true;
    }
  },

  clear: () => {
    localStorage.removeItem(EMAIL_CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  },
};

