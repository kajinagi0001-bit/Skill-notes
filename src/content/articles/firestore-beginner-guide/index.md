---
title: "Firestore入門：仕組み・設計・セキュリティからWebアプリ実装まで"
description: "Google Cloud Firestoreの仕組み、データ設計、クエリ、料金、Security Rulesを整理し、初心者向けメモアプリの作成手順をコード付きで解説します。"
publishedAt: 2026-06-15
category: "Firebase"
tags:
  - "Firestore"
  - "Firebase"
  - "NoSQL"
  - "JavaScript"
  - "Web開発"
draft: false
---

Cloud Firestore（以下、Firestore）は、Google CloudとFirebaseから利用できるマネージド型のドキュメントデータベースです。サーバーの構築やデータベースプロセスの管理をせずに、Web・モバイル・サーバーアプリからデータを保存できます。

特にFirebase AuthenticationやSecurity Rulesと組み合わせると、WebブラウザやモバイルアプリからFirestoreへ直接接続するサーバーレス構成を作れます。ただし、簡単に接続できることと、安全かつ安価に運用できることは別です。データ構造、アクセス制御、クエリ回数、インデックスを理解せずに使うと、情報漏えいや想定外の課金につながります。

この記事では、Firestoreの全体像を整理した後、初心者が小さなメモアプリを作る手順を解説します。

## 前提条件

| 項目               | 内容                                                     |
| ------------------ | -------------------------------------------------------- |
| 対象サービス       | Cloud Firestore Standard edition                         |
| 対象SDK            | Firebase JavaScript SDKのモジュラーAPI                   |
| 公式Quickstart記載 | `firebase@12.14.0`                                       |
| 検証日             | 2026-06-15                                               |
| 想定読者           | HTMLとJavaScriptの基礎を学び、データ保存を試したい初心者 |

SDKや料金、上限、コンソール画面は更新されます。実際のプロジェクトでは、記事末尾の公式ドキュメントも確認してください。

## Firestoreとは

Firestoreは、データを**コレクション**と**ドキュメント**に分けて保存するNoSQLデータベースです。リレーショナルデータベースのようなテーブル、行、外部キー、JOINを中心に設計するのではなく、アプリが読み取りやすい単位でJSONに似たデータを配置します。

主な特徴は次のとおりです。

- サーバー管理が不要なマネージドサービス
- Web、Android、Appleプラットフォーム向けSDK
- Node.js、Python、Go、Javaなどのサーバー向けライブラリ
- リアルタイム更新の購読
- モバイルとWebでのオフライン対応
- 自動スケーリング
- インデックスを利用したクエリ
- Firebase AuthenticationとSecurity Rulesによるアクセス制御
- トランザクションと一括書き込み
- Google CloudのIAM、監視、バックアップ機能との統合

Firestoreは、チャット、タスク管理、共同編集、ユーザープロフィール、商品カタログなど、クライアントが頻繁にデータを読み書きするアプリと相性があります。

## FirebaseとGoogle Cloudの関係

Firebaseプロジェクトは、内部的にはGoogle Cloudプロジェクトでもあります。FirestoreはFirebaseコンソールとGoogle Cloudコンソールの両方から管理できます。

役割を大まかに分けると次のようになります。

| 領域                    | 主な用途                                          |
| ----------------------- | ------------------------------------------------- |
| Firebaseコンソール      | アプリ登録、データ閲覧、Rules、Authentication     |
| Google Cloudコンソール  | IAM、課金、詳細な監視、バックアップ、インフラ管理 |
| FirebaseクライアントSDK | Web・モバイルアプリからのアクセス                 |
| Admin SDK・サーバーSDK  | 信頼できるバックエンドからの特権アクセス          |
| Cloud Firestore Rules   | Web・モバイルSDKからのアクセス制御                |
| Google Cloud IAM        | サーバーSDKや管理操作の権限制御                   |

重要なのは、**サーバー向けライブラリはSecurity Rulesを迂回する**ことです。サーバーではIAMとサービスアカウントを正しく設定する必要があります。

## Standard editionとEnterprise edition

FirestoreにはStandard editionとEnterprise editionがあります。一般的なFirebaseアプリを初めて作る場合は、FirebaseのQuickstartで案内されているStandard editionを基準にすると理解しやすいでしょう。

Enterprise editionには、Standard editionとは異なる互換性、クエリ、課金モデルなどがあります。既存のMongoDB系ツールとの互換性や企業向け要件が判断材料になるため、採用時は公式のedition比較を確認してください。

この記事のコードとSecurity RulesはStandard editionのNative modeを前提にします。

## Realtime Databaseとの違い

FirebaseにはRealtime Databaseという別のNoSQLデータベースもあります。

