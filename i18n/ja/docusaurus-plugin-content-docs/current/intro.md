---
sidebar_position: 1
---

# はじめに

**MCP Router** について5分以内に理解しましょう。

## 導入
MCP Routerは、MCP Serverを簡単に管理できる強力なツールです。
使いやすいインターフェースと様々な機能により、MCP体験を向上させます。

![](/img/tutorial/mcp-router-intro.png)

[こちら](https://github.com/mcp-router/mcp-router/releases)からアプリをダウンロードして始めましょう。

使い方はとても簡単で、MCPに対応している全てのアプリケーション（Claude、Cursor、Clineも含みます！）からご利用いただけます。

## MCP Routerの使用方法

### MCP Serverのインストール・起動

![](/img/tutorial/install-start.gif)

MCP Routerをダウンロードした後、DiscoverページからワンクリックでMCP Serverをインストールできます。

StartボタンでインストールしたMCPサーバのコマンドを実行できます。

### MCP Routerで立てたMCP Serverの使用

![](/img/tutorial/auth.gif)

Tokenページで、アプリ毎のトークンを発行します。

トークンを環境変数に設定し、MCP Routerを使用できます。

```bash
export MCPR_TOKEN=<Your Token>
```
その後、以下のコマンドでMCP Routerに接続できます。

```bash
npx mcpr-cli connect
```

接続には、MCP Routerを起動しておく必要があります。


### リクエストログの表示

![](/img/tutorial/logs.gif)

MCP Routerは自動的にログを保存します。

ログは、時系列で表示されます。


## MCP Serverの追加

![](/img/tutorial/mcp-router-server.gif)

MCP Routerでは、mcp-router.netに登録されているMCP Serverを簡単に追加できます。
mcp-router.netへの登録は簡単に行えます。

