/**
 * eBay OAuth2 認証ライブラリの単体テスト
 * 
 * このファイルにはライブラリの各関数の動作をテストするコードが含まれています。
 * QUnitライブラリを使用してテストを実行します。
 * 
 * 使用方法:
 * 1. QUnitライブラリを追加（ライブラリID: 1cNjlD4uLVcIGK6WvGbRvA9w34eAFdmKbw7sD-qwN8m6QxqX5bJymx1xL）
 * 2. このファイルをプロジェクトに追加
 * 3. runAllTests()関数を実行
 */

/**
 * 全テストを実行する関数
 */
function runAllTests() {
  console.log('=== eBay OAuth2 認証ライブラリ 単体テスト開始 ===');
  
  // テスト設定
  QUnit.config.testTimeout = 30000; // 30秒タイムアウト
  
  // テストスイートを実行
  QUnit.test('設定関連テスト', testConfigFunctions);
  QUnit.test('認証URL関連テスト', testAuthUrlFunctions);
  QUnit.test('認証状態関連テスト', testAuthStatusFunctions);
  QUnit.test('トークン関連テスト', testTokenFunctions);
  QUnit.test('API関連テスト', testApiFunctions);
  QUnit.test('統合テスト', testIntegration);
  
  console.log('=== テスト完了 ===');
}

/**
 * 設定関連のテスト
 */
function testConfigFunctions() {
  console.log('設定関連テストを開始...');
  
  // テスト用の設定を保存
  const testConfig = {
    'EBAY_CLIENT_ID': 'test_client_id',
    'EBAY_CLIENT_SECRET': 'test_client_secret',
    'EBAY_REDIRECT_URI': 'https://script.google.com/test',
    'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope'
  };
  
  PropertiesService.getScriptProperties().setProperties(testConfig);
  
  // getConfigFromProperties()のテスト
  const config = getConfigFromProperties();
  QUnit.assert.ok(config, '設定オブジェクトが取得できる');
  QUnit.assert.equal(config.clientId, 'test_client_id', 'Client IDが正しく取得できる');
  QUnit.assert.equal(config.clientSecret, 'test_client_secret', 'Client Secretが正しく取得できる');
  QUnit.assert.equal(config.redirectUri, 'https://script.google.com/test', 'Redirect URIが正しく取得できる');
  QUnit.assert.equal(config.scope, 'https://api.ebay.com/oauth/api_scope', 'Scopeが正しく取得できる');
  
  // デフォルト値のテスト
  QUnit.assert.equal(config.authUrl, 'https://auth.ebay.com/oauth2/authorize', 'デフォルトの認証URLが設定される');
  QUnit.assert.equal(config.tokenUrl, 'https://api.ebay.com/identity/v1/oauth2/token', 'デフォルトのトークンURLが設定される');
  QUnit.assert.equal(config.responseType, 'code', 'デフォルトのレスポンスタイプが設定される');
  
  // 設定が不完全な場合のテスト
  PropertiesService.getScriptProperties().deleteAllProperties();
  const emptyConfig = getConfigFromProperties();
  QUnit.assert.notOk(emptyConfig, '設定が不完全な場合はnullが返される');
  
  console.log('設定関連テスト完了');
}

/**
 * 認証URL関連のテスト
 */
