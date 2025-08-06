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
 * @return {string|null} 認証URL
 */
function getAuthUrl() {
  try {
    // スクリプトプロパティから設定を取得
    const config = getConfigFromProperties();
    
    if (!config) {
      console.error('スクリプトプロパティに必要な設定が不足しています');
      return null;
    }
    
    return createAuthUrl();
    
  } catch (error) {
    console.error('認証URLの取得でエラーが発生しました:', error);
    return null;
  }
}

/**
 * リダイレクトURLから認証を完了する関数（Webアプリ用）
 * 
 * @param {string} redirectUrl - eBayからリダイレクトされたURL
 * @return {boolean} 成功/失敗
 */
function completeAuthFromRedirect(redirectUrl) {
  try {
    const refreshToken = getRefreshTokenFromRedirectUrl(redirectUrl);
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
 * @return {string|null} アクセストークン
 */
function getAccessToken() {
  if (isTokenValid()) {
    return PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
  } else {
    // トークンが無効な場合は更新を試行
    if (refreshAccessToken()) {
      return PropertiesService.getScriptProperties().getProperty('EBAY_ACCESS_TOKEN');
    }
    return null;
  }
}

/**
 * eBay APIリクエスト用のヘッダーを取得する関数
 * 
 * @return {Object} APIリクエスト用のヘッダー
 */
function getApiHeaders() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('有効なアクセストークンがありません。認証を実行してください。');
  }
  
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
} 