---
title: "Pagefindで静的サイトに全文検索を追加する"
description: "サーバーを用意せずに技術記事を全文検索できるよう、ビルド成果物からPagefindのインデックスを生成してAstroへ組み込む方法を解説します。"
publishedAt: 2026-06-10
category: "Web"
tags:
  - "Pagefind"
  - "Astro"
  - "Search"
draft: false
---

Pagefindは生成済みのHTMLを走査し、静的な検索インデックスを作ります。検索サーバーを運用せずに、ブラウザ上で全文検索を提供できます。

## ビルド処理

Astroのビルド後にPagefindを実行します。

```json title="package.json"
{
  "scripts": {
    "build": "astro build && pagefind --site dist"
  }
}
```

生成物は`dist/pagefind`へ配置されます。GitHub Pagesへは`dist`全体をデプロイするため、検索用ファイルも一緒に公開されます。

## 検索対象を制御する

記事本文の要素へ`data-pagefind-body`を付けると、その範囲を検索対象にできます。ナビゲーションやフッターの共通文言が検索結果へ混ざるのを防げます。

```html
<article data-pagefind-body>
  <!-- 記事本文 -->
</article>
```

検索ページや404ページには`data-pagefind-ignore`や`noindex`を設定します。下書き記事はAstroのビルド対象から除外されるため、検索インデックスにも含まれません。

## ベースパスに注意する

GitHub Pagesのプロジェクトサイトでは、Pagefind UIのJavaScriptとCSSもベースパス配下から読み込みます。

```text
/Skill-notes/pagefind/pagefind-ui.js
/Skill-notes/pagefind/pagefind-ui.css
```

ローカル開発中はまだ検索インデックスが存在しません。検索機能の最終確認は`npm run build`の後に`npm run preview`で行います。

## 参考資料

- [Pagefind Documentation](https://pagefind.app/docs/)