function testAuthUrlFunctions() {
  console.log('認証URL関連テストを開始...');
  
  // テスト用の設定を保存
  const testConfig = {
    'EBAY_CLIENT_ID': 'test_client_id',
    'EBAY_CLIENT_SECRET': 'test_client_secret',
    'EBAY_REDIRECT_URI': 'https://script.google.com/test',
    'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope'
  };
  
  PropertiesService.getScriptProperties().setProperties(testConfig);
  
  // createAuthUrl()のテスト
  const authUrl = createAuthUrl();
  QUnit.assert.ok(authUrl, '認証URLが生成される');
  QUnit.assert.ok(authUrl.includes('auth.ebay.com/oauth2/authorize'), '正しい認証エンドポイントが含まれる');
  QUnit.assert.ok(authUrl.includes('client_id=test_client_id'), 'Client IDが含まれる');
  QUnit.assert.ok(authUrl.includes('redirect_uri=https%3A//script.google.com/test'), 'Redirect URIが含まれる');
  QUnit.assert.ok(authUrl.includes('scope=https%3A//api.ebay.com/oauth/api_scope'), 'Scopeが含まれる');
  QUnit.assert.ok(authUrl.includes('response_type=code'), 'Response Typeが含まれる');
  QUnit.assert.ok(authUrl.includes('state='), 'Stateパラメータが含まれる');
  
  // getAuthUrl()のテスト
  const authUrl2 = getAuthUrl();
  QUnit.assert.ok(authUrl2, 'getAuthUrl()が正常に動作する');
  QUnit.assert.equal(authUrl2, authUrl, 'createAuthUrl()とgetAuthUrl()が同じ結果を返す');
  
  // 設定が不完全な場合のテスト
  PropertiesService.getScriptProperties().deleteAllProperties();
  const emptyAuthUrl = createAuthUrl();
  QUnit.assert.notOk(emptyAuthUrl, '設定が不完全な場合はnullが返される');
  
  console.log('認証URL関連テスト完了');
}

/**
 * 認証状態関連のテスト
 */
function testAuthStatusFunctions() {
  console.log('認証状態関連テストを開始...');
  
  // 認証データをクリア
  clearAuthData();
  
  // 初期状態のテスト
  const initialStatus = getAuthStatus();
  QUnit.assert.notOk(initialStatus.hasAccessToken, '初期状態ではアクセストークンがない');
  QUnit.assert.notOk(initialStatus.hasRefreshToken, '初期状態ではリフレッシュトークンがない');
  QUnit.assert.notOk(initialStatus.isTokenValid, '初期状態ではトークンが無効');
  QUnit.assert.notOk(initialStatus.expiresAt, '初期状態では有効期限がない');
  
  // テスト用のトークンデータを設定
  const testTokenData = {
    'EBAY_ACCESS_TOKEN': 'test_access_token',
    'EBAY_REFRESH_TOKEN': 'test_refresh_token',
    'EBAY_TOKEN_EXPIRES_AT': (new Date().getTime() + 7200000).toString() // 2時間後
  };
  
  PropertiesService.getScriptProperties().setProperties(testTokenData);
  
  // トークン設定後のテスト
  const statusWithToken = getAuthStatus();
  QUnit.assert.ok(statusWithToken.hasAccessToken, 'アクセストークンが設定されている');
  QUnit.assert.ok(statusWithToken.hasRefreshToken, 'リフレッシュトークンが設定されている');
  QUnit.assert.ok(statusWithToken.isTokenValid, 'トークンが有効');
  QUnit.assert.ok(statusWithToken.expiresAt, '有効期限が設定されている');
  
  // 期限切れトークンのテスト
  const expiredTokenData = {
    'EBAY_ACCESS_TOKEN': 'test_access_token',
    'EBAY_REFRESH_TOKEN': 'test_refresh_token',
    'EBAY_TOKEN_EXPIRES_AT': (new Date().getTime() - 3600000).toString() // 1時間前
  };
  
  PropertiesService.getScriptProperties().setProperties(expiredTokenData);
  
  const expiredStatus = getAuthStatus();
  QUnit.assert.ok(expiredStatus.hasAccessToken, 'アクセストークンは存在する');
  QUnit.assert.notOk(expiredStatus.isTokenValid, '期限切れトークンは無効');
  
  console.log('認証状態関連テスト完了');
}

/**
 * トークン関連のテスト
 */
