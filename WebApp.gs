/**
 * eBay OAuth2 Webアプリケーション
 * 
 * このファイルにはeBay OAuth2認証のWebアプリケーション機能が含まれています。
 * eBayからのリダイレクトを処理し、認証を完了させます。
 */

/**
 * Webアプリケーションのエントリーポイント
 * eBay OAuth認証のリダイレクト処理を行います
 * 
 * @param {Object} e - イベントオブジェクト
 * @return {HtmlOutput} HTMLレスポンス
 */
function doGet(e) {
  try {
    // 設定オブジェクトを取得（スクリプトプロパティから）
    const config = getConfigFromProperties();
    if (!config) {
      return createErrorPage('設定が不完全です。スクリプトプロパティで必要な設定を行ってください。');
    }
    
    // クエリパラメータを取得
    const code = e.parameter.code;
    const state = e.parameter.state;
    const error = e.parameter.error;
    
    // エラーハンドリング
    if (error) {
      return createErrorPage(`認証エラー: ${error}`);
    }
    
    // 認証コードがない場合
    if (!code) {
      return createAuthPage(config);
    }
    
    // 認証コードがある場合は認証を完了
    const currentUrl = ScriptApp.getService().getUrl();
    const redirectUrl = `${currentUrl}?code=${code}&state=${state || ''}`;
    
    const success = completeAuthFromRedirect(redirectUrl, config);
    
    if (success) {
      return createSuccessPage();
    } else {
      return createErrorPage('認証の完了に失敗しました。');
    }
    
  } catch (error) {
    console.error('Webアプリケーションでエラーが発生しました:', error);
    return createErrorPage('予期しないエラーが発生しました。');
  }
}

/**
 * スクリプトプロパティから設定オブジェクトを取得する関数
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
 * 認証ページを作成する関数
 * 
 * @param {Object} config - 設定オブジェクト
 * @return {HtmlOutput} 認証ページのHTML
 */
function createAuthPage(config) {
  const authUrl = getAuthUrl(config);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>eBay OAuth2 認証</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 30px;
        }
        .auth-button {
          display: block;
          width: 100%;
          padding: 15px;
          background-color: #0066cc;
          color: white;
          text-decoration: none;
          text-align: center;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0;
        }
        .auth-button:hover {
          background-color: #0052a3;
        }
        .info {
          background-color: #e7f3ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #0066cc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>eBay OAuth2 認証</h1>
        
        <div class="info">
          <p><strong>認証が必要です</strong></p>
          <p>eBay APIを使用するために、eBayアカウントでの認証が必要です。</p>
        </div>
        
        <a href="${authUrl}" class="auth-button">
          eBayで認証する
        </a>
        
        <div class="info">
          <p><strong>注意事項:</strong></p>
          <ul>
            <li>認証後、このページにリダイレクトされます</li>
            <li>認証情報は安全に保存されます</li>
            <li>必要に応じて認証を再実行できます</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * 成功ページを作成する関数
 * 
 * @return {HtmlOutput} 成功ページのHTML
 */
function createSuccessPage() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>eBay OAuth2 認証完了</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 {
          color: #28a745;
          margin-bottom: 20px;
        }
        .success-icon {
          font-size: 48px;
          color: #28a745;
          margin-bottom: 20px;
        }
        .info {
          background-color: #d4edda;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #28a745;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0066cc;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px;
        }
        .button:hover {
          background-color: #0052a3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>認証完了</h1>
        
        <div class="info">
          <p><strong>eBay OAuth2認証が正常に完了しました！</strong></p>
          <p>これでeBay APIを使用できるようになりました。</p>
        </div>
        
        <p>認証情報は安全に保存されました。</p>
        
        <div>
          <a href="${ScriptApp.getService().getUrl()}" class="button">
            ページを再読み込み
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * エラーページを作成する関数
 * 
 * @param {string} errorMessage - エラーメッセージ
 * @return {HtmlOutput} エラーページのHTML
 */
function createErrorPage(errorMessage) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>eBay OAuth2 認証エラー</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 {
          color: #dc3545;
          margin-bottom: 20px;
        }
        .error-icon {
          font-size: 48px;
          color: #dc3545;
          margin-bottom: 20px;
        }
        .error-message {
          background-color: #f8d7da;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #dc3545;
          text-align: left;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0066cc;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px;
        }
        .button:hover {
          background-color: #0052a3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">✗</div>
        <h1>認証エラー</h1>
        
        <div class="error-message">
          <p><strong>エラーが発生しました:</strong></p>
          <p>${errorMessage}</p>
        </div>
        
        <p>認証を再試行するか、設定を確認してください。</p>
        
        <div>
          <a href="${ScriptApp.getService().getUrl()}" class="button">
            再試行
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
} 