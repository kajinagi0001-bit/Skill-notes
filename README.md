# Skill Notes

Codexに投げた技術的な疑問を調査・検証し、再利用できるMarkdown記事として公開するAstro製の技術情報サイトです。GitHub Pagesのユーザーサイトとプロジェクトサイトの両方に対応します。

## 必要環境

- Node.js 24
- npm 11

## セットアップ

```bash
npm ci
cp .env.example .env
npm run dev
```

既定では`https://kajinagi0001-bit.github.io/Skill-notes/`向けにビルドします。公開先を変更する場合は次の環境変数を設定します。

| 変数        | 説明                  | 例                                 |
| ----------- | --------------------- | ---------------------------------- |
| `SITE_URL`  | 公開サイトの完全なURL | `https://example.github.io/notes/` |
| `BASE_PATH` | URLのリポジトリ名部分 | `/notes`                           |

ユーザーサイトまたは独自ドメインでは`BASE_PATH=/`を指定します。

## 記事を追加する

1. `.github/ARTICLE_TEMPLATE.md`を参考に`src/content/articles/{slug}/index.md`を作成します。
2. slugには英小文字、数字、ハイフンを使用します。
3. 執筆中は`draft: true`、公開時は`draft: false`にします。
4. `npm run validate`ですべての検証を実行します。
5. Pull Requestを作成し、CI成功後に既定ブランチへマージします。

Codexへ記事作成を依頼する場合は、元の疑問に加えて「対象バージョン」「検証環境」「記事で特に残したい判断」を伝えると、再現性の高い記事になります。情報が不明な場合は、Codexが公式資料と実環境を調査して補います。

このリポジトリを開いたCodexへ記事作成を明示的に依頼すると、`AGENTS.md`のルールに従い、記事作成、`npm run validate`、コミット、push、GitHub Pagesのデプロイ確認、公開URLの案内までを自動で行います。下書きやレビューだけが必要な場合は、その旨を依頼時に明記してください。

## コマンド

| コマンド              | 用途                              |
| --------------------- | --------------------------------- |
| `npm run dev`         | 開発サーバーを起動                |
| `npm run build`       | サイトと検索インデックスを生成    |
| `npm run preview`     | ビルド結果を確認                  |
| `npm run lint`        | Astro、TypeScript、Markdownを検査 |
| `npm run format`      | Prettierで整形                    |
| `npm run typecheck`   | AstroとTypeScriptの型検査         |
| `npm run check:links` | ビルド済みサイトのリンクを検査    |
| `npm test`            | 自動テストを実行                  |
| `npm run validate`    | CI相当の全検証を実行              |

## GitHub Pagesへ公開する

1. GitHubのリポジトリ設定で **Pages > Build and deployment > Source** を **GitHub Actions** にします。
2. 必要ならRepository Variablesに`SITE_URL`と`BASE_PATH`を登録します。
3. `main`ブランチへpushすると`.github/workflows/deploy.yml`が検証とデプロイを実行します。

Pull Requestでは`.github/workflows/ci.yml`が検証のみを行います。

## 主な構成

```text
src/
├── components/       # 共通UI
├── content/articles/ # Markdown / MDX記事
├── layouts/          # 共通・記事レイアウト
├── pages/            # ページと動的ルート
├── styles/           # グローバルスタイル
└── utils/            # 記事・URLヘルパー
```

## ライセンス

ソースコードと記事のライセンスは、運用開始前にリポジトリ所有者が決定してください。
