# 技術情報サイト構築計画

## 1. 目的

GitHub Pagesを使用し、ソフトウェア開発やインフラ、各種ツールの利用方法などの技術情報を、Markdownを中心に継続的に執筆・公開できる静的Webサイトを構築する。

本サイトでは次を重視する。

- 記事をMarkdownで簡単に追加・更新できること
- PCとスマートフォンの両方で読みやすいこと
- コード、図、表、数式など技術記事に必要な表現を扱えること
- カテゴリ、タグ、全文検索から目的の記事を探せること
- GitHubへのpushを契機に検証と公開が自動実行されること
- 静的サイトとして高速、安全かつ低コストで運用できること

## 2. 前提

- GitHubリポジトリでソースコードと記事を管理する。
- GitHub Pagesを公開先とする。
- 公開用ブランチを直接編集せず、GitHub Actionsでビルド成果物をデプロイする。
- サイトは日本語を主言語とする。
- 初期リリースでは利用者登録、コメント投稿、管理画面などのサーバー機能を設けない。
- GitHub Pagesのプロジェクトサイトとユーザーサイトのどちらでも動作できるよう、ベースパスを設定可能にする。

## 3. 採用技術

| 項目 | 採用技術 | 理由 |
| --- | --- | --- |
| 静的サイト生成 | Astro | Markdownとの親和性が高く、必要最小限のJavaScriptで高速なサイトを生成できる |
| 記事形式 | Markdown / MDX | 通常の記事はMarkdown、コンポーネントが必要な記事のみMDXを使用できる |
| スタイル | Astroコンポーネント + CSS | 依存を抑え、サイト固有のデザインを管理しやすくする |
| 型・スクリプト | TypeScript | 設定値や記事メタデータの不整合を早期に検出する |
| パッケージ管理 | npm | Node.js標準の構成で導入障壁を抑える |
| コード表示 | Astroのシンタックスハイライト機能 | ビルド時に静的なコード表示を生成する |
| サイト内検索 | Pagefind | 静的ファイルだけで全文検索を提供できる |
| CI/CD | GitHub Actions | pushおよびPull Request時の検証とGitHub Pagesへの公開を自動化する |
| 品質管理 | ESLint、Prettier、Markdownlint | コードと文書の表記を統一する |

Node.jsや各パッケージのバージョンは初期構築時点の安定版を採用し、`package-lock.json`で固定する。Node.jsはGitHub Actionsとローカルで同一のメジャーバージョンを使用する。

## 4. 対象コンテンツ

記事は、次のような技術情報を対象とする。

- 開発環境の構築手順
- プログラミング言語やフレームワークの解説
- ライブラリ、CLI、IDEなどの利用方法
- クラウド、ネットワーク、コンテナ、CI/CDの知見
- 障害調査や問題解決の記録
- 設計方針、比較、検証結果

記事には可能な限り、対象バージョン、検証日、前提条件、参考資料を明記する。

## 5. サイト構成

### 5.1 画面

| 画面 | パス例 | 内容 |
| --- | --- | --- |
| トップ | `/` | サイト概要、新着記事、主要カテゴリ |
| 記事一覧 | `/articles/` | 公開日の新しい順で全記事を表示 |
| 記事詳細 | `/articles/{slug}/` | 本文、目次、メタ情報、関連記事 |
| カテゴリ一覧 | `/categories/` | カテゴリと記事件数 |
| カテゴリ詳細 | `/categories/{category}/` | カテゴリに属する記事 |
| タグ一覧 | `/tags/` | タグと記事件数 |
| タグ詳細 | `/tags/{tag}/` | タグが付いた記事 |
| 検索 | `/search/` | キーワードによる全文検索 |
| このサイトについて | `/about/` | サイトの目的、運営方針、連絡先 |
| 404 | `/404.html` | 存在しないURLへの案内 |

### 5.2 共通レイアウト

- ヘッダー
  - サイト名
  - 記事一覧、カテゴリ、タグ、検索、Aboutへのナビゲーション
- メイン領域
  - 各ページのコンテンツ
- フッター
  - Copyright
  - GitHubリポジトリへのリンク
  - RSSフィードへのリンク
