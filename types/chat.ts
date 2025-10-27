export interface ChatSession {
  id: number;
  case: number;
  title: string;
  created_by: number;
  created_by_name?: string;
  is_active: boolean;
  last_message_at: string;
  last_message_preview?: {
    content: string;
    sender: 'user' | 'ai';
    created_at: string;
  };
  message_count: number;
  summary?: string;
  created_at: string;
  formatted_date?: string;
}

export interface ChatMessage {
  id: number;
  session: number;
  sender: 'user' | 'ai';
  sender_name: string;
  content: string;
  attachments: any[];
  metadata: any;
  is_streaming: boolean;
  is_complete: boolean;
  has_error: boolean;
  error_message?: string;
  tokens_used?: number;
  created_at: string;
  formatted_time: string;
  parent_message?: number;
}

export interface ChatMessageCreate {
  content: string;
  attachment_temp_ids?: string[];
  parent_message?: number;
}

export interface ChatSessionCreate {
  title?: string;
  metadata?: any;
}

