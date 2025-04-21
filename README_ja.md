# MCP Router

[[English](README.md) | 日本語]

MCP Routerは、複数のMCPサーバを一つのインターフェースから管理できる、セキュアなアクセス制御とロギング機能を備えた無料かつログイン不要のWindowsおよびMacOSアプリです。
ローカルとリモートのMCPサーバに対応しており、あらゆるレジストリ（Zapier, Smithy, etc）のあらゆるMCPサーバに接続できます。
日本語に対応してます。

## 特徴
**MCPサーバのオン・オフを一括管理できます**
![](/static/img/readme/toggle.png)

**ログとリクエストの詳細が取得できます**
![](/static/img/readme/stats.png)

**ワンクリックでClaude, Cline, Windsurf, Cursorといったアプリと統合できます**
![](/static/img/readme/token.png)

**どんなMCPサーバでも接続可能です**
![](/static/img/readme/add-mcp-manual.png)

## 使い方

### MCP Routerをインストール
[リリース](https://github.com/mcp-router/mcp-router/releases)から最新のMCP Routerをダウンロードします。

現在は招待制のため、アクティベーションコード（ご友人から招待頂いてください）を入力すると利用可能になります。

### MCPサーバの起動
右上のServersから、お好きなMCPサーバを追加します。
JSONから追加することもできますし、MCP Routerが用意しているレジストリのMCPサーバを選択することもできます。

### MCP Routerを使用する
MCPのアプリから、以下のコマンドでアクセスできます。

```bash
set MCPR_TOKEN=<Your Token>
npx -y mcpr-cli connect
```
または
```json
{
  "mcpServers": {
    "mcp-router": {
      "command": "npx",
      "args": [
        "-y",
        "mcpr-cli",
        "connect"
      ],
      "env": {
        "MCPR_TOKEN": "Issued Token"
      }
    }
  }
}
```

リクエストのログは自動でローカルに記録されます（外部には送信されません）。