| 比較項目     | Firestore                              | Realtime Database            |
| ------------ | -------------------------------------- | ---------------------------- |
| データモデル | コレクションとドキュメント             | 大きなJSONツリー             |
| クエリ       | 複合的な絞り込みと並べ替えに対応       | 比較的単純                   |
| スケーリング | 大規模で複雑なデータ向け               | 単純で低遅延な同期に向く     |
| オフライン   | Web、Android、Appleで対応              | 主にAndroid、Appleで対応     |
| プレゼンス   | ネイティブ機能なし                     | 接続状態の管理を標準サポート |
| 主な課金単位 | 読み取り、書き込み、削除、保存、通信量 | 保存量と通信量               |

複雑な検索、拡張性、ドキュメント単位の管理が必要ならFirestoreが有力です。オンライン状態の表示など、非常に頻繁な接続状態の同期にはRealtime Databaseを併用する構成もあります。

## データモデルの基本

### コレクション

コレクションはドキュメントをまとめる入れ物です。たとえば`users`、`posts`、`tasks`などの名前を付けます。

コレクション自体に通常のデータフィールドを保存することはできません。

### ドキュメント

ドキュメントはフィールドと値を持つデータ単位です。各ドキュメントにはIDがあります。

```text
users
└── user-001
    ├── displayName: "Aki"
    ├── email: "aki@example.com"
    └── createdAt: Timestamp
```

JavaScriptのオブジェクトに近い形ですが、保存できる型やサイズにはFirestoreの制約があります。1ドキュメントの最大サイズは公式の上限ページで確認してください。

### サブコレクション

ドキュメントの下に別のコレクションを配置できます。

```text
users
└── user-001
    └── notes
        ├── note-001
        └── note-002
```

この場合、パスは次のようになります。

```text
users/user-001/notes/note-001
```

ドキュメントとコレクションは交互に並びます。

### ドキュメントID

IDは自分で指定するか、SDKに自動生成させます。

```javascript
// IDを指定
await setDoc(doc(db, "users", "user-001"), {
  displayName: "Aki",
});

// ランダムなIDを自動生成
await addDoc(collection(db, "users"), {
  displayName: "Aki",
});
```

連番IDは書き込みが特定範囲へ集中する原因になり得ます。特別な理由がなければ、自動生成IDを利用する方が無難です。

## 保存できる代表的な型

Firestoreでは次のような値を保存できます。

- 文字列
- 数値
- 真偽値
- null
- Timestamp
- 地理座標
- バイト列
- ドキュメント参照
- 配列
- Map

```javascript
{
  title: "Firestoreを学ぶ",
  completed: false,
  priority: 2,
  tags: ["firebase", "database"],
  profile: {
    theme: "dark",
    notifications: true
  }
}
```

JavaScriptの`Date`はSDKによってFirestoreのTimestampへ変換できます。サーバー時刻を記録したい場合は、クライアント端末の時計ではなく`serverTimestamp()`を使用します。

```javascript
import { serverTimestamp } from "firebase/firestore";

await addDoc(collection(db, "notes"), {
  title: "メモ",
  createdAt: serverTimestamp(),
});
```

## データ設計の考え方

Firestoreでは、正規化を徹底するよりも、**実際の読み取りパターンに合わせてデータを配置する**ことが重要です。

設計前に次を明確にします。

1. どの画面で何件表示するか
2. どのフィールドで絞り込むか
3. どの順序で並べるか
4. 誰がどのデータを読めるか
5. どの単位で更新するか
6. 同じデータを何回読むか

### ドキュメント内の配列

少数で上限が明確な値には配列が便利です。

```javascript
{
  title: "記事",
  tags: ["firebase", "web"]
}
```

一方、コメントや履歴のように増え続けるデータを巨大な配列へ入れると、ドキュメント全体が大きくなります。独立したコレクションまたはサブコレクションへ分けます。

### ルートコレクション

```text
posts/{postId}
comments/{commentId}
```

複数の親を横断して検索しやすい構造です。コメント側に`postId`を持たせて検索します。

### サブコレクション構造

```text
posts/{postId}/comments/{commentId}
```

親子関係が分かりやすく、特定投稿のコメントを取得しやすい構造です。すべての投稿配下を横断する場合はコレクショングループクエリを検討します。

### 非正規化

Firestoreには一般的なSQLのJOINがありません。表示に必要なユーザー名などを投稿ドキュメントへ複製することがあります。

```javascript
{
  body: "本文",
  authorId: "user-001",
  authorDisplayName: "Aki"
}
```

読み取りは簡単になりますが、ユーザー名変更時に複数ドキュメントを更新する必要があります。複製する値、更新頻度、一貫性要件を比較して決めます。