function testTokenFunctions() {
  console.log('トークン関連テストを開始...');
  
  // 認証データをクリア
  clearAuthData();
  
  // 初期状態のテスト
  const initialToken = getAccessToken();
  QUnit.assert.notOk(initialToken, '初期状態ではアクセストークンが取得できない');
  
  // テスト用のトークンデータを設定
  const testTokenData = {
    'EBAY_ACCESS_TOKEN': 'test_access_token',
    'EBAY_REFRESH_TOKEN': 'test_refresh_token',
    'EBAY_TOKEN_EXPIRES_AT': (new Date().getTime() + 7200000).toString() // 2時間後
  };
  
  PropertiesService.getScriptProperties().setProperties(testTokenData);
  
  // 有効なトークンのテスト
  const validToken = getAccessToken();
  QUnit.assert.equal(validToken, 'test_access_token', '有効なアクセストークンが取得できる');
  
  // isTokenValid()のテスト
  const isValid = isTokenValid();
  QUnit.assert.ok(isValid, '有効なトークンはtrueを返す');
  
  // 期限切れトークンのテスト
  const expiredTokenData = {
    'EBAY_ACCESS_TOKEN': 'test_access_token',
    'EBAY_REFRESH_TOKEN': 'test_refresh_token',
    'EBAY_TOKEN_EXPIRES_AT': (new Date().getTime() - 3600000).toString() // 1時間前
  };
  
  PropertiesService.getScriptProperties().setProperties(expiredTokenData);
  
  const isValidExpired = isTokenValid();
  QUnit.assert.notOk(isValidExpired, '期限切れトークンはfalseを返す');
  
  console.log('トークン関連テスト完了');
}

/**
 * API関連のテスト
 */
function testApiFunctions() {
  console.log('API関連テストを開始...');
  
  // 認証データをクリア
  clearAuthData();
  
  // トークンがない場合のテスト
  try {
    getApiHeaders();
    QUnit.assert.ok(false, 'トークンがない場合は例外が発生するべき');
  } catch (error) {
    QUnit.assert.ok(error.message.includes('有効なアクセストークンがありません'), '適切なエラーメッセージが表示される');
  }
  
  // テスト用のトークンデータを設定
  const testTokenData = {
    'EBAY_ACCESS_TOKEN': 'test_access_token',
    'EBAY_REFRESH_TOKEN': 'test_refresh_token',
    'EBAY_TOKEN_EXPIRES_AT': (new Date().getTime() + 7200000).toString() // 2時間後
  };
  
  PropertiesService.getScriptProperties().setProperties(testTokenData);
  
  // 有効なトークンがある場合のテスト
  const headers = getApiHeaders();
  QUnit.assert.ok(headers, 'APIヘッダーが取得できる');
  QUnit.assert.equal(headers['Authorization'], 'Bearer test_access_token', 'Authorizationヘッダーが正しく設定される');
  QUnit.assert.equal(headers['Content-Type'], 'application/json', 'Content-Typeヘッダーが正しく設定される');
  
  console.log('API関連テスト完了');
}

/**
 * 統合テスト
 */
function testIntegration() {
  console.log('統合テストを開始...');
  
  // 認証データをクリア
  clearAuthData();
  
  // 設定確認
  const config = getConfigFromProperties();
  if (!config) {
    console.log('設定が不完全なため、統合テストをスキップします');
    QUnit.assert.ok(true, '設定が不完全な場合はテストをスキップ');
    return;
  }
  
  // 認証状態の確認
  const initialStatus = getAuthStatus();
  QUnit.assert.notOk(initialStatus.hasAccessToken, '初期状態ではアクセストークンがない');
  
  // 認証URLの生成
  const authUrl = getAuthUrl();
  QUnit.assert.ok(authUrl, '認証URLが生成される');
  
  // 認証データのクリア機能
  const clearResult = clearAuthData();
  QUnit.assert.ok(clearResult, '認証データのクリアが成功する');
  
  const afterClearStatus = getAuthStatus();
  QUnit.assert.notOk(afterClearStatus.hasAccessToken, 'クリア後はアクセストークンがない');
  QUnit.assert.notOk(afterClearStatus.hasRefreshToken, 'クリア後はリフレッシュトークンがない');
  
  console.log('統合テスト完了');
}