- モバイル表示
  - ナビゲーションを折りたたみ表示する
  - 本文、表、コードブロックが画面外へ不自然にはみ出さないようにする

## 6. 記事仕様

### 6.1 配置

記事は `src/content/articles/` 配下で管理する。原則として、記事ごとにディレクトリを作り、本文と画像を近い場所に配置する。

```text
src/content/articles/
└── example-article/
    ├── index.md
    ├── architecture.png
    └── result.png
```

URLの識別子には英小文字、数字、ハイフンからなるslugを使用する。

### 6.2 Frontmatter

各記事は次のメタデータを持つ。

```yaml
---
title: "記事タイトル"
description: "検索結果やSNS共有で使用する概要"
publishedAt: 2026-06-12
updatedAt: 2026-06-12
category: "GitHub"
tags:
  - "GitHub Pages"
  - "Astro"
draft: false
---
```

| 項目 | 必須 | 内容 |
| --- | --- | --- |
| `title` | 必須 | 記事タイトル |
| `description` | 必須 | 記事概要。目安は80～160文字 |
| `publishedAt` | 必須 | 初回公開日 |
| `updatedAt` | 任意 | 最終更新日 |
| `category` | 必須 | 主カテゴリ。1記事につき1つ |
| `tags` | 任意 | 補助的な分類。複数指定可能 |
| `draft` | 必須 | `true` の記事は本番ビルドから除外 |
| `image` | 任意 | OGPなどで使用する代表画像 |
| `author` | 任意 | 執筆者。未指定時はサイト既定値を使用 |

Astroのコンテンツスキーマで型と必須項目を検証し、不正な記事はビルドを失敗させる。

### 6.3 本文機能

- 見出しレベルに基づく目次
- 言語別シンタックスハイライト
- コードブロックの横スクロール
- コードのファイル名表示
- 注記、警告、ヒントのコールアウト
- 表、引用、脚注、タスクリスト
- Mermaidによる図表
- 数式表示
- 見出しへのアンカーリンク
- 前後の記事および関連記事へのリンク
- 記事末尾の参考資料一覧

Mermaidと数式は追加依存や表示速度への影響があるため、初期リリースでは記事需要を確認し、必要なものから導入する。

## 7. デザイン仕様

- 技術文書として本文の可読性を最優先にする。
- 本文の最大幅を制限し、長い行を避ける。
- 見出し、本文、注記、コード、リンクの視覚的な階層を明確にする。
- ライトテーマとダークテーマを提供する。
- 初回表示はOS設定を参照し、利用者の選択をブラウザに保存する。
- 色だけに依存せず、文字、アイコン、枠線などを併用して状態を示す。
- キーボードのみでも主要機能を利用できるようにする。
- `prefers-reduced-motion` を尊重し、不要なアニメーションを抑制する。

## 8. 検索・分類

- ビルド後にPagefindの検索インデックスを生成する。
- 記事タイトル、概要、見出し、本文を検索対象とする。
- 下書き、404、検索画面などは検索対象外とする。
- カテゴリは大分類として少数に保ち、タグは横断的なキーワードに使用する。
- カテゴリ名とタグ名は表記揺れを防ぐため、将来的に許可リストで管理できる構成にする。

## 9. SEO・配信仕様

- ページごとに一意な `title` と `meta description` を出力する。
- canonical URLを設定する。
- OGPおよびX向けのメタタグを設定する。
- `sitemap.xml` を生成する。
- `robots.txt` を配置する。
- RSSフィードを生成する。
- HTMLの `lang` を `ja` に設定する。
- 記事ページにArticleの構造化データを付与する。
- 独自ドメインを使用する場合は `CNAME` を成果物に含める。
- GitHub PagesでHTTPSを強制する。

## 10. GitHub Pages対応

### 10.1 URL設定

環境変数またはAstro設定で、次を切り替えられるようにする。

- `site`: 公開サイトの完全なURL
- `base`: プロジェクトサイトの場合のリポジトリ名部分

例:

- ユーザーサイト: `https://example.github.io/`
- プロジェクトサイト: `https://example.github.io/tech-notes/`
- 独自ドメイン: `https://tech.example.com/`

CSS、JavaScript、画像、リンクにはベースパスを考慮したURLを使用する。

### 10.2 デプロイ

