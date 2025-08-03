/**
 * eBay OAuth2 認証ライブラリ サンプルコード
 * 
 * このファイルにはeBay OAuth2認証ライブラリの使用例が含まれています。
 * 実際の使用時に参考にしてください。
 */

/**
 * 基本的な認証の実行例
 * 
 * この関数を実行すると、eBay OAuth2認証が実行されます。
 * 認証が成功すると、アクセストークンがスクリプトプロパティに保存されます。
 */
function sampleBasicAuth() {
  try {
    console.log('eBay OAuth2認証を開始します...');
    
    // 設定オブジェクトを作成
    const config = {
      clientId: 'YOUR_CLIENT_ID_HERE',
      clientSecret: 'YOUR_CLIENT_SECRET_HERE',
      redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
    };
    
    // 認証を実行
    const success = executeAuthorizationCodeFlow(config);
    
    if (success) {
      console.log('認証が成功しました！');
      
      // 認証状態を確認
      const authStatus = getAuthStatus();
      console.log('認証状態:', authStatus);
      
      // アクセストークンを取得
      const accessToken = getAccessToken(config);
      console.log('アクセストークン:', accessToken ? '取得済み' : '取得失敗');
      
    } else {
      console.error('認証に失敗しました。');
    }
    
  } catch (error) {
    console.error('サンプル実行でエラーが発生しました:', error);
  }
}

/**
 * 認証URLを取得する例
 * 
 * 手動で認証URLを取得して、ブラウザで認証を行う場合の例です。
 */
function sampleGetAuthUrl() {
  try {
    // 設定オブジェクトを作成
    const config = {
      clientId: 'YOUR_CLIENT_ID_HERE',
      clientSecret: 'YOUR_CLIENT_SECRET_HERE',
      redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
    };
    
    // 認証URLを取得
    const authUrl = getAuthUrl(config);
    console.log('認証URL:', authUrl);
    
    // カスタム設定で認証URLを取得
    const customConfig = {
      clientId: 'YOUR_CUSTOM_CLIENT_ID',
      clientSecret: 'YOUR_CUSTOM_CLIENT_SECRET',
      redirectUri: 'YOUR_CUSTOM_REDIRECT_URI',
      scope: 'https://api.ebay.com/oauth/api_scope'
    };
    const customAuthUrl = getAuthUrl(customConfig);
    console.log('カスタム認証URL:', customAuthUrl);
    
  } catch (error) {
    console.error('認証URL取得でエラーが発生しました:', error);
  }
}

/**
 * 認証状態を確認する例
 */
function sampleCheckAuthStatus() {
  try {
    const authStatus = getAuthStatus();
    
    console.log('=== 認証状態 ===');
    console.log('アクセストークン有無:', authStatus.hasAccessToken);
    console.log('リフレッシュトークン有無:', authStatus.hasRefreshToken);
    console.log('トークン有効性:', authStatus.isTokenValid);
    console.log('有効期限:', authStatus.expiresAt);
    
    if (authStatus.isTokenValid) {
      console.log('✅ 認証済み - eBay APIが使用可能です');
    } else {
      console.log('❌ 未認証またはトークン期限切れ - 認証が必要です');
    }
    
  } catch (error) {
    console.error('認証状態確認でエラーが発生しました:', error);
  }
}

/**
 * eBay APIリクエストの例
 * 
 * 認証後にeBay APIを呼び出す例です。
 */
function sampleEbayApiRequest() {
  try {
    // 設定オブジェクトを作成
    const config = {
      clientId: 'YOUR_CLIENT_ID_HERE',
      clientSecret: 'YOUR_CLIENT_SECRET_HERE',
      redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
    };
    
    // 認証状態を確認
    if (!isTokenValid()) {
      console.log('認証が必要です。認証を実行します...');
      const authSuccess = executeAuthorizationCodeFlow(config);
      if (!authSuccess) {
        console.error('認証に失敗しました。');
        return;
      }
    }
    
    // APIヘッダーを取得
    const headers = getApiHeaders(config);
    console.log('APIヘッダー:', headers);
    
    // eBay APIリクエストの例（実際のエンドポイントは要確認）
    const apiUrl = 'https://api.ebay.com/sell/inventory/v1/inventory_item';
    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });
    
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    console.log('APIレスポンスコード:', responseCode);
    console.log('APIレスポンス:', responseBody);
    
  } catch (error) {
    console.error('APIリクエストでエラーが発生しました:', error);
  }
}