## 読み取りとクエリ

### 1件取得

```javascript
import { doc, getDoc } from "firebase/firestore";

const snapshot = await getDoc(doc(db, "notes", "note-001"));

if (snapshot.exists()) {
  console.log(snapshot.id, snapshot.data());
}
```

### コレクション取得

```javascript
import { collection, getDocs } from "firebase/firestore";

const snapshot = await getDocs(collection(db, "notes"));

snapshot.forEach((document) => {
  console.log(document.id, document.data());
});
```

データ量が増えるコレクションを無条件ですべて取得する実装は避け、`limit()`とページネーションを使用します。

### 条件検索

```javascript
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const notesQuery = query(
  collection(db, "notes"),
  where("ownerId", "==", currentUser.uid),
  orderBy("createdAt", "desc"),
  limit(20),
);

const snapshot = await getDocs(notesQuery);
```

Firestoreはクエリに必要なインデックスを使います。基本的なインデックスは自動作成されますが、複数フィールドを組み合わせたクエリでは複合インデックスが必要になる場合があります。

不足している場合、エラーにFirebaseコンソールでインデックスを作成するためのリンクが表示されます。開発中に作ったインデックスは`firestore.indexes.json`でも管理し、環境間で再現できるようにします。

### ページネーション

大量データではオフセットよりカーソルを使います。

```javascript
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";

const firstQuery = query(
  collection(db, "notes"),
  orderBy("createdAt", "desc"),
  limit(20),
);

const firstPage = await getDocs(firstQuery);
const lastDocument = firstPage.docs.at(-1);

const nextQuery = query(
  collection(db, "notes"),
  orderBy("createdAt", "desc"),
  startAfter(lastDocument),
  limit(20),
);
```

## 書き込み操作

### 新規追加

```javascript
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const reference = await addDoc(collection(db, "notes"), {
  title: "最初のメモ",
  body: "Firestoreへ保存しました",
  createdAt: serverTimestamp(),
});

console.log(reference.id);
```

### IDを指定して作成・置換

```javascript
import { doc, setDoc } from "firebase/firestore";

await setDoc(doc(db, "profiles", user.uid), {
  displayName: "Aki",
  theme: "light",
});
```

`setDoc()`は指定内容でドキュメントを作成または置換します。既存フィールドを残したい場合は`merge`を指定します。

```javascript
await setDoc(doc(db, "profiles", user.uid), { theme: "dark" }, { merge: true });
```

### 一部更新

```javascript
import { doc, updateDoc } from "firebase/firestore";

await updateDoc(doc(db, "notes", noteId), {
  title: "更新後のタイトル",
  updatedAt: serverTimestamp(),
});
```

存在しないドキュメントに対する`updateDoc()`は失敗します。

### 削除

```javascript
import { deleteDoc, doc } from "firebase/firestore";

await deleteDoc(doc(db, "notes", noteId));
```

親ドキュメントを削除しても、その配下のサブコレクションは自動削除されません。階層データの削除方法は設計時に決めておきます。

## リアルタイム更新

`onSnapshot()`を使うと、初回データと以後の変更通知を受け取れます。

```javascript
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const notesQuery = query(collection(db, "notes"), orderBy("createdAt", "desc"));

const unsubscribe = onSnapshot(
  notesQuery,
  (snapshot) => {
    const notes = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    renderNotes(notes);
  },
  (error) => {
    console.error(error);
  },
);

// 画面を離れるときに解除する
unsubscribe();
```

購読中は変更に応じて読み取りが発生します。画面外になった購読を解除しない実装は、メモリ使用量だけでなく読み取り課金も増やす可能性があります。

## トランザクションと一括書き込み

複数操作をすべて成功またはすべて失敗させたい場合、トランザクションかバッチ書き込みを使います。

### トランザクション

読み取った現在値をもとに更新するときに使います。

```javascript
import { doc, runTransaction } from "firebase/firestore";

const counterReference = doc(db, "counters", "notes");

await runTransaction(db, async (transaction) => {
  const snapshot = await transaction.get(counterReference);
  const current = snapshot.exists() ? snapshot.data().count : 0;

  transaction.set(counterReference, {
    count: current + 1,
  });
});
```

競合が発生するとSDKが再試行するため、トランザクション関数内でメール送信などの副作用を実行しないようにします。また、クライアントがオフラインの場合、トランザクションは失敗します。

### バッチ書き込み

事前読み取りを必要としない複数書き込みに使います。