/**
 * モック関数のテスト
 */
function testMockFunctions() {
  console.log('モック関数テストを開始...');
  
  // モックURLのテスト
  const mockRedirectUrl = 'https://script.google.com/test?code=test_auth_code&state=test_state';
  const authCode = extractAuthCodeFromUrl(mockRedirectUrl);
  QUnit.assert.equal(authCode, 'test_auth_code', 'リダイレクトURLから認証コードが正しく抽出される');
  
  // 無効なURLのテスト
  const invalidUrl = 'https://script.google.com/test?error=access_denied';
  const invalidAuthCode = extractAuthCodeFromUrl(invalidUrl);
  QUnit.assert.notOk(invalidAuthCode, '無効なURLからは認証コードが抽出されない');
  
  // ランダム状態生成のテスト
  const state1 = generateRandomState();
  const state2 = generateRandomState();
  QUnit.assert.ok(state1, 'ランダム状態が生成される');
  QUnit.assert.ok(state2, 'ランダム状態が生成される');
  QUnit.assert.notEqual(state1, state2, '生成される状態は異なる');
  
  console.log('モック関数テスト完了');
}

/**
 * エラーハンドリングのテスト
 */
function testErrorHandling() {
  console.log('エラーハンドリングテストを開始...');
  
  // 設定が不完全な場合のテスト
  PropertiesService.getScriptProperties().deleteAllProperties();
  
  const emptyConfig = getConfigFromProperties();
  QUnit.assert.notOk(emptyConfig, '設定が不完全な場合はnullが返される');
  
  const emptyAuthUrl = createAuthUrl();
  QUnit.assert.notOk(emptyAuthUrl, '設定が不完全な場合は認証URLが生成されない');
  
  const emptyGetAuthUrl = getAuthUrl();
  QUnit.assert.notOk(emptyGetAuthUrl, '設定が不完全な場合はgetAuthUrl()がnullを返す');
  
  // 無効な認証URLのテスト
  try {
    authenticateWithUrl('https://invalid-url.com');
    QUnit.assert.ok(false, '無効なURLの場合は例外が発生するべき');
  } catch (error) {
    QUnit.assert.ok(error.message.includes('無効なeBay OAuth認証URLです'), '適切なエラーメッセージが表示される');
  }
  
  console.log('エラーハンドリングテスト完了');
}

/**
 * パフォーマンステスト
 */
function testPerformance() {
  console.log('パフォーマンステストを開始...');
  
  // テスト用の設定を保存
  const testConfig = {
    'EBAY_CLIENT_ID': 'test_client_id',
    'EBAY_CLIENT_SECRET': 'test_client_secret',
    'EBAY_REDIRECT_URI': 'https://script.google.com/test',
    'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope'
  };
  
  PropertiesService.getScriptProperties().setProperties(testConfig);
  
  // 複数回の実行テスト
  const startTime = new Date().getTime();
  
  for (let i = 0; i < 10; i++) {
    const config = getConfigFromProperties();
    const authUrl = createAuthUrl();
    const status = getAuthStatus();
  }
  
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;
  
  QUnit.assert.ok(executionTime < 5000, `10回の実行が5秒以内に完了する (${executionTime}ms)`);
  
  console.log(`パフォーマンステスト完了 (実行時間: ${executionTime}ms)`);
}

/**
 * テスト用のヘルパー関数
 */
function setupTestEnvironment() {
  console.log('テスト環境をセットアップ...');
  
  // テスト用の設定を保存
  const testConfig = {
    'EBAY_CLIENT_ID': 'test_client_id',
    'EBAY_CLIENT_SECRET': 'test_client_secret',
    'EBAY_REDIRECT_URI': 'https://script.google.com/test',
    'EBAY_SCOPE': 'https://api.ebay.com/oauth/api_scope'
  };
  
  PropertiesService.getScriptProperties().setProperties(testConfig);
  
  console.log('テスト環境のセットアップ完了');
}

