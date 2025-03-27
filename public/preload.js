// public/preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// APIをウィンドウオブジェクトに公開
contextBridge.exposeInMainWorld('electronAPI', {
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
    
  // ログ機能
  logs: {
    getLogContent: (lines = 100) => ipcRenderer.invoke('get-log-content', lines),
    getErrorLogContent: (lines = 100) => ipcRenderer.invoke('get-error-log-content', lines),
    getLogFiles: () => ipcRenderer.invoke('get-log-files'),
    setLogLevel: (level) => ipcRenderer.invoke('set-log-level', level),
    // 追加: ログ書き込み用の関数
    writeLog: (level, message, dataStr) => ipcRenderer.invoke('write-log', level, message, dataStr)
  }
});