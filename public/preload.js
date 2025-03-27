const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

console.log('preload.js が読み込まれました');

// APIをウィンドウオブジェクトに公開
try {
  // 動作チェック - 最初にシンプルなAPIを呼び出してIPCが機能するかテスト
  ipcRenderer.invoke('check-electron-api').then(result => {
    console.log('Electron API 基本動作テスト結果:', result);
  }).catch(err => {
    console.error('Electron API 基本動作テスト失敗:', err);
  });

  contextBridge.exposeInMainWorld('electronAPI', {
    // 診断用API - APIが正しく公開されているか確認するための関数
    checkAPI: () => {
      return {
        available: true,
        timestamp: new Date().toISOString()
      };
    },
    
    // ファイルシステム操作
    readFile: (path, options) => ipcRenderer.invoke('fs-read-file', path, options),
    writeFile: (path, data) => ipcRenderer.invoke('fs-write-file', path, data),
    
    // コマンド実行
    runCommand: (command) => ipcRenderer.invoke('run-command', command),
    
    // システム情報取得
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    
    // 設定管理
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    
    // API接続テスト - 標準プロバイダー
    testOpenAIConnection: (apiKey, apiEndpoint) => 
      ipcRenderer.invoke('test-openai-connection', apiKey, apiEndpoint),
    testAnthropicConnection: (apiKey, apiEndpoint) => 
      ipcRenderer.invoke('test-anthropic-connection', apiKey, apiEndpoint),
      
    // API接続テスト - 追加プロバイダー
    testAzureConnection: (apiKey, endpoint, deploymentName) =>
      ipcRenderer.invoke('test-azure-connection', apiKey, endpoint, deploymentName),
    testGoogleConnection: (projectId, location, keyFilePath) =>
      ipcRenderer.invoke('test-google-connection', projectId, location, keyFilePath),
    testOpenRouterConnection: (apiKey) =>
      ipcRenderer.invoke('test-openrouter-connection', apiKey),
    testLocalConnection: () =>
      ipcRenderer.invoke('test-local-connection'),
      
    // ログ機能 - 明示的にオブジェクト化して公開
    logs: {
      // ログ内容取得
      getLogContent: (lines = 100) => {
        console.log(`preload: getLogContent(${lines})を呼び出します`);
        return ipcRenderer.invoke('get-log-content', lines);
      },
      
      // エラーログ内容取得
      getErrorLogContent: (lines = 100) => {
        console.log(`preload: getErrorLogContent(${lines})を呼び出します`);
        return ipcRenderer.invoke('get-error-log-content', lines);
      },
      
      // ログファイル一覧取得
      getLogFiles: () => {
        console.log('preload: getLogFilesを呼び出します');
        return ipcRenderer.invoke('get-log-files');
      },
      
      // ログレベル設定
      setLogLevel: (level) => {
        console.log(`preload: setLogLevel(${level})を呼び出します`);
        return ipcRenderer.invoke('set-log-level', level);
      },
      
      // ログ書き込み
      writeLog: (level, message, dataStr) => {
        console.log(`preload: writeLog(${level}, ${message})を呼び出します`);
        return ipcRenderer.invoke('write-log', level, message, dataStr);
      }
    }
  });
  
  console.log('preload.js: electronAPI オブジェクトが正常に公開されました');
  console.log('preload.js: logs APIが利用可能か:', typeof ipcRenderer.invoke === 'function');
  
  // 公開されたAPIの構造をデバッグ
  console.log('electronAPI構造:', {
    hasLogsAPI: true,
    hasFSAPI: true,
    hasRunCommand: true,
    hasGetSystemInfo: true,
    hasSettingsAPI: true
  });
} catch (error) {
  console.error('preload.jsでのAPI公開中にエラーが発生しました:', error);
}