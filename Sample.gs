/**
 * eBay OAuth2 認証ライブラリのサンプルコード
 * 
 * このファイルにはライブラリの使用例が含まれています。
 * 実際の使用前に、スクリプトプロパティに必要な設定を行ってください。
 */

/**
 * 基本的な認証のサンプル関数
 * 
 * @return {boolean} 成功/失敗
 */
function sampleBasicAuth() {
  try {
    console.log('eBay OAuth2認証を開始します...');
    
    // 認証を実行
    const success = executeAuthorizationCodeFlow();
    
    if (success) {
      console.log('認証が成功しました！');
      
      // 認証状態を確認
      const authStatus = getAuthStatus();
      console.log('認証状態:', authStatus);
      
      // アクセストークンを取得
      const accessToken = getAccessToken();
      console.log('アクセストークン:', accessToken ? '取得済み' : '取得失敗');
      
    } else {
      console.error('認証に失敗しました。');
    }
    
    return success;
    
  } catch (error) {
    console.error('サンプル実行でエラーが発生しました:', error);
    return false;
  }
}

/**
 * 認証URL取得のサンプル関数
 * 
 * @return {string|null} 認証URL
 */
function sampleGetAuthUrl() {
  try {
    console.log('認証URLを取得します...');
    
    const authUrl = getAuthUrl();
    
    if (authUrl) {
      console.log('認証URL:', authUrl);
      return authUrl;
    } else {
      console.error('認証URLの取得に失敗しました。');
      return null;
    }
    
  } catch (error) {
    console.error('認証URL取得でエラーが発生しました:', error);
    return null;
  }
}

/**
 * eBay APIリクエストのサンプル関数
 * 
 * @return {Object|null} APIレスポンス
 */
function sampleEbayApiRequest() {
  try {
    console.log('eBay APIリクエストを実行します...');
    
    // APIヘッダーを取得
    const headers = getApiHeaders();
    
    // eBay APIリクエスト（Sandbox環境）
    const response = UrlFetchApp.fetch('https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item', {
      method: 'GET',
      headers: headers
    });
    
    console.log('APIレスポンス:', response.getContentText());
    return JSON.parse(response.getContentText());
    
  } catch (error) {
    console.error('eBay APIリクエストでエラーが発生しました:', error);
    return null;
  }
}

/**
 * 手動認証のサンプル関数
 * 
 * @return {string|null} 認証URL
 */
function manualAuth() {
  try {
    console.log('手動認証用のURLを生成します...');
    
    const authUrl = getAuthUrl();
    
    if (authUrl) {
      console.log('手動認証URL:', authUrl);
      console.log('このURLにアクセスして認証を完了してください。');
      return authUrl;
    } else {
      console.error('認証URLの生成に失敗しました。');
      return null;
    }
    
  } catch (error) {
    console.error('手動認証URL生成でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 設定確認のサンプル関数
 * 
 * @return {Object} 設定状態の情報
 */
function sampleValidateConfig() {
  try {
    console.log('設定を確認します...');
    
    const scriptProperties = PropertiesService.getScriptProperties();
    
    const requiredProperties = [
      'EBAY_CLIENT_ID',
      'EBAY_CLIENT_SECRET', 
      'EBAY_REDIRECT_URI',
      'EBAY_SCOPE'
    ];
    
    const configStatus = {};
    let allValid = true;
    
    for (const prop of requiredProperties) {
      const value = scriptProperties.getProperty(prop);
      configStatus[prop] = {
        exists: !!value,
        value: value ? '***' : null
      };
      
      if (!value) {
        allValid = false;
      }
    }
    
    // オプション設定も確認
    const optionalProperties = [
      'EBAY_AUTH_URL',
      'EBAY_TOKEN_URL',
      'EBAY_RESPONSE_TYPE'
    ];
    
    for (const prop of optionalProperties) {
      const value = scriptProperties.getProperty(prop);
      configStatus[prop] = {
        exists: !!value,
        value: value || 'デフォルト値使用'
      };
    }
    
    configStatus.isValid = allValid;
    
    console.log('設定状態:', configStatus);
    return configStatus;
    
  } catch (error) {
    console.error('設定確認でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 認証状態確認のサンプル関数
 * 
 * @return {Object} 認証状態の情報
 */
function sampleCheckAuthStatus() {
  try {
    console.log('認証状態を確認します...');
    
    const authStatus = getAuthStatus();
    console.log('認証状態:', authStatus);
    
    return authStatus;
    
  } catch (error) {
    console.error('認証状態確認でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 認証データクリアのサンプル関数
 * 
 * @return {boolean} 成功/失敗
 */
function sampleClearAuthData() {
  try {
    console.log('認証データをクリアします...');
    
    const success = clearAuthData();
    
    if (success) {
      console.log('認証データのクリアが完了しました。');
    } else {
      console.error('認証データのクリアに失敗しました。');
    }
    
    return success;
    
  } catch (error) {
    console.error('認証データクリアでエラーが発生しました:', error);
    return false;
  }
}

/**
 * 全体的なテストを実行する関数
 * 
 * @return {Object} テスト結果
 */
function runAllTests() {
  try {
    console.log('全体的なテストを開始します...');
    
    const results = {
      configValidation: null,
      authStatus: null,
      basicAuth: null,
      apiRequest: null
    };
    
    // 設定確認
    console.log('1. 設定確認...');
    results.configValidation = sampleValidateConfig();
    
    // 認証状態確認
    console.log('2. 認証状態確認...');
    results.authStatus = sampleCheckAuthStatus();
    
    // 基本認証
    console.log('3. 基本認証...');
    results.basicAuth = sampleBasicAuth();
    
    // APIリクエスト
    console.log('4. APIリクエスト...');
    results.apiRequest = sampleEbayApiRequest();
    
    console.log('テスト結果:', results);
    return results;
    
  } catch (error) {
    console.error('全体的なテストでエラーが発生しました:', error);
    return null;
  }
} 