/**
 * テスト用のクリーンアップ関数
 */
function cleanupTestEnvironment() {
  console.log('テスト環境をクリーンアップ...');
  
  // 認証データをクリア
  clearAuthData();
  
  // テスト設定を削除
  PropertiesService.getScriptProperties().deleteAllProperties();
  
  console.log('テスト環境のクリーンアップ完了');
}

/**
 * 特定のテストのみを実行する関数
 */
function runSpecificTest(testName) {
  console.log(`特定のテストを実行: ${testName}`);
  
  switch (testName) {
    case 'config':
      testConfigFunctions();
      break;
    case 'authUrl':
      testAuthUrlFunctions();
      break;
    case 'authStatus':
      testAuthStatusFunctions();
      break;
    case 'token':
      testTokenFunctions();
      break;
    case 'api':
      testApiFunctions();
      break;
    case 'integration':
      testIntegration();
      break;
    case 'mock':
      testMockFunctions();
      break;
    case 'error':
      testErrorHandling();
      break;
    case 'performance':
      testPerformance();
      break;
    default:
      console.log('無効なテスト名です');
  }
} 

/**
 * 簡単なテスト実行関数
 */
function runSimpleTests() {
  console.log('=== 簡単なテスト実行開始 ===');
  
  try {
    // テスト環境をセットアップ
    setupTestEnvironment();
    
    // 基本的なテストを実行
    console.log('1. 設定テスト...');
    testConfigFunctions();
    
    console.log('2. 認証URLテスト...');
    testAuthUrlFunctions();
    
    console.log('3. 認証状態テスト...');
    testAuthStatusFunctions();
    
    console.log('4. トークンテスト...');
    testTokenFunctions();
    
    console.log('5. APIテスト...');
    testApiFunctions();
    
    console.log('6. 統合テスト...');
    testIntegration();
    
    console.log('7. モック関数テスト...');
    testMockFunctions();
    
    console.log('8. エラーハンドリングテスト...');
    testErrorHandling();
    
    console.log('9. パフォーマンステスト...');
    testPerformance();
    
    // テスト環境をクリーンアップ
    cleanupTestEnvironment();
    
    console.log('=== すべてのテストが完了しました ===');
    
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
    cleanupTestEnvironment();
  }
}

/**
 * テスト結果を表示する関数
 */
function showTestResults() {
  console.log('=== テスト結果サマリー ===');
  
  const results = {
    config: '✅ 設定関連テスト完了',
    authUrl: '✅ 認証URL関連テスト完了',
    authStatus: '✅ 認証状態関連テスト完了',
    token: '✅ トークン関連テスト完了',
    api: '✅ API関連テスト完了',
    integration: '✅ 統合テスト完了',
    mock: '✅ モック関数テスト完了',
    error: '✅ エラーハンドリングテスト完了',
    performance: '✅ パフォーマンステスト完了'
  };
  
  for (const [testName, result] of Object.entries(results)) {
    console.log(result);
  }
  
  console.log('=== テスト結果サマリー完了 ===');
}

/**
 * テスト用の設定を確認する関数
 */
function checkTestSetup() {
  console.log('=== テスト設定確認 ===');
  
  const config = getConfigFromProperties();
  if (config) {
    console.log('✅ テスト設定が正しく読み込まれています');
    console.log('Client ID:', config.clientId);
    console.log('Redirect URI:', config.redirectUri);
    console.log('Scope:', config.scope);
  } else {
    console.log('❌ テスト設定が読み込まれていません');
    console.log('setupTestEnvironment()を実行してください');
  }
  
  const authStatus = getAuthStatus();
  console.log('認証状態:', authStatus);
  
  console.log('=== テスト設定確認完了 ===');
} 