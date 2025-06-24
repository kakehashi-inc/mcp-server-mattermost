import axios from 'axios';
import type { AxiosInstance } from 'axios';

export interface Message {
  id: string;
  create_at: number;
  update_at: number;
  user_id: string;
  message: string;
  type: string;
  props?: {
    card?: string | null;
  };
  reply_count: number;
  last_reply_at: number;
}

export interface Post {
  id: string;
  create_at: number;
  update_at: number;
  edit_at: number;
  delete_at: number;
  is_pinned: boolean;
  user_id: string;
  channel_id: string;
  root_id: string;
  original_id: string;
  message: string;
  type: string;
  props?: {
    card?: string;
    from_webhook?: string;
    override_icon_url?: string;
    override_username?: string;
    webhook_display_name?: string;
  };
  hashtags: string;
  file_ids: string[] | null;
  pending_post_id: string;
  reply_count: number;
  last_reply_at: number;
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

    return Object.values(response.data).map(channel => ({
      id: channel.id,
      create_at: channel.create_at,
      update_at: channel.update_at,
      delete_at: channel.delete_at,
      team_id: channel.team_id,
      type: channel.type,
      display_name: channel.display_name,
      name: channel.name,
      header: channel.header,
      purpose: channel.purpose,
      last_post_at: channel.last_post_at,
      total_msg_count: channel.total_msg_count,
      creator_id: channel.creator_id,
      scheme_id: channel.scheme_id,
      team_display_name: channel.team_display_name,
      team_name: channel.team_name,
      team_update_at: channel.team_update_at,
    }));
  }

  async getChannels(restrictedChannelNames: string[] | undefined | null): Promise<Channel[]> {
    if (!this.initialized) {
      await this.init();
    }

    if (restrictedChannelNames && restrictedChannelNames.length > 0) {
      return this.channels?.filter(c => restrictedChannelNames.includes(c.name)) ?? [];
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

  async getTargetChannelNames(
    channelNames: string[] | undefined | null,
    restrictedChannelNames: string[] | undefined | null
  ): Promise<string[]> {
    if (!this.initialized) {
      await this.init();
    }

    if (channelNames && channelNames.length > 0) {
      return channelNames;
    }

    if (restrictedChannelNames && restrictedChannelNames.length > 0) {
      return restrictedChannelNames;
    }

    if (this.channels && this.channels.length > 0) {
      return this.channels.map(c => c.name);
    }

    return [];
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

    return Object.values(response.data.posts).map(post => ({
      id: post.id,
      create_at: post.create_at,
      update_at: post.update_at,
      user_id: post.user_id,
      message: post.message,
      type: post.type,
      props: {
        card: post.props?.card ?? null,
      },
      reply_count: post.reply_count,
      last_reply_at: post.last_reply_at,
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
      create_at: post.create_at,
      update_at: post.update_at,
      user_id: post.user_id,
      message: post.message,
      type: post.type,
      props: {
        card: post.props?.card ?? null,
      },
      reply_count: post.reply_count,
      last_reply_at: post.last_reply_at,
    }));
  }
}