```javascript
import { doc, writeBatch } from "firebase/firestore";

const batch = writeBatch(db);

batch.set(doc(db, "notes", "note-a"), { title: "A" });
batch.set(doc(db, "notes", "note-b"), { title: "B" });
batch.update(doc(db, "profiles", user.uid), {
  lastAction: "created-notes",
});

await batch.commit();
```

操作数やリクエストサイズには上限があります。大量データ処理ではサーバー側のBulkWriter、管理サービス、分割処理などを検討します。

## オフライン対応

Firestore SDKは、アプリが利用しているデータをキャッシュし、オフラインでも読み取り、書き込み、購読、クエリを行える仕組みを提供します。

Webでは永続キャッシュを明示的に設定する構成があります。共有端末では、キャッシュに機密情報が残る可能性を考慮してください。

オフライン中の書き込みは接続回復後に同期されます。同じドキュメントへの複数変更では、基本的に後の書き込みが反映されます。業務上厳密な競合解決が必要なら、単純なオフライン同期だけに依存せず、バージョン番号やサーバー側検証を設計します。

## Security Rules

Web・モバイルアプリからFirestoreを使う場合、Security Rulesは必須です。Firebaseの設定値をブラウザへ含めないことではなく、Rulesで不正な読み書きを拒否することが防御の中心になります。

FirebaseのWeb設定に含まれる`apiKey`や`projectId`は、クライアントアプリを識別して接続先を示す設定です。これらを秘密鍵と考えて隠すだけでは、データは保護されません。

### 危険なルール

```text
match /{document=**} {
  allow read, write: if true;
}
```

このルールは誰にでも全データを許可します。学習用の短時間の動作確認を除き、公開環境で使用してはいけません。

期限付きのテストモードも、期限までは広いアクセスを許可します。後で直す前提にせず、認証とRulesを早い段階で実装します。

### 認証済みユーザーだけに許可

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, create: if request.auth != null;
    }
  }
}
```

これだけでは、認証済みユーザーが他人のメモを読めます。所有者を確認する必要があります。

### 所有者だけに許可

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow create: if request.auth != null
        && request.resource.data.ownerId == request.auth.uid;

      allow read, delete: if request.auth != null
        && resource.data.ownerId == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.ownerId == request.auth.uid
        && request.resource.data.ownerId == resource.data.ownerId;
    }
  }
}
```

- `request.auth`は認証情報
- `resource.data`は更新前の保存データ
- `request.resource.data`は書き込み後に保存される予定のデータ

更新時に`ownerId`を書き換えられないことも確認しています。

### データ検証を加える

```text
allow create: if request.auth != null
  && request.resource.data.keys().hasOnly([
    "title",
    "body",
    "ownerId",
    "createdAt"
  ])
  && request.resource.data.title is string
  && request.resource.data.title.size() > 0
  && request.resource.data.title.size() <= 100
  && request.resource.data.body is string
  && request.resource.data.body.size() <= 5000
  && request.resource.data.ownerId == request.auth.uid;
```

クライアント側バリデーションは操作性向上のために行い、Rules側バリデーションは不正アクセス防止のために行います。どちらか一方で代用できるものではありません。

### Rulesはフィルターではない

Rulesは、取得後に許可されたデータだけを残すフィルターではありません。クエリが権限のないドキュメントを返す可能性がある場合、クエリ全体が失敗します。

所有者だけに読み取りを許可するなら、クエリにも所有者条件を含めます。

```javascript
const notesQuery = query(
  collection(db, "notes"),
  where("ownerId", "==", currentUser.uid),
  orderBy("createdAt", "desc"),
);
```

## Authenticationとの組み合わせ

Firestoreだけでユーザーのパスワードを保存して認証機能を自作するのは避けます。Firebase Authenticationを利用し、認証結果の`uid`をデータ所有者の識別に使います。

典型的な流れは次のとおりです。

```text
1. ユーザーがFirebase Authenticationでログイン
2. クライアントSDKが認証トークンを取得
3. Firestoreへのリクエストに認証情報が付く
4. Security Rulesがrequest.auth.uidを評価
5. 許可された操作だけが実行される
```

管理者権限などは、必要に応じてCustom Claimsや権限ドキュメントを使います。クライアントが自由に変更できるフィールドを「admin: true」にするだけでは安全ではありません。

## App Checkの役割

Firebase App Checkは、正規のアプリやWebサイトからのアクセスかを確認し、不正クライアントによるバックエンド利用を減らす仕組みです。

ただし、App Checkはユーザーの認可を置き換えません。

```text
Authentication: 誰なのか
Security Rules: 何をしてよいか
App Check: 正規のアプリ環境から来たか
```

本番アプリでは三つを組み合わせて考えます。

## 料金の仕組み

Firestore Standard editionでは、主に次の利用量が課金対象です。

