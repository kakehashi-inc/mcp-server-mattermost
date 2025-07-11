# mcp-server-mattermost

このプロジェクトは、Mattermostとの統合のためのModel Context Protocol (MCP)サーバーを実装します。MattermostのAPIエンドポイントに接続し、各種情報を取得・処理して、標準MCPトランスポートを通じて提供します。

## 機能

- MattermostのAPIエンドポイントへのセキュアなトークンベース認証での接続
- 複数のトランスポートモードをサポート：
  - `stdio`
  - `http-stream`
  - `sse`
- 複数のMattermostチャンネルを横断したメッセージ検索
- デフォルトのチャンネルとメッセージ取得上限のカスタマイズが可能

## 必要条件

- Node.js >= 22
- npm >= 10

## セットアップ

1. リポジトリのクローン：

```bash
git clone https://github.com/kakehashi-inc/mcp-server-mattermost.git
cd mcp-server-mattermost
```

2. 依存関係のインストール：

```bash
npm install
```

3. 環境変数の設定：

### 必須環境変数

- `MATTERMOST_ENDPOINT`: MattermostサーバーのURL
- `MATTERMOST_TOKEN`: Mattermostの認証トークン
- `MATTERMOST_TEAM`: モニタリング対象のチーム名
- `MATTERMOST_CHANNELS`: モニタリング対象のチャンネル名（カンマ区切り）

### 環境変数設定方法

#### 方法1: 直接環境変数を設定
```bash
export MATTERMOST_ENDPOINT="https://your-mattermost-server.com"
export MATTERMOST_TOKEN="your-token-here"
export MATTERMOST_TEAM="your-team-name"
export MATTERMOST_CHANNELS="general,random,dev"
```

#### 方法2: .envファイルを使用（dotenvx利用時）
```bash
# dotenvxのインストール（任意）
npm install -g @dotenvx/dotenvx

# .envファイルの作成
cp .env.example .env
# .envファイルに設定値を記入

# .envファイルの暗号化（本番環境では推奨）
dotenvx encrypt
```

4. サーバーのビルド：

```bash
npm run build
```

## 使用方法

サーバーは3つのトランスポートモードをサポートしています：stdio（デフォルト）、sse、http-stream。

### 標準入出力トランスポートモード

```bash
# npmスクリプト使用（dotenvx利用）
npm run start:stdio

# 直接実行
node dist/main.js --transport stdio

# npx使用
npx mcp-server-mattermost --transport stdio
```

### SSEトランスポートモード

```bash
# npmスクリプト使用（dotenvx利用）
npm run start:sse

# 直接実行
node dist/main.js --transport sse
```

### HTTPトランスポートモード

```bash
# npmスクリプト使用（dotenvx利用）
npm run start:http

# 直接実行
node dist/main.js --transport http-stream
```

## Claude Desktop連携

このMCPサーバーをClaude Desktopで使用するには、Claude Desktopの設定に以下の設定を追加してください：

### 設定サンプル

```json
{
  "mcpServers": {
    "mattermost": {
      "command": "npx",
      "args": [
        "-y"
        "mcp-server-mattermost@latest",
        "--transport", "stdio"
        "--endpoint", "https://your-mattermost-server/api/v4",
        "--token", "your_personal_access_token",
        "--team", "your_team_name",
        "--channels", "town-square,general,your_channel_name"
      ]
    }
  }
}
```

## 開発

- `npm run dev`: ホットリロード付きの開発モードでサーバーを起動
- `npm run lint`: ESLintを実行
- `npm run format`: Prettierでコードをフォーマット
- `npm test`: テストを実行
- `npm run inspect`: MCPインスペクターを実行

## 参考サイト

- [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP inspector](https://github.com/modelcontextprotocol/inspector)

## ライセンス

MIT
