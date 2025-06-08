---
sidebar_position: 2
title: AIエージェントをはじめよう
---


## MCP RouterのAIエージェント機能
MCP Routerでは、MCPサーバーを利用するAIエージェントを簡単に作成できます。
AIエージェントは、特定のタスクを自動化したり、ユーザーの要求に応じて情報を提供するためのAIシステムです。
MCP Routerを使用することで、以下のような利点があります。

- **簡単なセットアップ**: MCP Routerをインストールするだけで、AIエージェントをすぐに利用開始できます。
- **多様なMCPサーバーとの統合**: 既存のMCPサーバーを利用して、AIエージェントを構築できます。
- **セキュリティとプライバシー**: MCPはローカルで実行するため、認証のためのトークン等はローカルに保存され、セキュリティが強化されます。
- **簡単なインターフェース**: 直感的な画面と操作で、AIエージェントの管理や設定が容易です。
- **作成したAIエージェントを共有**: 作成したAIエージェントを他のユーザーと共有できます。

## パッケージマネージャのインストール
MCP Routerでは、MCPの動作に必要なパッケージマネージャ（pnpmやuvx）をコマンドでインストールする処理を内蔵しています。
この機能により、一般的なユーザでも簡単なセットアップでAIエージェントを使い始めることができます。

しかし、OSのセキュリティポリシーによっては、コマンドの実行が制限される場合があります。
その場合、以下の手順に従って手動でセットアップを行うことができます。

MacOSの場合、ターミナル（というアプリ）を開き、以下のコマンドを実行します。

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
curl -fsSL https://get.pnpm.io/install.sh | sh -
pnpm env use --global lts
```

Windowsの場合、powershell（というアプリ）を開き、以下のコマンドを実行します。

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
pnpm env use --global lts
```

