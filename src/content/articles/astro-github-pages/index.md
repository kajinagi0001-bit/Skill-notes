---
title: "AstroをGitHub Pagesへ安全にデプロイする"
description: "Astro製の静的サイトを、プロジェクトサイトのベースパスに対応させながらGitHub Actionsで継続的に公開する手順を整理します。"
publishedAt: 2026-06-12
updatedAt: 2026-06-12
category: "GitHub"
tags:
  - "Astro"
  - "GitHub Pages"
  - "CI/CD"
draft: false
---

GitHub Pagesのプロジェクトサイトでは、URLにリポジトリ名が含まれます。Astro側の`site`と`base`を正しく設定し、リンクと静的アセットがその配下で解決されるようにする必要があります。

## 前提条件

| 項目     | 値             |
| -------- | -------------- |
| Astro    | 6系            |
| Node.js  | 24系           |
| 公開方法 | GitHub Actions |
| 検証日   | 2026-06-12     |

## AstroのURL設定

`astro.config.mjs`で公開URLとベースパスを環境変数から受け取ります。

```js title="astro.config.mjs"
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH,
});
```

サイト内リンクには`import.meta.env.BASE_URL`を反映します。先頭のスラッシュだけでリンクを記述すると、プロジェクトサイトではユーザーサイトのルートへ移動してしまうためです。

<aside>
  <strong>ポイント:</strong> 独自ドメインやユーザーサイトでは、<code>BASE_PATH=/</code>として同じコードを利用できます。
</aside>

## Actionsからデプロイする

GitHub Pagesの設定画面で公開元を **GitHub Actions** に変更します。ワークフローでは、ビルド後の`dist`ディレクトリをPages用artifactとしてアップロードします。

```yaml title=".github/workflows/deploy.yml"
permissions:
  contents: read
  pages: write
  id-token: write
```

権限はジョブに必要な範囲へ限定します。Pull Requestではデプロイせず、lint、型検査、テスト、ビルドだけを実行します。

## 確認項目

- CSSとJavaScriptが読み込まれる
- 記事への直リンクを再読み込みできる
- RSSとsitemapのURLが本番URLを指す
- Pagefindの検索インデックスがベースパス配下にある

## 参考資料

- [Astro: Deploy your Astro Site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Docs: Using custom workflows with GitHub Pages](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