`.github/workflows/deploy.yml` に次の処理を定義する。

1. 既定ブランチへのpushまたは手動実行を契機に開始する。
2. リポジトリをcheckoutする。
3. Node.jsをセットアップし、npmキャッシュを有効化する。
4. `npm ci` で依存関係を復元する。
5. lint、型検査、リンク検査、ビルドを実行する。
6. Pagefindの検索インデックスを生成する。
7. GitHub Pages用artifactとして `dist/` をアップロードする。
8. GitHub Pagesへデプロイする。

ワークフローには `pages: write` と `id-token: write` の必要最小限の権限を設定し、同時デプロイを制御する。

Pull Requestでは公開せず、検証用ワークフローでlint、型検査、リンク検査、ビルドのみを実行する。

## 11. 想定ディレクトリ構成

```text
.
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/
├── src/
│   ├── components/
│   ├── content/
│   │   ├── articles/
│   │   └── config.ts
│   ├── layouts/
│   ├── pages/
│   │   ├── articles/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── about.astro
│   │   ├── index.astro
│   │   ├── rss.xml.ts
│   │   └── search.astro
│   ├── styles/
│   ├── utils/
│   └── consts.ts
├── tests/
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
└── PLAN.md
```

## 12. 開発用コマンド

`package.json` に少なくとも次のスクリプトを用意する。

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | ローカル開発サーバーを起動 |
| `npm run build` | 公開用ファイルを生成 |
| `npm run preview` | ビルド成果物をローカル確認 |
| `npm run lint` | コードとMarkdownを検査 |
| `npm run format` | ファイルを整形 |
| `npm run format:check` | 整形差分の有無を検査 |
| `npm run typecheck` | AstroおよびTypeScriptの型検査 |
| `npm run check:links` | 内部・外部リンクを検査 |
| `npm test` | 自動テストを実行 |
| `npm run validate` | CIで必要な検証をまとめて実行 |

## 13. テスト・品質基準

### 13.1 自動検証

- TypeScriptおよびAstroの型検査が成功すること
- ESLint、Prettier、Markdownlintが成功すること
- 全記事のFrontmatterがスキーマに適合すること
- 内部リンクと画像参照が有効であること
- 本番ビルドが成功すること
- 主要ページのHTMLが生成されること
- 下書き記事が本番成果物に含まれないこと
- プロジェクトサイト用のベースパスでリンク切れが発生しないこと

### 13.2 手動確認

- PC、タブレット、スマートフォン幅でレイアウトが崩れないこと
- Chrome、Edge、Firefox、Safariの現行版で主要機能が利用できること
- ライト・ダークテーマの両方で文字が読みやすいこと
- キーボードでナビゲーション、検索、テーマ切替を操作できること
- 長いコード、長いURL、幅広い表が本文領域を破壊しないこと
- GitHub Pages上で直リンクおよびページ再読み込みが成功すること

### 13.3 目標

- LighthouseのPerformance、Accessibility、Best Practices、SEOで各90点以上を目標とする。
- JavaScriptを必要な機能だけに限定する。
- 画像は適切なサイズと形式に変換し、遅延読み込みを使用する。

## 14. セキュリティ・運用

- APIキーなどの秘密情報をリポジトリや生成物に含めない。
- 外部スクリプトの導入を最小限にする。
- GitHub Actionsは公式または信頼できるActionを使用し、コミットSHAまたは適切なメジャーバージョンに固定する。
- DependabotでnpmとGitHub Actionsの更新を定期確認する。
- 既定ブランチを保護し、CI成功をマージ条件にする。
- 記事削除やslug変更時は、可能な範囲で旧URLから新URLへの案内を用意する。
- 外部リンク切れを定期ワークフローで検査する。
- アクセス解析を導入する場合は、プライバシーへの影響とCookie利用の有無を明記する。

## 15. 実装フェーズ

### Phase 1: 基盤構築

- Gitリポジトリを初期化する。
- Astro、TypeScript、Lint、Formatterをセットアップする。
- サイト名、URL、著者などの共通設定を定義する。
- GitHub Pagesのベースパスに対応する。
- READMEにローカル開発手順を記載する。

完了条件:

