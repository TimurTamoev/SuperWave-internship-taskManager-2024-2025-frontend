import api from "./api";
import { ResponseTemplate, ResponseTemplateCreate, EmailResponseAttachment, EmailResponseAttachmentCreate } from "../types/template";

export const templateService = {
  async getAllTemplates(): Promise<ResponseTemplate[]> {
    const token = localStorage.getItem('access_token');
    const response = await api.get<ResponseTemplate[]>("/responses/response/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async createTemplate(templateData: ResponseTemplateCreate): Promise<ResponseTemplate> {
    const token = localStorage.getItem('access_token');
    const response = await api.post<ResponseTemplate>("/responses/response/create", templateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async deleteTemplate(templateId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await api.delete(`/responses/response/${templateId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async attachTemplateToEmail(attachmentData: EmailResponseAttachmentCreate): Promise<EmailResponseAttachment> {
    const token = localStorage.getItem('access_token');
    const response = await api.post<EmailResponseAttachment>("/responses/response/attach", attachmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async getAllAttachments(): Promise<EmailResponseAttachment[]> {
    const token = localStorage.getItem('access_token');
    const response = await api.get<EmailResponseAttachment[]>("/responses/response/attachments/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async deleteAttachment(attachmentId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await api.delete(`/responses/response/attachment/${attachmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