- ドキュメントの読み取り
- ドキュメントの書き込み
- ドキュメントの削除
- クエリで走査したインデックスエントリ
- データとインデックスの保存容量
- ネットワーク通信量
- バックアップ、復元などの追加機能

無料枠はありますが、無料枠の数値や適用条件は変更される可能性があります。公式料金ページを基準にしてください。公式資料では、無料枠を持てるデータベースはプロジェクトごとに一つと説明されています。

### 読み取り回数を意識する

100件の一覧を10回再取得すれば、単純には多数のドキュメント読み取りが発生します。リアルタイムリスナーも無料の常時接続機能ではなく、初回取得や変更通知に伴う読み取りを考慮する必要があります。

改善策は次のとおりです。

- `limit()`で必要件数だけ取得する
- カーソルでページネーションする
- 不要なリアルタイム購読を解除する
- 画面の再描画ごとにクエリを作り直さない
- 集計値を毎回全件走査せず、集計用ドキュメントを検討する
- 開発環境と本番環境を分ける
- Google Cloudの予算とアラートを設定する
- FirebaseコンソールのUsageを監視する

予算アラートは通知であり、通常は自動的な利用停止装置ではありません。アプリ側の制限や監視も必要です。

## 性能とスケーリング

Firestoreは自動スケーリングしますが、どの設計でも無制限に高性能になるわけではありません。

### ホットスポットを避ける

連続するIDや、単一ドキュメントへの極端に高頻度な書き込みは、特定範囲へ負荷を集中させます。

- 自動生成IDを使う
- カウンターを分散する
- 時系列データのキー設計を検討する
- 急激なトラフィック増加は段階的に移行する

### ロケーションを慎重に選ぶ

データベース作成時のロケーションは、利用者への遅延、可用性、料金、他のGoogle Cloudサービスとの通信に影響します。後から簡単に変更できる前提で選ばず、主要利用者とバックエンドに近い場所を選びます。

### インデックスを管理する

Firestoreはインデックスによってクエリ性能を安定させます。一方、使わないインデックスは保存容量と書き込み処理へ影響します。

長い文字列、検索に使わない大きな配列、単調増加するタイムスタンプなど、不要なフィールドインデックスを除外できるか検討します。必要な複合インデックスは設定ファイルで管理します。

## バックアップと削除

Firestoreには、マネージドエクスポート・インポート、バックアップ、Point-in-Time Recoveryなどの選択肢があります。機能、edition、課金プラン、ロケーションによって利用条件が異なります。

注意点は次のとおりです。

- 削除した親ドキュメントのサブコレクションは自動削除されない
- コンソール操作も本番データ変更である
- エクスポート・インポートには課金要件がある
- バックアップを有効にしただけで復元手順の検証が済んだことにはならない
- 開発者ごとのIAM権限を最小化する

重要データでは、復元目標、保持期間、復元テスト、監査ログまで決めます。

## 初心者向け実践：メモアプリを作る

ここからは、HTMLとJavaScriptで次の機能を持つメモアプリを作ります。

- メモを追加する
- 一覧をリアルタイム表示する
- メモを削除する
- ローカル開発時はFirestore Emulatorを使える

説明を単純にするため、この段階ではログインUIを省略します。公開運用する場合は、後述するAuthentication対応版へ進んでください。

## 手順1：必要なものを準備する

インストールします。

- Node.jsのLTS版
- Java 21以降
- Firebase CLI
- コードエディター

Firestore Emulatorの公式ページでは、今後のリリースでJava 21が必要になると案内されています。新規環境ではJava 21以降を選ぶと移行を減らせます。

Firebase CLIをインストールします。

```powershell
npm install --global firebase-tools
firebase --version
```

Firebaseへログインします。

```powershell
firebase login
```

## 手順2：Firebaseプロジェクトを作る

