/**
 * eBay OAuth2 認証グラントフロー（Authorization Code Flow）
 * 
 * このファイルにはeBay API OAuth2認証の認証グラントフローが実装されています。
 * 認証URLの作成、トークンの取得、リフレッシュトークンの処理などが含まれています。
 */

/**
 * 認証用URLを作成する関数
 * 
 * @param {Object} config - 設定オブジェクト
 * @param {string} config.clientId - クライアントID
 * @param {string} config.clientSecret - クライアントシークレット
 * @param {string} config.redirectUri - リダイレクトURI
 * @param {string} config.scope - スコープ
 * @param {string} config.authUrl - 認証URL（デフォルト: https://auth.ebay.com/oauth2/authorize）
 * @param {string} config.responseType - レスポンスタイプ（デフォルト: code）
 * @param {string} config.state - 状態パラメータ（オプション、自動生成される）
 * @return {string} 認証URL
 */
function createAuthUrl(config) {
  // 引数がオブジェクトでない場合はエラー
  if (typeof config !== 'object') {
    throw new Error('引数はオブジェクトである必要があります');
  }
  
  // 必須パラメータの検証
  if (!config.clientId || !config.redirectUri || !config.scope) {
    throw new Error('必須パラメータ（clientId、redirectUri、scope）が不足しています');
  }
  
  // デフォルト値を設定
  const clientId = config.clientId;
  const redirectUri = config.redirectUri;
  const scope = config.scope;
  const state = config.state || generateRandomState();
  const responseType = config.responseType || 'code';
  const authUrl = config.authUrl || 'https://auth.ebay.com/oauth2/authorize';
  
  // URLパラメータを構築
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    response_type: responseType,
    state: state
  });
  
  // 認証URLを生成
  const authUrlWithParams = `${authUrl}?${params.toString()}`;
  
  console.log('認証URLが作成されました:', authUrlWithParams);
  return authUrlWithParams;
}

/**
 * ランダムな状態パラメータを生成する関数
 * 
 * @return {string} ランダムな状態文字列
 */
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 認証URLにアクセスしてトークンをスクリプトプロパティに保存する関数
 * 
 * @param {string} authUrl - 認証URL
 * @param {Object} config - 設定オブジェクト
 * @return {boolean} 成功/失敗
 */
function authenticateWithUrl(authUrl, config) {
  // URLがeBay OAuth用のURLでない場合はエラー
  if (!authUrl || !authUrl.includes('auth.ebay.com/oauth2/authorize')) {
    throw new Error('無効なeBay OAuth認証URLです');
  }
  
  try {
    // 認証URLにアクセスして認証コードを取得
    const response = UrlFetchApp.fetch(authUrl, {
      method: 'GET',
      followRedirects: false
    });
    
    const responseCode = response.getResponseCode();
    
    if (responseCode === 302) {
      // リダイレクトURLから認証コードを取得
      const location = response.getHeaders()['Location'];
      if (location) {
        const authCode = extractAuthCodeFromUrl(location);
        if (authCode) {
          // 認証コードを保存
          PropertiesService.getScriptProperties().setProperty('EBAY_AUTH_CODE', authCode);
          
          // アクセストークンを取得
          return exchangeCodeForToken(authCode, config);
        }
      }
    }
    
    console.error('認証URLからのレスポンスが予期しない形式です');
    return false;
    
  } catch (error) {
    console.error('認証URLへのアクセスでエラーが発生しました:', error);
    return false;
  }
}

/**
 * URLから認証コードを抽出する関数
 * 
 * @param {string} url - リダイレクトURL
 * @return {string|null} 認証コード
 */
function extractAuthCodeFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    return code;
  } catch (error) {
    console.error('URLからの認証コード抽出でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 認証コードをアクセストークンと交換する関数
 * 
 * @param {string} authCode - 認証コード
 * @param {Object} config - 設定オブジェクト
 * @return {boolean} 成功/失敗
 */
function exchangeCodeForToken(authCode, config) {
  try {
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const redirectUri = config.redirectUri;
    const tokenUrl = config.tokenUrl || 'https://api.ebay.com/identity/v1/oauth2/token';
    
    // トークンリクエストのパラメータ
    const payload = {
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri
    };
    
    // Basic認証のヘッダーを作成
    const credentials = Utilities.base64Encode(`${clientId}:${clientSecret}`);
    
    const response = UrlFetchApp.fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: new URLSearchParams(payload).toString()
    });
    
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    if (responseCode === 200) {
      const tokenData = JSON.parse(responseBody);
      
      // トークンをスクリプトプロパティに保存
      PropertiesService.getScriptProperties().setProperty('EBAY_ACCESS_TOKEN', tokenData.access_token);
      PropertiesService.getScriptProperties().setProperty('EBAY_REFRESH_TOKEN', tokenData.refresh_token);
      
      // トークンの有効期限を計算して保存
      const expiresAt = new Date().getTime() + (tokenData.expires_in * 1000);
      PropertiesService.getScriptProperties().setProperty('EBAY_TOKEN_EXPIRES_AT', expiresAt.toString());
      
      console.log('トークンの取得と保存が完了しました');
      return true;
    } else {
      console.error('トークン取得でエラーが発生しました:', responseCode, responseBody);
      return false;
    }
    
  } catch (error) {
    console.error('トークン交換でエラーが発生しました:', error);
    return false;
  }
}

