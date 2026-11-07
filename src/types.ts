export type TargetPlatform = 'instagram' | 'facebook' | 'both';

export type PostStatus = 'scheduled' | 'published' | 'cancelled' | 'failed';

export interface MetaExecutionLog {
  timestamp: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  platforms: TargetPlatform;
  scheduledFor: string | null; // ISO string para posts agendados
  status: PostStatus;
  createdAt: string;
  publishedAt?: string;
  errorMessage?: string;
  metaResponse?: {
    isSandbox?: boolean;
    facebook?: {
      success: boolean;
      photoId?: string;
      postId?: string;
      permalink?: string;
      error?: any;
    };
    instagram?: {
      success: boolean;
      containerId?: string;
      mediaId?: string;
      permalink?: string;
      error?: any;
    };
    logs?: string[];
  };
}

export interface MetaCredentials {
  accessToken: string;
  igAccountId: string;
  fbPageId: string;
  pageName: string;
  igHandle: string;
  avatarUrl: string;
  isSandboxMode: boolean;
  lastVerifiedAt?: string;
  connectedUserName?: string;
}

export interface AICaptionOption {
  title: string;
  caption: string;
  callToAction: string;
  hashtags: string[];
  recommendedBestTime?: string;
}
