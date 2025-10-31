import api from "./api";
import { EmailFetchRequest, EmailFetchResponse } from "../types/email";

export const emailService = {
  async fetchEmails(request: EmailFetchRequest = {}): Promise<EmailFetchResponse> {
    const token = localStorage.getItem('access_token');
    const response = await api.post<EmailFetchResponse>("/emails/fetch", {
      folder: request.folder || "INBOX",
      limit: request.limit || 25,
      search_criteria: request.search_criteria || "ALL",
      include_body: request.include_body !== undefined ? request.include_body : true,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