1. [Firebaseコンソール](https://console.firebase.google.com/)を開く
2. 「プロジェクトを追加」を選ぶ
3. プロジェクト名を入力する
4. Google Analyticsの利用有無を選ぶ
5. プロジェクト作成を完了する

練習用と本番用は別プロジェクトにします。プロジェクトIDは外部から参照されるため、個人情報や秘密情報を含めないでください。

## 手順3：Firestoreデータベースを作る

1. Firebaseコンソールで対象プロジェクトを開く
2. 「Databases & Storage」から「Firestore」を開く
3. 「データベースを作成」を選ぶ
4. Standard editionを選ぶ
5. データベースIDは通常`(default)`を使う
6. ロケーションを選ぶ
7. 開始時のSecurity Rulesモードを選ぶ

モバイル・Web向けQuickstartではテストモードが案内されますが、テストモードは誰でも読み書きできる期間があります。この記事では、早い段階でローカルエミュレーターへ接続し、本番Rulesを閉じる方針を推奨します。

最初から本番モードを選んだ場合、Webアプリからの操作はRulesを設定するまで拒否されます。これは正常な動作です。

## 手順4：Webアプリを登録する

Firebaseコンソールのプロジェクト概要からWebアイコンを選び、アプリ名を登録します。表示された設定は次のような形です。

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

この設定はWebアプリへ含まれる前提です。ただし、サービスアカウントのJSON鍵、秘密鍵、管理者認証情報は絶対にブラウザコードやGitへ含めてはいけません。

## 手順5：プロジェクトを作成する

```powershell
mkdir firestore-notes
cd firestore-notes
npm init -y
npm install firebase
npm install --save-dev vite
```

`package.json`へスクリプトを追加します。

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

ファイル構成は次のようにします。

```text
firestore-notes/
├── index.html
├── src/
│   └── main.js
└── package.json
```

## 手順6：画面を作る

`index.html`を作成します。

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Firestore Notes</title>
  </head>
  <body>
    <main>
      <h1>メモ</h1>

      <form id="note-form">
        <label for="title">タイトル</label>
        <input id="title" name="title" maxlength="100" required />

        <label for="body">本文</label>
        <textarea id="body" name="body" maxlength="5000"></textarea>

        <button type="submit">保存</button>
      </form>

      <p id="message" role="status"></p>
      <ul id="note-list"></ul>
    </main>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## 手順7：Firebaseを初期化する

`src/main.js`へ初期化コードを書きます。

```javascript
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

`YOUR_...`をFirebaseコンソールで表示された値に置き換えます。

## 手順8：メモを保存する

初期化コードの後へ追加します。

```javascript
const form = document.querySelector("#note-form");
const message = document.querySelector("#message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!title) {
    message.textContent = "タイトルを入力してください";
    return;
  }

  try {
    await addDoc(collection(db, "notes"), {
      title,
      body,
      createdAt: serverTimestamp(),
    });

    form.reset();
    message.textContent = "保存しました";
  } catch (error) {
    console.error(error);
    message.textContent = "保存に失敗しました";
  }
});
```

この時点のデータは次の形です。

```text
notes/{自動生成ID}
├── title
├── body
└── createdAt
```

## 手順9：一覧をリアルタイム表示する

```javascript
const noteList = document.querySelector("#note-list");
const notesQuery = query(collection(db, "notes"), orderBy("createdAt", "desc"));

onSnapshot(
  notesQuery,
  (snapshot) => {
    noteList.replaceChildren();

    for (const noteDocument of snapshot.docs) {
      const note = noteDocument.data();
      const item = document.createElement("li");
      const heading = document.createElement("h2");
      const body = document.createElement("p");
      const deleteButton = document.createElement("button");

      heading.textContent = note.title;
      body.textContent = note.body;
      deleteButton.type = "button";
      deleteButton.textContent = "削除";

      deleteButton.addEventListener("click", async () => {
        await deleteDoc(doc(db, "notes", noteDocument.id));
      });

      item.append(heading, body, deleteButton);
      noteList.append(item);
    }
  },
  (error) => {
    console.error(error);
    message.textContent = "メモの取得に失敗しました";
  },
);
```

画面へ値を表示するときは`innerHTML`へユーザー入力を直接渡さず、`textContent`を使っています。Firestoreが文字列を保存できることと、HTMLとして安全に表示できることは別です。

## 手順10：ローカルで起動する

```powershell
npm run dev
```

Viteが表示したURLをブラウザで開きます。本番Firestoreへ接続している場合、Rulesが許可していればメモを保存できます。

次は本番データを誤って変更しないように、エミュレーターへ切り替えます。

## 手順11：Firebase CLIを初期化する

プロジェクトのルートで実行します。

```powershell
firebase init firestore
firebase init emulators
```

選択の目安は次のとおりです。

- 既存のFirebaseプロジェクトを選択
- Firestore Rulesファイルは`firestore.rules`
- Indexesファイルは`firestore.indexes.json`
- EmulatorはFirestoreを選択
- Firestore Emulatorのポートは通常`8080`
- Emulator UIを有効化

ローカル開発専用なら、実在するFirebaseプロジェクトではなく`demo-`で始まるデモプロジェクトIDの利用も検討します。公式資料では、誤って本番リソースへ接続する危険を減らせるため、可能な限りデモプロジェクトが推奨されています。

## 手順12：Webアプリをエミュレーターへ接続する

importへ`connectFirestoreEmulator`を追加します。

```javascript
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
```

`getFirestore()`の直後へ追加します。

```javascript
const db = getFirestore(app);

