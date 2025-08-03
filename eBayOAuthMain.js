/**
 * eBay OAuth2 認証メイン関数
 * 
 * このファイルにはeBay API OAuth2認証のメイン関数が含まれています。
 * 認証関数を実行するだけで認証された状態を作るためのエントリーポイントです。
 */

/**
 * eBay OAuth2 認証メイン関数
 * 
 * このファイルにはeBay API OAuth2認証のメイン関数が含まれています。
 * 認証関数を実行するだけで認証された状態を作るためのエントリーポイントです。
 */

/**
 * 現在の認証状態を確認する関数
 * 
 * @return {Object} 認証状態の情報
 */
function getAuthStatus() {
  const accessToken = PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
  const refreshToken = PropertiesService.getScriptProperties().getProperty('EBAY_REFRESH_TOKEN');
  const expiresAt = PropertiesService.getScriptProperties().getProperty('EBAY_TOKEN_EXPIRES_AT');
  const isTokenValidFlag = isTokenValid();
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    isTokenValid: isTokenValidFlag,
    expiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : null
  };
}

/**
 * 認証情報をクリアする関数
 * 
 * @return {boolean} 成功/失敗
 */
function clearAuthData() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    
    // 認証関連のプロパティを削除
    const authProperties = [
      'EBAY_ACCESS_TOKEN',
      'EBAY_REFRESH_TOKEN',
      'EBAY_TOKEN_EXPIRES_AT',
      'EBAY_AUTH_CODE'
    ];
    
    for (const property of authProperties) {
      scriptProperties.deleteProperty(property);
    }
    
    console.log('認証データがクリアされました。');
    return true;
    
  } catch (error) {
    console.error('認証データのクリアでエラーが発生しました:', error);
    return false;
  }
}

/**
 * 認証URLを取得する関数（手動認証用）
 * 
 * @param {Object} config - 設定オブジェクト
 * @return {string} 認証URL
 */
function getAuthUrl(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('設定オブジェクトが必要です');
  }
  
  if (!config.clientId || !config.redirectUri || !config.scope) {
    throw new Error('必須パラメータ（clientId、redirectUri、scope）が不足しています');
  }
  
  return createAuthUrl(config);
}

/**
 * リダイレクトURLから認証を完了する関数（Webアプリ用）
 * 
 * @param {string} redirectUrl - eBayからリダイレクトされたURL
 * @param {Object} config - 設定オブジェクト
 * @return {boolean} 成功/失敗
 */
function completeAuthFromRedirect(redirectUrl, config) {
  try {
    const refreshToken = getRefreshTokenFromRedirectUrl(redirectUrl, config);
    if (refreshToken) {
      console.log('リダイレクトURLからの認証が完了しました。');
      return true;
    } else {
      console.error('リダイレクトURLからの認証に失敗しました。');
      return false;
    }
  } catch (error) {
    console.error('リダイレクトURLからの認証でエラーが発生しました:', error);
    return false;
  }
}

/**
 * アクセストークンを取得する関数
 * 
 * @param {Object} config - 設定オブジェクト（リフレッシュ時に必要）
 * @return {string|null} アクセストークン
 */
function getAccessToken(config = null) {
  if (isTokenValid()) {
    return PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
  } else {
    // トークンが無効な場合は更新を試行
    if (config && refreshAccessToken(config)) {
      return PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
    }
    return null;
  }
}

/**
 * eBay APIリクエスト用のヘッダーを取得する関数
 * 
 * @param {Object} config - 設定オブジェクト（リフレッシュ時に必要）
 * @return {Object} APIリクエスト用のヘッダー
 */
function getApiHeaders(config = null) {
  const accessToken = getAccessToken(config);
  if (!accessToken) {
    throw new Error('有効なアクセストークンがありません。認証を実行してください。');
  }
  
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
} 