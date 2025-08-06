/**
 * eBay OAuth2 認証グラントフロー（Authorization Code Flow）
 * 
 * このファイルにはeBay API OAuth2認証の認証グラントフローが実装されています。
 * 認証URLの作成、トークンの取得、リフレッシュトークンの処理などが含まれています。
 */

/**
 * スクリプトプロパティから設定を取得する関数
 * 
 * @return {Object|null} 設定オブジェクト
 */
function getConfigFromProperties() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    
    const clientId = scriptProperties.getProperty('EBAY_CLIENT_ID');
    const clientSecret = scriptProperties.getProperty('EBAY_CLIENT_SECRET');
    const redirectUri = scriptProperties.getProperty('EBAY_REDIRECT_URI');
    const scope = scriptProperties.getProperty('EBAY_SCOPE');
    
    if (!clientId || !clientSecret || !redirectUri || !scope) {
      return null;
    }
    
    return {
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUri,
      scope: scope,
      authUrl: scriptProperties.getProperty('EBAY_AUTH_URL') || 'https://auth.ebay.com/oauth2/authorize',
      tokenUrl: scriptProperties.getProperty('EBAY_TOKEN_URL') || 'https://api.ebay.com/identity/v1/oauth2/token',
      responseType: scriptProperties.getProperty('EBAY_RESPONSE_TYPE') || 'code'
    };
    
  } catch (error) {
    console.error('設定の取得でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 認証用URLを作成する関数
 * 
 * @return {string|null} 認証URL
 */
function createAuthUrl() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return null;
    }
    
    // 必須パラメータの検証
    if (!config.clientId || !config.redirectUri || !config.scope) {
      throw new Error('必須パラメータ（clientId、redirectUri、scope）が不足しています');
    }
    
    // デフォルト値を設定
    const clientId = config.clientId;
    const redirectUri = config.redirectUri;
    const scope = config.scope;
    const state = generateRandomState();
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
    
  } catch (error) {
    console.error('認証URLの作成でエラーが発生しました:', error);
    return null;
  }
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
 * @return {boolean} 成功/失敗
 */
function authenticateWithUrl(authUrl) {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return false;
    }
    
    // URLがeBay OAuth用のURLでない場合はエラー
    if (!authUrl || !authUrl.includes('auth.ebay.com/oauth2/authorize')) {
      throw new Error('無効なeBay OAuth認証URLです');
    }
    
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
          return exchangeCodeForToken(authCode);
        }
      }
    }
    
    console.error('認証URLへのアクセスでエラーが発生しました');
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
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('code');
  } catch (error) {
    console.error('URLからの認証コード抽出でエラーが発生しました:', error);
    return null;
  }
}

/**
 * 認証コードをアクセストークンと交換する関数
 * 
 * @param {string} authCode - 認証コード
 * @return {boolean} 成功/失敗
 */
function exchangeCodeForToken(authCode) {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return false;
    }
    
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const redirectUri = config.redirectUri;
    const tokenUrl = config.tokenUrl || 'https://api.ebay.com/identity/v1/oauth2/token';
    
    // Basic認証用のヘッダーを作成
    const credentials = Utilities.base64Encode(`${clientId}:${clientSecret}`);
    
    // リクエストボディを作成
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri
    });
    
    // トークンエンドポイントにリクエスト
    const response = UrlFetchApp.fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      payload: requestBody.toString()
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      const tokenData = JSON.parse(responseText);
      
      // トークンをスクリプトプロパティに保存
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('EBAY_ACCESS_TOKEN', tokenData.access_token);
      scriptProperties.setProperty('EBAY_REFRESH_TOKEN', tokenData.refresh_token);
      
      // 有効期限を計算して保存
      const expiresIn = tokenData.expires_in || 7200; // デフォルト2時間
      const expiresAt = new Date().getTime() + (expiresIn * 1000);
      scriptProperties.setProperty('EBAY_TOKEN_EXPIRES_AT', expiresAt.toString());
      
      console.log('アクセストークンの取得が完了しました');
      return true;
      
    } else {
      console.error('トークン取得でエラーが発生しました:', responseCode, responseText);
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
 * @return {boolean} 成功/失敗
 */
function refreshAccessToken() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return false;
    }
    
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const tokenUrl = config.tokenUrl || 'https://api.ebay.com/identity/v1/oauth2/token';
    
    // リフレッシュトークンを取得
    const refreshToken = PropertiesService.getScriptProperties().getProperty('EBAY_REFRESH_TOKEN');
    if (!refreshToken) {
      console.error('リフレッシュトークンが存在しません');
      return false;
    }
    
    // Basic認証用のヘッダーを作成
    const credentials = Utilities.base64Encode(`${clientId}:${clientSecret}`);
    
    // リクエストボディを作成
    const requestBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    
    // トークンエンドポイントにリクエスト
    const response = UrlFetchApp.fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      payload: requestBody.toString()
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      const tokenData = JSON.parse(responseText);
      
      // トークンをスクリプトプロパティに保存
      const scriptProperties = PropertiesService.getScriptProperties();
      scriptProperties.setProperty('EBAY_ACCESS_TOKEN', tokenData.access_token);
      
      // 新しいリフレッシュトークンがある場合は保存
      if (tokenData.refresh_token) {
        scriptProperties.setProperty('EBAY_REFRESH_TOKEN', tokenData.refresh_token);
      }
      
      // 有効期限を計算して保存
      const expiresIn = tokenData.expires_in || 7200; // デフォルト2時間
      const expiresAt = new Date().getTime() + (expiresIn * 1000);
      scriptProperties.setProperty('EBAY_TOKEN_EXPIRES_AT', expiresAt.toString());
      
      console.log('アクセストークンの更新が完了しました');
      return true;
      
    } else {
      console.error('トークン更新でエラーが発生しました:', responseCode, responseText);
      return false;
    }
    
  } catch (error) {
    console.error('トークン更新でエラーが発生しました:', error);
    return false;
  }
}

