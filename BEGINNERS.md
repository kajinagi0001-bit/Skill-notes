# Skill Notes 初心者向け使い方ガイド

## まず何をするか

このサイトは、Markdownファイルを追加してGitHubへ送ると、自動的に記事として公開される仕組みです。

普段の流れは次のとおりです。

1. 記事を書く
2. ローカルで表示を確認する
3. GitHubへpushする
4. GitHub Actionsが自動公開する

## 最初の準備

Node.js 24をインストールしてください。

[Node.js公式サイト](https://nodejs.org/)からLTS版をインストール後、PowerShellで確認します。

```powershell
node --version
npm --version
```

プロジェクトへ移動して依存関係をインストールします。

```powershell
cd C:\Users\kajita\Documents\Projects\Skill-notes
npm ci
```

これは初回と、`package-lock.json`が更新されたときに実行します。

## サイトを起動する

次を実行します。

```powershell
npm run dev
```

表示されたURLをブラウザで開きます。通常は次のURLです。

```text
http://localhost:4321/Skill-notes/
```

停止するときはPowerShellで`Ctrl+C`を押します。

## 新しい記事を書く

記事は次の場所に置きます。

```text
src/content/articles/
```

記事ごとに英数字のフォルダを作り、その中に`index.md`を置きます。

```text
src/content/articles/
└── docker-getting-started/
    └── index.md
```

フォルダ名は英小文字、数字、ハイフンだけにしてください。

記事の雛形は`.github/ARTICLE_TEMPLATE.md`にあります。

記事の先頭には、次のような設定を書きます。

```yaml
---
title: "Dockerの基本的な使い方"
description: "Dockerを初めて使う人向けに、インストールからコンテナの起動までを解説します。"
publishedAt: 2026-06-12
category: "Docker"
tags:
  - "Docker"
  - "Container"
draft: true
---
```

各項目の意味は以下です。

| 項目          | 内容                          |
| ------------- | ----------------------------- |
| `title`       | 記事タイトル                  |
| `description` | 記事の概要                    |
| `publishedAt` | 公開日                        |
| `updatedAt`   | 更新日。必要な場合だけ記載    |
| `category`    | 主な分類を1つ指定             |
| `tags`        | 関連キーワード                |
| `draft`       | `true`は下書き、`false`は公開 |

執筆中は必ず次の状態にします。

```yaml
draft: true
```

公開するときに変更します。

```yaml
draft: false
```

## 本文を書く

Frontmatterの下から通常のMarkdownで書けます。

````markdown
## 結論

Dockerコンテナは次のコマンドで起動できます。

```powershell
docker run hello-world
```

## 注意点

- Docker Desktopを先に起動します
- 使用するバージョンを確認します

## 参考資料

- [Docker公式ドキュメント](https://docs.docker.com/)
````

見出しから目次が自動生成されます。コードブロックには`powershell`、`javascript`、`python`などの言語名を付けると色分けされます。

## 画像を掲載する

記事と同じフォルダへ画像を置きます。

```text
docker-getting-started/
├── index.md
└── docker-screen.png
```

記事から相対パスで指定します。

```markdown
![Dockerの起動画面](./docker-screen.png)
```

## Codexに記事を書かせる

例えば、次のように依頼できます。

```text
Dockerで停止中のコンテナをまとめて削除する方法を調べました。
公式資料を確認し、検証日と注意点を含む記事として追加してください。
下書き状態にしてください。
```

すでに質問した内容を記事化する場合は、次のように依頼できます。

```text
先ほどの回答を、このサイトの記事形式にまとめてください。
対象バージョン、検証手順、参考資料を含め、
src/content/articles/以下へdraft: trueで追加してください。
```

## 公開前に確認する

すべての自動検査を実行します。

```powershell
npm run validate
```

成功すれば、次が確認済みです。

- Markdownとコードの書式
- TypeScriptと記事情報
- 自動テスト
- サイトの生成
- 内部・外部リンク
- Pagefind検索インデックス

本番と同じ成果物を確認する場合は次を実行します。

```powershell
npm run build
npm run preview
```

## GitHub Pagesを有効にする

GitHubでリポジトリを開きます。

1. `Settings`を開く
2. 左側の`Pages`を開く
3. `Build and deployment`を探す
4. `Source`を`GitHub Actions`にする

この設定は最初の一度だけ必要です。

## GitHubへ公開する

記事の`draft`を`false`へ変更し、PowerShellで実行します。

```powershell
git add .
git commit -m "Add Docker getting started article"
git push origin main
```

push後、GitHubの`Actions`タブを開きます。`Deploy to GitHub Pages`が緑色になれば公開成功です。

公開URLは次の予定です。

```text
https://kajinagi0001-bit.github.io/Skill-notes/
```

## よく使うコマンド

```powershell
# 開発画面を表示
npm run dev

# 自動検査
npm run validate

# 本番用サイトを生成
npm run build

# 本番用サイトを確認
npm run preview

# ファイルを自動整形
npm run format
```

サイト名、説明、著者は`src/consts.ts`で変更できます。より詳しい開発手順は`README.md`にも記載しています。

## 他のCodexチャットから利用する

このプロジェクトを開いたCodexチャットであれば利用できます。ただし、チャットの会話内容や文脈は別のチャットへ自動では引き継がれません。

別のチャットで記事を作る場合は、Codexでこのリポジトリをワークスペースとして開き、次のように依頼してください。

```text
このプロジェクトのPLAN.md、README.md、beginner_helper.md、
.github/ARTICLE_TEMPLATE.mdを確認してください。

これから質問する内容を調査し、Skill Notesの記事として
src/content/articles/以下へdraft: trueで追加してください。
公式資料を優先し、対象バージョン、検証日、前提条件、
検証結果、参考資料を記載してください。
```

別のチャットで得た回答を記事化するときは、その回答や元の疑問も新しいチャットへ貼り付けます。

```text
以下は別のCodexチャットで質問した内容と回答です。
このプロジェクトの記事形式に整理してください。

【疑問】
ここに元の質問を書く

【回答】
ここに回答を貼る
```

Codexが別のフォルダを開いている場合、このプロジェクトのファイルを編集できない可能性があります。その場合は、Codexで次のフォルダをワークスペースとして開き直してください。

```text
C:\Users\kajita\Documents\Projects\Skill-notes
```
