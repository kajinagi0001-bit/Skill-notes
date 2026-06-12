# 別のGitHubアカウントでSkill Notesを構築する方法

別のGitHubアカウントでも、このSkill Notesを複製して利用できます。

以下では、新しいGitHubアカウント名を`NEW-USER`、新しいリポジトリ名を`skill-notes`として説明します。

## 1. 新しいリポジトリを作る

新しいGitHubアカウントで空のリポジトリを作成します。

- Repository name: `skill-notes`
- Visibility: `Public`
- READMEや`.gitignore`は追加しない

無料アカウントでGitHub Pagesを使う場合は、基本的に公開リポジトリにします。

## 2. リポジトリを複製する

PowerShellで実行します。

```powershell
git clone https://github.com/kajinagi0001-bit/Skill-notes.git
cd Skill-notes
```

元のリポジトリを`upstream`として残し、新しいリポジトリを`origin`に設定します。

```powershell
git remote rename origin upstream
git remote add origin https://github.com/NEW-USER/skill-notes.git
git remote -v
```

新しいリポジトリへ送ります。

```powershell
git push -u origin main
```

## 3. サイト情報を変更する

`src/consts.ts`を編集します。

```typescript
export const SITE = {
  title: "自分のサイト名",
  description: "自分のサイトの説明",
  author: "NEW-USER",
  repository: "https://github.com/NEW-USER/skill-notes",
  locale: "ja_JP",
  language: "ja",
} as const;
```

## 4. 公開URLを変更する

通常のプロジェクトサイトの場合、URLは次の形です。

```text
https://NEW-USER.github.io/skill-notes/
```

`astro.config.mjs`の既定値を変更します。

```javascript
const site =
  process.env.SITE_URL ?? "https://NEW-USER.github.io/skill-notes/";
const base = process.env.BASE_PATH ?? "/skill-notes";
```

`scripts/check-links.mjs`も同様に変更します。

```javascript
const base = (process.env.BASE_PATH ?? "/skill-notes").replace(/\/$/, "");

const site = new URL(
  process.env.SITE_URL ?? "https://NEW-USER.github.io/skill-notes/",
);
```

## 5. GitHubの変数を登録する

新しいリポジトリのGitHub画面で次を開きます。

```text
Settings
→ Secrets and variables
→ Actions
→ Variables
→ New repository variable
```

次の2つを登録します。

| Name | Value |
| --- | --- |
| `SITE_URL` | `https://NEW-USER.github.io/skill-notes/` |
| `BASE_PATH` | `/skill-notes` |

リポジトリ名の大文字・小文字も、実際の名前に合わせてください。

## 6. GitHub Pagesを有効にする

GitHubで次を開きます。

```text
Settings
→ Pages
→ Build and deployment
→ Source
```

`Source`を`GitHub Actions`に設定します。

## 7. ローカルで確認する

Node.js 24をインストールして実行します。

```powershell
npm ci
npm run validate
npm run dev
```

通常は次のURLで確認できます。

```text
http://localhost:4321/skill-notes/
```

## 8. 変更を公開する

```powershell
git add .
git commit -m "Customize site for new GitHub account"
git push origin main
```

GitHubの`Actions`タブで`Deploy to GitHub Pages`が成功したことを確認します。

公開URLは次のようになります。

```text
https://NEW-USER.github.io/skill-notes/
```

## ユーザーサイトとして公開する場合

リポジトリ名を次のようにした場合は、ユーザーサイトになります。

```text
NEW-USER.github.io
```

この場合の設定は異なります。

```text
SITE_URL=https://NEW-USER.github.io/
BASE_PATH=/
```

`astro.config.mjs`の既定値も次のようにします。

```javascript
const site = process.env.SITE_URL ?? "https://NEW-USER.github.io/";
const base = process.env.BASE_PATH ?? "/";
```

## 元サイトの更新を取り込む

`upstream`を残した場合、将来このリポジトリの更新を取り込めます。

```powershell
git fetch upstream
git merge upstream/main
git push origin main
```

自分の記事や設定と競合する可能性があるため、実行前に変更をコミットしておくのが安全です。

## 参考資料

- [GitHubリポジトリの複製](https://docs.github.com/en/repositories/creating-and-managing-repositories/duplicating-a-repository)
- [GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [AstroのGitHub Pages公開手順](https://docs.astro.build/en/guides/deploy/github/)
