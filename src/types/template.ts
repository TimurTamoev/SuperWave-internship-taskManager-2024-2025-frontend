export interface ResponseTemplate {
  id: number;
  user_id: number;
  title: string;
  body: string;
  send_response: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ResponseTemplateCreate {
  title: string;
  body: string;
  send_response?: boolean;
}

export interface ResponseTemplateUpdate {
  title?: string;
  body?: string;
  send_response?: boolean;
}

export interface EmailResponseAttachment {
  id: number;
  user_id: number;
  email_uid: string;
  email_subject: string | null;
  email_from: string | null;
  response_template_id: number;
  attached_at: string;
  notes: string | null;
  response_template?: ResponseTemplate;
}

export interface EmailResponseAttachmentCreate {
  email_uid: string;
  response_template_id: number;
  email_subject?: string;
  email_from?: string;
  notes?: string;
}