- `npm ci` と `npm run build` が成功する。
- ローカルでトップページを表示できる。
- ユーザーサイトとプロジェクトサイトのURL設定を切り替えられる。

### Phase 2: 記事機能

- 記事のコンテンツスキーマを定義する。
- 記事一覧、記事詳細、カテゴリ、タグの各ページを実装する。
- 目次、コードハイライト、下書き除外を実装する。
- サンプル記事を2～3件追加する。

完了条件:

- メタデータ不正時にビルドが失敗する。
- 一覧、カテゴリ、タグから各記事へ遷移できる。
- 下書き記事が本番ビルドに出力されない。

### Phase 3: デザインとユーザビリティ

- レスポンシブな共通レイアウトを実装する。
- ライト・ダークテーマを実装する。
- コード、表、画像、注記の表示を整える。
- 404ページとAboutページを作成する。

完了条件:

- 主要な画面幅で横方向のレイアウト崩れがない。
- キーボード操作とフォーカス表示が機能する。
- 色のコントラストがアクセシビリティ基準を満たす。

### Phase 4: 検索・SEO

- Pagefindによる全文検索を実装する。
- OGP、canonical URL、構造化データを設定する。
- sitemap、robots.txt、RSSを生成する。

完了条件:

- 公開記事を検索できる。
- 下書きや除外対象ページが検索結果に現れない。
- 各記事のメタ情報、sitemap、RSSが正しく生成される。

### Phase 5: CI/CDと公開

- Pull Request用のCIを作成する。
- GitHub Pagesデプロイ用ワークフローを作成する。
- リポジトリのPages公開元をGitHub Actionsに設定する。
- 本番URLで表示、リンク、検索、404、HTTPSを確認する。

完了条件:

- Pull Requestで自動検証が実行される。
- 既定ブランチへのマージ後にサイトが自動更新される。
- GitHub Pages上で静的アセットと内部リンクが正しく解決される。

### Phase 6: 運用改善

- Dependabotを設定する。
- 定期リンク検査を設定する。
- 記事テンプレートとPull Requestテンプレートを追加する。
- 必要に応じてアクセス解析、OGP画像自動生成、関連記事精度向上を行う。

## 16. 初期リリース範囲

初期リリースに含めるもの:

- トップ、記事一覧、記事詳細、カテゴリ、タグ、検索、About、404
- Markdown記事とFrontmatter検証
- レスポンシブ表示
- コードハイライト
- ライト・ダークテーマ
- sitemap、RSS、基本的なSEO
- GitHub ActionsによるCI/CD
- サンプル記事

初期リリースに含めないもの:

- コメント機能
- ユーザー登録、ログイン
- Web上の編集・管理画面
- サーバーサイドAPI
- 広告配信
- 多言語対応
- 高度なアクセス解析

## 17. 受け入れ条件

以下をすべて満たした時点で、初期リリース完了とする。

1. 新規記事を所定のディレクトリへ追加するだけで、一覧と詳細ページが生成される。
2. カテゴリ、タグ、全文検索から記事を探せる。
3. PCとスマートフォンで記事、コード、画像を無理なく閲覧できる。
4. `npm run validate` と `npm run build` が成功する。
5. Pull Requestで自動検証が行われる。
6. 既定ブランチへの反映後、GitHub Pagesへ自動デプロイされる。
7. 本番環境で内部リンク、画像、CSS、JavaScript、検索が正常に動作する。
8. 下書き記事と秘密情報が公開成果物に含まれない。
9. sitemap、RSS、OGP、canonical URLが正しく生成される。
10. サイト構築・記事追加・公開手順がREADMEに記載されている。

## 18. 未確定事項

実装開始前またはPhase 1で次を決定する。

- GitHubのアカウント名、リポジトリ名、公開URL
- サイト名、説明文、著者名
- 独自ドメインを使用するか
- ロゴ、テーマカラー、favicon
- 初期カテゴリとタグ
- ライセンスと記事の利用条件
- GitHubリポジトリを公開するか非公開にするか
- Mermaid、数式、アクセス解析を初期リリースに含めるか

## 19. 参考資料

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Using custom workflows with GitHub Pages](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Astro Documentation](https://docs.astro.build/)
- [Deploy your Astro Site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [Pagefind Documentation](https://pagefind.app/docs/)
