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

export interface Channel {
  id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
  team_id: string;
  type: string;
  display_name: string;
  name: string;
  header: string;
  purpose: string;
  last_post_at: number;
  total_msg_count: number;
  creator_id: string;
  scheme_id: string;
  team_display_name: string;
  team_name: string;
  team_update_at: number;
}

export class MattermostClient {
  private readonly client: AxiosInstance;
  private initialized = false;
  private channels: Channel[] | null = null;

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

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.channels = await this._getChannels();
    this.initialized = true;
  }

  private async _getChannels(): Promise<Channel[]> {
    const response = await this.client.get<Channel[]>('/channels', {
      params: {
        page: 0,
        per_page: 200,
      },
    });

    return response.data;
  }

  async getChannels(): Promise<Channel[]> {
    if (!this.initialized) {
      await this.init();
    }

    return this.channels ?? [];
  }

  async getChannelInfo(channelName: string): Promise<Channel | null> {
    if (!this.initialized) {
      await this.init();
    }

    const channel = this.channels?.find(
      c => c.name === channelName || c.display_name === channelName
    );
    if (!channel) {
      return null;
    }

    return channel;
  }

  async getChannelInfoById(channelId: string): Promise<Channel | null> {
    if (!this.initialized) {
      await this.init();
    }

    const channel = this.channels?.find(c => c.id === channelId);
    if (!channel) {
      return null;
    }

    return channel;
  }

  async getMessages(channelId: string, limit = 100): Promise<Message[]> {
    if (!this.initialized) {
      await this.init();
    }

    const response = await this.client.get<{ posts: Record<string, Post> }>(
      `/channels/${channelId}/posts`,
      {
        params: {
          page: 0,
          per_page: limit,
        },
      }
    );

    console.debug(response.data.posts);

    return Object.values(response.data.posts).map(post => ({
      id: post.id,
      channel_id: post.channel_id,
      message: post.message,
      create_at: post.create_at,
      user_id: post.user_id,
      username: post.props?.username ?? post.user_id,
    }));
  }

  async getMessagesByName(channelName: string, limit = 100): Promise<Message[]> {
    if (!this.initialized) {
      await this.init();
    }

    const channel = await this.getChannelInfo(channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }

    return this.getMessages(channel.id, limit);
  }

  async searchMessages(
    query: string,
    channelIds: string[] | null,
    limit = 100
  ): Promise<Message[]> {
    if (!this.initialized) {
      await this.init();
    }

    const channelNames: string[] = [];
    if (channelIds) {
      for (const channelId of channelIds) {
        const channel = await this.getChannelInfoById(channelId);
        if (channel) {
          channelNames.push(channel.name);
        }
      }
    }

    return this.searchMessagesByName(query, channelNames, limit);
  }

  async searchMessagesByName(
    query: string,
    channelNames: string[] | null,
    limit = 100
  ): Promise<Message[]> {
    if (!this.initialized) {
      await this.init();
    }

    let terms;
    if (!channelNames || channelNames.length === 0) {
      terms = query;
    } else {
      terms = `${query} in:${channelNames.join(',')}`;
    }

    const response = await this.client.post<{ posts: Record<string, Post> }>('/posts/search', {
      terms,
      is_or_search: false,
      page: 0,
      per_page: limit,
    });

    console.debug(response.data.posts);

    return Object.values(response.data.posts).map(post => ({
      id: post.id,
      channel_id: post.channel_id,
      message: post.message,
      create_at: post.create_at,
      user_id: post.user_id,
      username: post.props?.username ?? post.user_id,
    }));
  }
}
