# リリース手順

## 1. バージョンアップ

### パッチリリース（バグフィックスなど）
```bash
npm version patch
```

### マイナーリリース（新機能追加）
```bash
npm version minor
```

### メジャーリリース（破壊的変更）
```bash
npm version major
```

## 2. 最終ビルド
```bash
npm run build
```

## 3. パッケージ内容確認
```bash
# 公開されるファイルをドライラン確認
npm pack --dry-run

# または実際にパッケージファイルを生成して確認
npm pack
tar -tvf mcp-server-mattermost-*.tgz
rm mcp-server-mattermost-*.tgz
```

## 4. 公開
```bash
# npmにログイン（必要に応じて）
npm whoami  # ログイン状況確認
# npm login  # 必要な場合

# パッケージ公開
npm publish
```

## 5. npmでの公開確認
```bash
# 公開されたパッケージ情報を確認
npm view mcp-server-mattermost

# 最新バージョンの確認
npm view mcp-server-mattermost version
```
