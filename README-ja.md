# mcp-server-mattermost

このプロジェクトは、Mattermostとの統合のためのModel Context Protocol (MCP)サーバーを実装します。MattermostのAPIエンドポイントに接続し、各種情報を取得・処理して、標準MCPトランスポートを通じて提供します。

## 機能

- MattermostのAPIエンドポイントへの接続
- 複数のトランスポートモードをサポート：
  - Standard I/O
  - Streamable HTTP
- リアルタイムメッセージ処理
- チームとチャンネル単位のモニタリング
- セキュアなトークンベースの認証
- FastMCPを使用したシンプルなMCPサーバー実装

## 必要条件

- Node.js >= 22
- npm >= 10
- dotenvx
  - [dotenvx](https://dotenvx.com/)

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

```bash
# .envファイルの作成
cp .env.example .env

# .envファイルの暗号化（本番環境では推奨）
dotenvx encrypt
```

必要な環境変数：

- `MCP_PORT`: HTTPトランスポートモードのポート番号（デフォルト: 8201）
- `MCP_TRANSPORT`: 使用するトランスポートモード: `stdio`、または`http-stream`（デフォルト: stdio）
- `MATTERMOST_ENDPOINT`: MattermostサーバーのURL
- `MATTERMOST_TOKEN`: Mattermostの認証トークン
- `MATTERMOST_TEAM_ID`: モニタリング対象のチームID
- `MATTERMOST_CHANNELS`: モニタリング対象のチャンネル名（カンマ区切り）

4. サーバーのビルド：

```bash
npm run build
```

## 使用方法

サーバーは2つのトランスポートモードをサポートしています：stdio（デフォルト）、http-stream。

### 標準入出力トランスポートモード

```bash
npm start -- --transport stdio
```

### HTTPトランスポートモード

```bash
npm start -- --transport http-stream
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
