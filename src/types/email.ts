export interface EmailAttachment {
  filename: string;
  content_type: string;
  size: number;
}

export interface EmailMessage {
  uid: string;
  subject: string;
  from_address: string;
  to_addresses: string[];
  date: string | null;
  body_plain: string | null;
  body_html: string | null;
  has_attachments: boolean;
  attachments: EmailAttachment[];
  is_read: boolean;
}

export interface EmailFetchRequest {
  folder?: string;
  limit?: number;
  search_criteria?: string;
  include_body?: boolean;
}

export interface EmailFetchResponse {
  success: boolean;
  message: string;
  total_count: number;
  emails: EmailMessage[];
}

