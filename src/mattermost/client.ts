import axios from 'axios';
import type { AxiosInstance } from 'axios';

export interface Message {
  id: string;
  channel_id: string;
  message: string;
  create_at: number;
  user_id: string;
  username: string;
}

interface Post {
  id: string;
  channel_id: string;
  message: string;
  create_at: number;
  user_id: string;
  props?: {
    username?: string;
  };
}

export class MattermostClient {
  private readonly client: AxiosInstance;

  constructor(
    private readonly endpoint: string,
    private readonly token: string
  ) {
    this.client = axios.create({
      baseURL: endpoint,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getMessages(channelId: string, limit = 100): Promise<Message[]> {
    const response = await this.client.get<{ posts: Record<string, Post> }>(
      `/api/v4/channels/${channelId}/posts`,
      {
        params: {
          page: 0,
          per_page: limit,
        },
      }
    );

    return Object.values(response.data.posts).map(post => ({
      id: post.id,
      channel_id: post.channel_id,
      message: post.message,
      create_at: post.create_at,
      user_id: post.user_id,
      username: post.props?.username ?? post.user_id,
    }));
  }

  async searchMessages(query: string, channelIds: string[], limit = 100): Promise<Message[]> {
    const terms = `${query} in:${channelIds.join(',')}`;
    const response = await this.client.post<{ posts: Post[] }>('/api/v4/posts/search', {
      terms,
      is_or_search: false,
      page: 0,
      per_page: limit,
    });

    return response.data.posts.map(post => ({
      id: post.id,
      channel_id: post.channel_id,
      message: post.message,
      create_at: post.create_at,
      user_id: post.user_id,
      username: post.props?.username ?? post.user_id,
    }));
  }
}
