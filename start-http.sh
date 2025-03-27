#!/bin/bash

# .envファイルが存在する場合は読み込む
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# デフォルト値の設定
DEFAULT_PORT=8202
DEFAULT_ENDPOINT="http://localhost:8065"  # Mattermostのデフォルトポート
DEFAULT_CHANNELS="town-square"

# ヘルプメッセージ
show_help() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  --port <number>      Server port (default: $DEFAULT_PORT)"
  echo "  --endpoint <url>     Mattermost server endpoint (default: $DEFAULT_ENDPOINT)"
  echo "  --token <string>     Mattermost access token (required)"
  echo "  --team-id <string>   Mattermost team ID (required)"
  echo "  --channels <string>  Comma-separated channel IDs (default: $DEFAULT_CHANNELS)"
  echo "  -h, --help          Show this help message"
}

# 引数のパース
while [[ $# -gt 0 ]]; do
  case $1 in
    --port)
      PORT="$2"
      shift 2
      ;;
    --endpoint)
      ENDPOINT="$2"
      shift 2
      ;;
    --token)
      TOKEN="$2"
      shift 2
      ;;
    --team-id)
      TEAM_ID="$2"
      shift 2
      ;;
    --channels)
      CHANNELS="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# 環境変数からの値の読み込み（コマンドライン引数が優先）
PORT=${PORT:-$MATTERMOST_PORT}
ENDPOINT=${ENDPOINT:-$MATTERMOST_ENDPOINT}
TOKEN=${TOKEN:-$MATTERMOST_TOKEN}
TEAM_ID=${TEAM_ID:-$MATTERMOST_TEAM_ID}
CHANNELS=${CHANNELS:-$MATTERMOST_CHANNELS}

# デフォルト値の適用
PORT=${PORT:-$DEFAULT_PORT}
ENDPOINT=${ENDPOINT:-$DEFAULT_ENDPOINT}
CHANNELS=${CHANNELS:-$DEFAULT_CHANNELS}

# 必須パラメータのチェック
if [ -z "$TOKEN" ]; then
  echo "Error: --token is required (can be set via MATTERMOST_TOKEN in .env)"
  show_help
  exit 1
fi

if [ -z "$TEAM_ID" ]; then
  echo "Error: --team-id is required (can be set via MATTERMOST_TEAM_ID in .env)"
  show_help
  exit 1
fi

# サーバーの起動
node --import tsx src/main.ts \
  --endpoint="$ENDPOINT" \
  --token="$TOKEN" \
  --team-id="$TEAM_ID" \
  --channels="$CHANNELS" \
  --port="$PORT"
