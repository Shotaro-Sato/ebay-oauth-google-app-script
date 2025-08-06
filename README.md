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

#### 2.2. 環境の選択

このライブラリは**Production環境**と**Sandbox環境**の両方に対応しています。

**Production環境（本番）**
- 実際のeBayデータにアクセス
- 本格的なアプリケーション開発用

**Sandbox環境（テスト）**
- テストデータにアクセス
- 開発・テスト用（推奨）

#### 2.3. 設定値の設定

スクリプトプロパティに設定を行います：

```javascript
// Production環境の場合
PropertiesService.getScriptProperties().setProperties({
  'EBAY_CLIENT_ID': 'YOUR_ACTUAL_CLIENT_ID',
  'EBAY_CLIENT_SECRET': 'YOUR_ACTUAL_CLIENT_SECRET',
  'EBAY_REDIRECT_URI': 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
});

// Sandbox環境の場合
PropertiesService.getScriptProperties().setProperties({
  'EBAY_CLIENT_ID': 'YOUR_SANDBOX_CLIENT_ID',
  'EBAY_CLIENT_SECRET': 'YOUR_SANDBOX_CLIENT_SECRET',
  'EBAY_REDIRECT_URI': 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment',
  'EBAY_AUTH_URL': 'https://auth.sandbox.ebay.com/oauth2/authorize',
  'EBAY_TOKEN_URL': 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
});
```

#### 2.4. Webアプリケーションのデプロイ

1. `WebApp.gs`ファイルをプロジェクトに追加
2. 「デプロイ」→「新しいデプロイ」を選択
3. タイプを「Web アプリ」に設定
4. アクセス権限を適切に設定
5. デプロイしてURLを取得
6. 取得したURLを`EBAY_REDIRECT_URI`に設定

## 使用方法

### 基本的な認証

```javascript
// スクリプトプロパティに設定が保存されていることを前提
const success = executeAuthorizationCodeFlow();

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
// APIヘッダーを取得
const headers = getApiHeaders();

// eBay APIリクエスト
const response = UrlFetchApp.fetch('https://api.ebay.com/sell/inventory/v1/inventory_item', {
  method: 'GET',
  headers: headers
});
```

### 認証URLの取得（手動認証用）

```javascript
// 認証URLを取得
const authUrl = getAuthUrl();
console.log('認証URL:', authUrl);
```

### リダイレクトURLからの認証完了

```javascript
// リダイレクトURLから認証を完了
const success = completeAuthFromRedirect(redirectUrl);
```



## 主要な関数

### 認証関連
- `executeAuthorizationCodeFlow()` - 認証グラントフロー実行
- `getAuthStatus()` - 認証状態の取得
- `isTokenValid()` - トークンの有効性確認
- `getAccessToken()` - アクセストークンの取得
- `refreshAccessToken()` - トークンの更新
- `clearAuthData()` - 認証データのクリア

### URL関連
- `getAuthUrl()` - 認証URLの取得
- `createAuthUrl()` - 認証URLの作成
- `completeAuthFromRedirect(redirectUrl)` - リダイレクトURLからの認証完了

### API関連
- `getApiHeaders()` - APIリクエスト用ヘッダーの取得

## サンプルコード

詳細な使用例は`Sample.gs`ファイルを参照してください。

### 基本的な使用例

```javascript
function example() {
  // 認証を実行
  const success = executeAuthorizationCodeFlow();
  
  if (success) {
    // 認証成功時の処理
    const headers = getApiHeaders();
    
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

## テスト

このライブラリには単体テストが含まれています。

### テストの実行方法

1. **QUnitライブラリの追加**
   - Google Apps Scriptエディタで「ライブラリ」をクリック
   - ライブラリID: `1cNjlD4uLVcIGK6WvGbRvA9w34eAFdmKbw7sD-qwN8m6QxqX5bJymx1xL` を追加

2. **テストファイルの追加**
   - `Tests.gs`ファイルをプロジェクトに追加

3. **テストの実行**
   ```javascript
   // すべてのテストを実行
   runSimpleTests();
   
   // 特定のテストを実行
   runSpecificTest('config');      // 設定関連テスト
   runSpecificTest('authUrl');     // 認証URL関連テスト
   runSpecificTest('authStatus');  // 認証状態関連テスト
   runSpecificTest('token');       // トークン関連テスト
   runSpecificTest('api');         // API関連テスト
   runSpecificTest('integration'); // 統合テスト
   runSpecificTest('mock');        // モック関数テスト
   runSpecificTest('error');       // エラーハンドリングテスト
   runSpecificTest('performance'); // パフォーマンステスト
   ```

### テスト内容

- **設定関連テスト**: `getConfigFromProperties()`の動作確認
- **認証URL関連テスト**: `createAuthUrl()`、`getAuthUrl()`の動作確認
- **認証状態関連テスト**: `getAuthStatus()`、`isTokenValid()`の動作確認
- **トークン関連テスト**: `getAccessToken()`、`refreshAccessToken()`の動作確認
- **API関連テスト**: `getApiHeaders()`の動作確認
- **統合テスト**: 複数関数の連携動作確認
- **モック関数テスト**: ユーティリティ関数の動作確認
- **エラーハンドリングテスト**: エラーケースの処理確認
- **パフォーマンステスト**: 実行時間の確認

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

バグ報告や機能要望は、GitHubのIssuesでお知らせください。

## 更新履歴

- v4.0.0 - セキュリティ強化
  - 設定オブジェクト方式を削除し、スクリプトプロパティ方式のみに統一
  - 認証情報をコードに記載する必要がなくなり、セキュリティが向上
  - メニューからの使用がより簡単に
- v3.0.0 - メニュー対応
  - スクリプトプロパティのみで動作する関数を追加
  - スプレッドシートなどのメニューから使用可能
  - `executeAuthorizationCodeFlowFromProperties()`等のメニュー用関数を追加
  - 設定オブジェクト方式とスクリプトプロパティ方式の両方をサポート
- v2.0.0 - 設定オブジェクト対応
  - `eBayOAuth.js`ファイルを削除
  - 設定オブジェクトを引数として渡す方式に変更
  - より柔軟な設定管理が可能に
- v1.0.0 - 初回リリース
  - 認証グラントフローの実装
  - Webアプリケーション機能
  - 基本的な認証機能 