if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
```

エミュレーターを起動します。

```powershell
firebase emulators:start --only firestore
```

通常、Emulator Suite UIは`http://127.0.0.1:4000`で開けます。実際のポートは起動ログを確認してください。

エミュレーター終了時にデータは消えます。開発用データを保持したい場合はimport・export機能を使用します。

```powershell
firebase emulators:start --import=./emulator-data --export-on-exit
```

## 手順13：Rulesを設定する

認証なしの学習段階では、エミュレーターだけで次のRulesを使えます。

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, create, update, delete: if true;
    }
  }
}
```

このRulesを本番へデプロイしてはいけません。公開する前にAuthenticationを追加し、所有者ごとのRulesへ変更します。

本番を安全側に閉じるだけなら次のようにします。

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Rulesとインデックスだけをデプロイするコマンドは次のとおりです。

```powershell
firebase deploy --only firestore
```

## 手順14：Authentication対応へ進む

Firebase Authenticationを有効化し、ログイン後のユーザー情報を使います。

保存するデータへ`ownerId`を追加します。

```javascript
await addDoc(collection(db, "notes"), {
  title,
  body,
  ownerId: currentUser.uid,
  createdAt: serverTimestamp(),
});
```

クエリもユーザーごとに絞ります。

```javascript
import { where } from "firebase/firestore";

const notesQuery = query(
  collection(db, "notes"),
  where("ownerId", "==", currentUser.uid),
  orderBy("createdAt", "desc"),
);
```

Rulesを所有者限定にします。

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow create: if request.auth != null
        && request.resource.data.ownerId == request.auth.uid;

      allow read, delete: if request.auth != null
        && resource.data.ownerId == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.ownerId == request.auth.uid
        && request.resource.data.ownerId == resource.data.ownerId;
    }
  }
}
```

Authenticationの状態確定前にクエリを開始すると、未認証として拒否される場合があります。`onAuthStateChanged()`などで認証状態を確認してからFirestoreの購読を開始します。

## 手順15：Rulesをテストする

目視確認だけでは、他人のデータを読めないことを保証できません。Firebase Emulator Suiteと`@firebase/rules-unit-testing`を使い、許可と拒否を自動テストします。

最低限、次のケースを用意します。

| ケース                               | 期待結果 |
| ------------------------------------ | -------- |
| 未認証ユーザーがメモを読む           | 拒否     |
| 未認証ユーザーがメモを作る           | 拒否     |
| ユーザーが自分のメモを作る           | 許可     |
| ユーザーが自分のメモを読む           | 許可     |
| ユーザーが他人のメモを読む           | 拒否     |
| ユーザーが`ownerId`を書き換える      | 拒否     |
| 許可されていないフィールドを追加する | 拒否     |

エミュレーターは複合インデックスや本番の全上限を完全には再現しません。Rulesのテストはエミュレーターで行い、インデックスと負荷特性は実際のFirestore環境でも確認します。

## よくあるエラー

### Missing or insufficient permissions

Security Rulesが操作を拒否しています。

確認項目は次のとおりです。

- ユーザーがログイン済みか
- `request.auth.uid`と`ownerId`が一致しているか
- 読み取りクエリに所有者条件があるか
- 更新で保護フィールドを書き換えていないか
- Rulesを正しいプロジェクトへデプロイしたか

### The query requires an index

複合インデックスが不足しています。エラーメッセージのリンクから作成し、設定を`firestore.indexes.json`へ反映します。

### データが二重に表示される

同じ画面で`onSnapshot()`を複数回登録している可能性があります。画面破棄時にunsubscribe関数を呼びます。

### createdAtで並べると新規データが一時的に不安定

`serverTimestamp()`はサーバー確定前に推定値や未確定状態を持ちます。UIでは未確定値を扱えるようにし、必要ならローカル作成時刻も補助的に保持します。

### エミュレーターへ接続したつもりで本番へ書いた

接続コードが初回Firestore操作より後に実行されていないか、hostname条件、ポート、プロジェクトIDを確認します。可能ならデモプロジェクトを使い、本番プロジェクトとは設定を分けます。

### 削除した親の配下にデータが残る

Firestoreは親ドキュメント削除時にサブコレクションを連鎖削除しません。サーバー側処理、CLI、管理APIなどで明示的に削除します。

## 初心者が避けるべき設計

### 全データ公開のまま運用する

「APIキーが知られていないから安全」という前提は成立しません。Rulesを最小権限にします。

### すべてを一つの巨大ドキュメントへ入れる

サイズ上限、更新競合、読み取り量、配列更新の複雑さが問題になります。増え続けるデータは分割します。

### コレクション全件を毎回取得する