/**
 * トークンが有効かどうかを確認する関数
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
 * @return {string|null} リフレッシュトークン
 */
function getRefreshTokenFromRedirectUrl(redirectUrl) {
  try {
    const authCode = extractAuthCodeFromUrl(redirectUrl);
    if (!authCode) {
      console.error('リダイレクトURLから認証コードを取得できませんでした');
      return null;
    }
    
    // 認証コードを保存
    PropertiesService.getScriptProperties().setProperty('EBAY_AUTH_CODE', authCode);
    
    // アクセストークンを取得
    const success = exchangeCodeForToken(authCode);
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
 * @return {boolean} 成功/失敗
 */
function executeAuthorizationCodeFlow() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      console.error('必要な設定: EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_REDIRECT_URI, EBAY_SCOPE');
      return false;
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
      if (refreshAccessToken()) {
        return true;
      }
    }
    
    // 認証URLを作成
    const authUrl = createAuthUrl();
    if (!authUrl) {
      console.error('認証URLの作成に失敗しました');
      return false;
    }
    
    // 認証URLにアクセスしてトークンを取得
    return authenticateWithUrl(authUrl);
    
  } catch (error) {
    console.error('認証グラントフローの実行でエラーが発生しました:', error);
    return false;
  }
} 

/**
 * スクリプトプロパティのみで認証URLを取得する関数（メニュー用）
 * 
 * @return {string|null} 認証URL
 */
function getAuthUrlFromProperties() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return null;
    }
    
    // 認証URLを取得
    return createAuthUrl();
    
  } catch (error) {
    console.error('認証URLの取得でエラーが発生しました:', error);
    return null;
  }
}

/**
 * スクリプトプロパティのみでリダイレクトURLから認証を完了する関数（メニュー用）
 * 
 * @param {string} redirectUrl - eBayからリダイレクトされたURL
 * @return {boolean} 成功/失敗
 */
function completeAuthFromRedirectWithProperties(redirectUrl) {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return false;
    }
    
    // リダイレクトURLから認証を完了
    return getRefreshTokenFromRedirectUrl(redirectUrl);
    
  } catch (error) {
    console.error('リダイレクトURLからの認証完了でエラーが発生しました:', error);
    return false;
  }
}

/**
 * スクリプトプロパティのみでアクセストークンを取得する関数（メニュー用）
 * 
 * @return {string|null} アクセストークン
 */
function getAccessTokenFromProperties() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return null;
    }
    
    // アクセストークンを取得
    return PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
    
  } catch (error) {
    console.error('アクセストークンの取得でエラーが発生しました:', error);
    return null;
  }
}

/**
 * スクリプトプロパティのみでAPIヘッダーを取得する関数（メニュー用）
 * 
 * @return {Object|null} APIリクエスト用のヘッダー
 */
function getApiHeadersFromProperties() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return null;
    }
    
    // APIヘッダーを取得
    const accessToken = PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('アクセストークンが保存されていません');
      return null;
    }

    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
  } catch (error) {
    console.error('APIヘッダーの取得でエラーが発生しました:', error);
    return null;
  }
} 