/**
 * リフレッシュトークンを使用してアクセストークンを更新する関数
 * 
 * @param {Object} config - 設定オブジェクト
 * @return {boolean} 成功/失敗
 */
function refreshAccessToken(config) {
  try {
    const refreshToken = PropertiesService.getScriptProperties().getProperty('EBAY_REFRESH_TOKEN');
    if (!refreshToken) {
      console.error('リフレッシュトークンが保存されていません');
      return false;
    }
    
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const tokenUrl = config.tokenUrl || 'https://api.ebay.com/identity/v1/oauth2/token';
    
    // リフレッシュトークンリクエストのパラメータ
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    
    // Basic認証のヘッダーを作成
    const credentials = Utilities.base64Encode(`${clientId}:${clientSecret}`);
    
    const response = UrlFetchApp.fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: new URLSearchParams(payload).toString()
    });
    
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    if (responseCode === 200) {
      const tokenData = JSON.parse(responseBody);
      
      // 新しいトークンをスクリプトプロパティに保存
      PropertiesService.getScriptProperties().setProperty('EBAY_ACCESS_TOKEN', tokenData.access_token);
      
      // 新しいリフレッシュトークンがある場合は保存
      if (tokenData.refresh_token) {
        PropertiesService.getScriptProperties().setProperty('EBAY_REFRESH_TOKEN', tokenData.refresh_token);
      }
      
      // トークンの有効期限を更新
      const expiresAt = new Date().getTime() + (tokenData.expires_in * 1000);
      PropertiesService.getScriptProperties().setProperty('EBAY_TOKEN_EXPIRES_AT', expiresAt.toString());
      
      console.log('アクセストークンの更新が完了しました');
      return true;
    } else {
      console.error('トークン更新でエラーが発生しました:', responseCode, responseBody);
      return false;
    }
    
  } catch (error) {
    console.error('トークン更新でエラーが発生しました:', error);
    return false;
  }
}

/**
 * 現在のアクセストークンが有効かどうかをチェックする関数
 * 
 * @return {boolean} トークンが有効かどうか
 */
function isTokenValid() {
  const accessToken = PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
  const expiresAt = PropertiesService.getScriptProperties().getProperty('EBAY_TOKEN_EXPIRES_AT');
  
  if (!accessToken || !expiresAt) {
    return false;
  }
  
  const currentTime = new Date().getTime();
  const tokenExpiresAt = parseInt(expiresAt);
  
  // 5分のマージンを設けてチェック
  return currentTime < (tokenExpiresAt - 300000);
}

/**
 * リダイレクトURLからリフレッシュトークンを取得する関数
 * 
 * @param {string} redirectUrl - eBayからリダイレクトされたURL
 * @param {Object} config - 設定オブジェクト
 * @return {string|null} リフレッシュトークン
 */
function getRefreshTokenFromRedirectUrl(redirectUrl, config) {
  try {
    const authCode = extractAuthCodeFromUrl(redirectUrl);
    if (!authCode) {
      console.error('リダイレクトURLから認証コードを取得できませんでした');
      return null;
    }
    
    // 認証コードを保存
    PropertiesService.getScriptProperties().setProperty('EBAY_AUTH_CODE', authCode);
    
    // アクセストークンを取得
    const success = exchangeCodeForToken(authCode, config);
    if (success) {
      return PropertiesService.getScriptProperties().getProperty('EBAY_REFRESH_TOKEN');
    }
    
    return null;
    
  } catch (error) {
    console.error('リダイレクトURLからのトークン取得でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 認証グラントフローを実行する関数
 * 
 * @param {Object} config - 設定オブジェクト
 * @param {string} config.clientId - クライアントID
 * @param {string} config.clientSecret - クライアントシークレット
 * @param {string} config.redirectUri - リダイレクトURI
 * @param {string} config.scope - スコープ
 * @param {string} config.authUrl - 認証URL（デフォルト: https://auth.ebay.com/oauth2/authorize）
 * @param {string} config.tokenUrl - トークンURL（デフォルト: https://api.ebay.com/identity/v1/oauth2/token）
 * @param {string} config.responseType - レスポンスタイプ（デフォルト: code）
 * @return {boolean} 成功/失敗
 */
function executeAuthorizationCodeFlow(config) {
  try {
    // 設定の検証
    if (!config || typeof config !== 'object') {
      throw new Error('設定オブジェクトが必要です');
    }
    
    if (!config.clientId || !config.clientSecret || !config.redirectUri || !config.scope) {
      throw new Error('必須パラメータ（clientId、clientSecret、redirectUri、scope）が不足しています');
    }
    
    // 既に有効なトークンがある場合は何もしない
    if (isTokenValid()) {
      console.log('既に有効なアクセストークンが存在します');
      return true;
    }
    
    // リフレッシュトークンがある場合はトークンを更新
    const refreshToken = PropertiesService.getScriptProperties().getProperty('EBAY_REFRESH_TOKEN');
    if (refreshToken) {
      console.log('リフレッシュトークンを使用してトークンを更新します');
      if (refreshAccessToken(config)) {
        return true;
      }
    }
    
    // 認証URLを作成
    const authUrl = createAuthUrl(config);
    
    // 認証URLにアクセスしてトークンを取得
    return authenticateWithUrl(authUrl, config);
    
  } catch (error) {
    console.error('認証グラントフローの実行でエラーが発生しました:', error);
    return false;
  }
} 