---
sidebar_position: 1
title: MCPとMCP Routerをはじめよう
---

## MCPとは何か？

Model Context Protocol（MCP）は、大規模言語モデル（LLM）の能力を拡張するために設計された画期的な標準規格です。簡単に言えば、MCPは「AI版のUSB-Cポート」として機能し、LLMを搭載したアプリケーションを外部のデータソースやツールと接続するための共通インターフェースを提供します。MCPを導入することで、以下の3つの主要な側面においてアプリケーションの機能を強化できます。

- リソース： これは、LLMが参照可能な追加の情報を提供します。
- ツール： これは、LLMが実行できる操作や機能を提供します。
- プロンプト： これは、あらかじめ定義された指示文やテンプレートで、LLMの応答生成を導きます。

例えば、ClaudeのようなLLM搭載アプリケーションに「fetch」というツールが備わったMCPサーバーを導入すると、Claudeは自動的にこのツールを使ってニュースなどの最新情報を取得することが可能になります。

MCPが特に革新的なのは、基盤となるモデルの開発とアプリケーション開発との関心を分離できる点にあります。つまり、OpenAIやAnthropicのようなモデル開発企業は、個別の検索ツールや連携機能の実装競争に煩わされるのではなく、MCPの利用を前提としたモデルの開発に集中できるようになります。長期的には、このアプローチによりモデル開発が加速し、ユーザーに対して大きなメリットがもたらされると期待されます。

しかし短期的な視点では、MCPを導入することでLLMアプリケーションの能力は確実に向上し、ユーザーにも恩恵があるものの、現在は安全性やユーザーエクスペリエンス（UX）の面で課題が残っています。**現状、各アプリケーション（例えばCursorやClaudeなど）はそれぞれ独自にMCPサーバーをインストールし、立ち上げた状態で利用されていますが、実際にどのようにMCPサーバーが活用されているかは十分に明らかになっていません。MCPがより広く普及するためには、安全かつ使いやすい環境の整備が不可欠です。**

## なぜMCP Routerは重要なのか？

上記のMCPが抱える短期的な安全性とUX上の課題を解決するために、[MCP Router](https://mcp-router.net)が開発されました。MCP Routerは、MCPの利用環境を大幅に改善し、セキュリティとユーザーエクスペリエンスの向上に寄与することを目的としています。

MCP Routerを使用しない場合、各アプリケーションが個別にMCPサーバーを管理するため、環境が分断された状態になります。例えば、以下の図のように個別管理されるケースが挙げられます。

![](/img/tutorial/mcp-without-mcp-router.png)

一方、MCP Routerを導入すると、環境全体が統合され、以下のように一元管理が可能になります。

![](/img/tutorial/mcp-router-intro.png)

MCP Routerは、単にMCPサーバの管理を一元化するだけでなく、以下の重要な機能も実装しています。

- どのアプリケーションがどのMCPサーバーの利用を許可されるかの制御
- 利用ログの保存と可視化

これにより、MCPの連携機能がより安全かつ使いやすいものとなり、広範な普及に向けた環境整備が進むことが期待されます。

## MCP Routerの使用方法

[こちら](https://github.com/mcp-router/mcp-router/releases)からアプリをダウンロードして始めましょう。

使い方はとても簡単で、MCPに対応している全てのアプリケーション（Claude、Cursor、Clineも含みます！）からご利用いただけます。
また、接続可能なMCPは無限で、Zapier等のSaaS、Cloudflare等のクラウド環境、自社構築のオンプレ環境に対応しています。

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

MCP Routerでは、[mcp-router.net](https://mcp-router.net)に登録されているMCP Serverを簡単に追加できます。
[mcp-router.net](https://mcp-router.net)への登録は簡単に行えます。

