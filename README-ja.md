# mattermost-mcp-server

このプロジェクトは、Mattermostとの統合のためのModel Context Protocol (MCP)サーバーを実装します。MattermostのAPIエンドポイントに接続し、各種情報を取得・処理して、標準MCPトランスポートを通じて提供します。

## 機能

- MattermostのAPIエンドポイントへの接続
- 複数のトランスポートモードをサポート：
  - SSE（Server-Sent Events）
  - 標準入出力
- リアルタイムメッセージ処理
- チームとチャンネル単位のモニタリング
- セキュアなトークンベースの認証

## 必要条件

- Node.js >= 22
- npm >= 10

## セットアップ

1. リポジトリのクローン：

```bash
git clone https://github.com/kakehashi-inc/mattermost-mcp-server.git
cd mattermost-mcp-server
```

2. 依存関係のインストール：

```bash
npm install
```

3. サーバーのビルド：

```bash
npm run build
```

## 使用方法

サーバーは2つのトランスポートモードで実行できます：

### SSEトランスポートモード

```bash
npm start -- --endpoint="https://your-mattermost-server" \
            --token="your-mattermost-token" \
            --team-id="your-team-id" \
            --channels="channel1,channel2" \
            --port 8202
```

### 標準入出力トランスポートモード

```bash
npm start -- --endpoint="https://your-mattermost-server" \
            --token="your-mattermost-token" \
            --team-id="your-team-id" \
            --channels="channel1,channel2" \
            --stdio
```

### 必須パラメータ

- `endpoint`: MattermostサーバーのURL
- `token`: Mattermostの認証トークン
- `team-id`: モニタリング対象のチームID
- `channels`: モニタリング対象のチャンネル名（カンマ区切り）

### オプションパラメータ

- `port`: SSEトランスポートモードのポート番号（デフォルト: 8202）
- `stdio`: 標準入出力トランスポートモードを有効にするフラグ

## 開発

- `npm run dev`: ホットリロード付きの開発モードでサーバーを起動
- `npm run lint`: ESLintを実行
- `npm run format`: Prettierでコードをフォーマット
- `npm test`: テストを実行
- `npm run inspect`: MCPインスペクターを実行

## ライセンス

MIT