/**
 * 認証データをクリアする例
 */
function sampleClearAuthData() {
  try {
    console.log('認証データをクリアします...');
    
    const success = clearAuthData();
    
    if (success) {
      console.log('✅ 認証データが正常にクリアされました');
    } else {
      console.error('❌ 認証データのクリアに失敗しました');
    }
    
  } catch (error) {
    console.error('認証データクリアでエラーが発生しました:', error);
  }
}

/**
 * 設定を確認する例
 */
function sampleValidateConfig() {
  try {
    console.log('設定を確認します...');
    
    // スクリプトプロパティから設定を取得
    const scriptProperties = PropertiesService.getScriptProperties();
    
    const clientId = scriptProperties.getProperty('EBAY_CLIENT_ID');
    const clientSecret = scriptProperties.getProperty('EBAY_CLIENT_SECRET');
    const redirectUri = scriptProperties.getProperty('EBAY_REDIRECT_URI');
    const scope = scriptProperties.getProperty('EBAY_SCOPE');
    
    const hasRequiredConfig = clientId && clientSecret && redirectUri && scope;
    
    if (hasRequiredConfig) {
      console.log('✅ 設定が正常です');
      
      // 設定値を表示（セキュリティのため一部マスク）
      console.log('CLIENT_ID:', clientId ? `${clientId.substring(0, 8)}...` : '未設定');
      console.log('CLIENT_SECRET:', clientSecret ? '設定済み' : '未設定');
      console.log('REDIRECT_URI:', redirectUri || '未設定');
      console.log('SCOPE:', scope || '未設定');
      
    } else {
      console.error('❌ 設定が不完全です');
      console.log('スクリプトプロパティで必要な設定を行ってください。');
      console.log('必要な設定項目:');
      console.log('- EBAY_CLIENT_ID');
      console.log('- EBAY_CLIENT_SECRET');
      console.log('- EBAY_REDIRECT_URI');
      console.log('- EBAY_SCOPE');
    }
    
  } catch (error) {
    console.error('設定確認でエラーが発生しました:', error);
  }
}

/**
 * 全体的なテスト実行例
 */
function runAllTests() {
  console.log('=== eBay OAuth2 認証ライブラリ テスト開始 ===');
  
  // 設定確認
  sampleValidateConfig();
  console.log('');
  
  // 認証状態確認
  sampleCheckAuthStatus();
  console.log('');
  
  // 認証実行
  sampleBasicAuth();
  console.log('');
  
  // 認証状態再確認
  sampleCheckAuthStatus();
  console.log('');
  
  console.log('=== テスト完了 ===');
}

/**
 * 手動認証用の関数
 * 
 * この関数を実行すると、認証URLが生成され、ログに出力されます。
 * 出力されたURLをブラウザで開いて認証を完了してください。
 */
function manualAuth() {
  try {
    console.log('手動認証用のURLを生成します...');
    
    // 設定オブジェクトを作成
    const config = {
      clientId: 'YOUR_CLIENT_ID_HERE',
      clientSecret: 'YOUR_CLIENT_SECRET_HERE',
      redirectUri: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
      scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment'
    };
    
    const authUrl = getAuthUrl(config);
    
    console.log('=== 認証URL ===');
    console.log(authUrl);
    console.log('=== 使用方法 ===');
    console.log('1. 上記のURLをブラウザで開いてください');
    console.log('2. eBayアカウントでログインしてください');
    console.log('3. 認証を許可してください');
    console.log('4. リダイレクトされたURLのcodeパラメータをコピーしてください');
    console.log('5. completeAuthFromRedirect関数で認証を完了してください');
    
  } catch (error) {
    console.error('手動認証URL生成でエラーが発生しました:', error);
  }
} 