利用者とデータが増えるほど遅延と料金が増えます。クエリ、上限、ページネーションを設計します。

### クライアントだけで管理者判定する

画面上で管理ボタンを隠しても、直接APIを呼ばれれば防げません。Rules、Custom Claims、信頼できるバックエンドで判定します。

### Admin SDKをブラウザへ入れる

Admin SDKやサービスアカウント鍵は信頼できるサーバー環境専用です。クライアントへ含めると、データベース全体を操作される危険があります。

### Rulesを手作業だけで管理する

コンソール上の変更だけでは、レビュー、再現、ロールバックが難しくなります。`firestore.rules`をGit管理し、自動テストします。

## 本番公開前チェックリスト

### データ設計確認

- 主要画面の読み取りパターンを列挙した
- 1回の画面表示で読むドキュメント数を把握した
- 増え続ける配列をドキュメントへ入れていない
- 必要な複合インデックスを設定ファイルへ保存した
- サブコレクションの削除方法を決めた

### セキュリティ確認

- テストモードの公開Rulesを廃止した
- Authenticationと所有者判定を実装した
- 作成、更新時のフィールドと型をRulesで検証した
- Rulesの許可・拒否テストを用意した
- サーバーSDKのIAMを最小権限にした
- サービスアカウント鍵をGitへ含めていない
- 必要に応じてApp Checkを有効化した

### 課金確認

- 読み取り、書き込み、削除の概算を作った
- リアルタイム購読の範囲を限定した
- `limit()`とページネーションを設定した
- Google Cloudの予算とアラートを設定した
- FirebaseコンソールのUsageを確認する担当を決めた

### 運用確認

- 開発、ステージング、本番プロジェクトを分離した
- ロケーションとデータ保管要件を確認した
- バックアップと復元手順を決めた
- エラー監視とログ確認方法を用意した
- RulesとIndexesをCI/CDでデプロイできる
- 本番環境でインデックスと主要クエリを検証した

## 学習の進め方

初めてFirestoreを学ぶ場合は、次の順序が理解しやすいでしょう。

1. コレクション、ドキュメント、フィールドを理解する
2. EmulatorでCRUDを試す
3. `where()`、`orderBy()`、`limit()`を試す
4. `onSnapshot()`でリアルタイム更新を試す
5. Firebase Authenticationを追加する
6. 所有者限定のSecurity Rulesを書く
7. Rulesの自動テストを作る
8. 読み取り回数と料金を計算する
9. インデックス、ページネーション、バックアップを学ぶ
10. 小規模な本番アプリで監視しながら運用する

CRUDだけを先に覚えて公開するのではなく、Authentication、Security Rules、課金の三つを初期学習へ含めることが重要です。

## まとめ

Firestoreは、クライアントSDK、リアルタイム同期、オフライン機能、Firebase Authenticationとの統合により、Web・モバイルアプリのデータ層を短期間で構築できます。

一方、安全なアプリにするには次の原則が必要です。

- 画面の読み取り方からデータモデルを設計する
- 増え続けるデータを巨大なドキュメントへ詰め込まない
- AuthenticationとSecurity Rulesをセットで実装する
- Rulesは自動テストする
- クエリ件数とリアルタイム購読を課金単位で考える
- Emulatorだけでなく本番のインデックスと上限も確認する
- バックアップ、監視、IAMまで含めて運用する

初心者は、まずエミュレーター上で小さなメモアプリを完成させ、所有者限定Rulesのテストが通ってから本番へ接続すると、安全性と理解を両立しやすくなります。

## 参考資料

- [Firestore公式ドキュメント](https://firebase.google.com/docs/firestore)
- [Firestore Standard edition Quickstart](https://firebase.google.com/docs/firestore/quickstart)
- [Cloud Firestoreのデータモデル](https://firebase.google.com/docs/firestore/data-model)
- [データ構造の選択](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [データの追加](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [リアルタイム更新の取得](https://firebase.google.com/docs/firestore/query-data/listen)
- [トランザクションとバッチ書き込み](https://firebase.google.com/docs/firestore/manage-data/transactions)
- [オフラインデータ](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firestore Security Rules入門](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rulesのテスト](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Firestore Emulatorへの接続](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [インデックスの管理](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firestoreの料金](https://firebase.google.com/docs/firestore/pricing)
- [使用量と上限](https://firebase.google.com/docs/firestore/quotas)
- [FirestoreとRealtime Databaseの比較](https://firebase.google.com/docs/firestore/rtdb-vs-firestore)
- [Firestore editions](https://firebase.google.com/docs/firestore/editions)
- [データのエクスポートとインポート](https://firebase.google.com/docs/firestore/manage-data/export-import)
