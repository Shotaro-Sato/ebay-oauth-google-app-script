# eBay OAuth2 認証ライブラリ for Google Apps Script

Google Apps ScriptでeBay APIのOAuth2認証を行うためのライブラリです。

## 概要

このライブラリは、Google Apps ScriptでeBay APIを使用する際のOAuth2認証を簡単に行えるようにするものです。認証関数を実行するだけで認証された状態を作ることができます。

## 機能

- ✅ 認証グラントフロー（Authorization Code Flow）の実装
- ✅ 認証URLの自動生成
- ✅ トークンの自動取得と保存
- ✅ リフレッシュトークンによる自動トークン更新
- ✅ Webアプリケーション対応
- ✅ 認証状態の管理
- ✅ 設定の検証機能

## ファイル構成

```
ebay-oauth-google-app-script/
├── AuthorizationCodeFlow.js   # 認証グラントフロー実装（executeAuthorizationCodeFlow含む）
├── eBayOAuthMain.js          # メイン認証関数（ユーティリティ関数）
├── WebApp.gs                 # Webアプリケーション
├── Sample.gs                 # サンプルコード
└── README.md                 # このファイル
```

### 関数の配置について

- **`AuthorizationCodeFlow.js`**: 認証フロー固有の実装（`executeAuthorizationCodeFlow`等）
- **`eBayOAuthMain.js`**: 汎用的なユーティリティ関数（`getAuthStatus`、`clearAuthData`等）

## セットアップ手順

### 1. eBay Developer Programでの設定

1. [eBay Developer Program](https://developer.ebay.com/)に登録
2. アプリケーションを作成
3. 以下の情報を取得：
   - Client ID
   - Client Secret
   - RU Name（Redirect URI Name）

### 2. Google Apps Scriptでの設定

#### 2.1. プロジェクトの作成

1. [Google Apps Script](https://script.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 上記のファイルをプロジェクトに追加

#### 2.2. 設定値の設定

設定は以下の2つの方法で行えます：

**方法1: スクリプトプロパティに設定**

```javascript
// スクリプトプロパティに設定
PropertiesService.getScriptProperties().setProperties({
  'EBAY_CLIENT_ID': 'YOUR_ACTUAL_CLIENT_ID',
  'EBAY_CLIENT_SECRET': 'YOUR_ACTUAL_CLIENT_SECRET',
  'EBAY_REDIRECT_URI': 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
});
```

**方法2: 設定オブジェクトとして直接渡す**

```javascript
const config = {
  clientId: 'YOUR_ACTUAL_CLIENT_ID',
  clientSecret: 'YOUR_ACTUAL_CLIENT_SECRET',
  redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
};
```

#### 2.3. Webアプリケーションのデプロイ

1. `WebApp.gs`ファイルをプロジェクトに追加
2. 「デプロイ」→「新しいデプロイ」を選択
3. タイプを「Web アプリ」に設定
4. アクセス権限を適切に設定
5. デプロイしてURLを取得
6. 取得したURLを`EBAY_REDIRECT_URI`に設定

## 使用方法

### 基本的な認証

```javascript
// 設定オブジェクトを作成
const config = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
};

// 認証を実行
const success = executeAuthorizationCodeFlow(config);

if (success) {
  console.log('認証成功！');
} else {
  console.error('認証失敗');
}
```

### 認証状態の確認

```javascript
// 認証状態を確認
const authStatus = getAuthStatus();
console.log(authStatus);

// トークンの有効性を確認
if (isTokenValid()) {
  console.log('トークン有効');
} else {
  console.log('トークン無効または期限切れ');
}
```

### eBay APIリクエスト

```javascript
// 設定オブジェクト（リフレッシュ時に必要）
const config = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
};

// APIヘッダーを取得
const headers = getApiHeaders(config);

// eBay APIリクエスト
const response = UrlFetchApp.fetch('https://api.ebay.com/sell/inventory/v1/inventory_item', {
  method: 'GET',
  headers: headers
});
```

### 認証URLの取得（手動認証用）

```javascript
// 設定オブジェクトを作成
const config = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
};

// 認証URLを取得
const authUrl = getAuthUrl(config);
console.log('認証URL:', authUrl);
```

### リダイレクトURLからの認証完了

```javascript
// 設定オブジェクトを作成
const config = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
};

// リダイレクトURLから認証を完了
const success = completeAuthFromRedirect(redirectUrl, config);
```

## 主要な関数

### 認証関連

- `executeAuthorizationCodeFlow(config)` - 認証グラントフロー実行
- `getAuthStatus()` - 認証状態の取得
- `isTokenValid()` - トークンの有効性確認
- `getAccessToken(config)` - アクセストークンの取得
- `refreshAccessToken(config)` - トークンの更新
- `clearAuthData()` - 認証データのクリア

### URL関連

- `getAuthUrl(config)` - 認証URLの取得
- `createAuthUrl(config)` - 認証URLの作成
- `completeAuthFromRedirect(redirectUrl, config)` - リダイレクトURLからの認証完了

### API関連

- `getApiHeaders(config)` - APIリクエスト用ヘッダーの取得

## サンプルコード

詳細な使用例は`Sample.gs`ファイルを参照してください。

### 基本的な使用例

```javascript
function example() {
  // 設定オブジェクトを作成
  const config = {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
    scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
  };
  
  // 認証を実行
  const success = executeAuthorizationCodeFlow(config);
  
  if (success) {
    // 認証成功時の処理
    const headers = getApiHeaders(config);
    
    // eBay APIリクエスト
    const response = UrlFetchApp.fetch('https://api.ebay.com/sell/inventory/v1/inventory_item', {
      method: 'GET',
      headers: headers
    });
    
    console.log(response.getContentText());
  }
}
```

## Webアプリケーション

このライブラリにはWebアプリケーション機能が含まれており、ブラウザから直接認証を行うことができます。

### Webアプリの使用方法

1. `WebApp.gs`ファイルをプロジェクトに追加
2. Webアプリとしてデプロイ
3. デプロイしたURLにアクセス
4. ブラウザでeBay認証を実行

**注意**: Webアプリケーションを使用する場合は、スクリプトプロパティに設定値を保存する必要があります。

## トラブルシューティング

### よくある問題

1. **設定エラー**
   - `clientId`、`clientSecret`、`redirectUri`、`scope`が正しく設定されているか確認
   - 設定オブジェクトが正しく渡されているか確認

2. **認証エラー**
   - eBay Developer Programでの設定を確認
   - リダイレクトURIが正しく設定されているか確認

3. **トークン期限切れ**
   - リフレッシュトークンを使用した自動更新が実行されます
   - 手動で`refreshAccessToken(config)`を実行することも可能

### デバッグ

```javascript
// 設定を確認
sampleValidateConfig();

// 認証状態を確認
sampleCheckAuthStatus();

// 全体的なテストを実行
runAllTests();
```

## セキュリティ

- 認証情報はGoogle Apps Scriptのスクリプトプロパティに安全に保存されます
- アクセストークンは自動的に更新されます
- 必要に応じて`clearAuthData()`で認証データをクリアできます

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

バグ報告や機能要望は、GitHubのIssuesでお知らせください。

## 更新履歴

- v2.0.0 - 設定オブジェクト対応
  - `eBayOAuth.js`ファイルを削除
  - 設定オブジェクトを引数として渡す方式に変更
  - より柔軟な設定管理が可能に
- v1.0.0 - 初回リリース
  - 認証グラントフローの実装
  - Webアプリケーション機能
  - 基本的な認証機能 