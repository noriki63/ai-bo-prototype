const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// 初期化ステータス追跡用フラグ
let apiInitialized = false;

// 初期化時にログを出力
console.log('preload.js の読み込みを開始しました');

// APIの各部分の初期化状態を追跡するためのオブジェクト
const initStatus = {
  main: false,
  logs: false
};

// APIをウィンドウオブジェクトに公開
try {
  console.log('API初期化プロセスを開始します');
  
  // 動作チェック - 最初にシンプルなAPIを呼び出してIPCが機能するかテスト
  ipcRenderer.invoke('check-electron-api')
    .then(result => {
      console.log('Electron API 基本動作テスト結果:', result);
      initStatus.main = true;
      updateApiStatus();
    })
    .catch(err => {
      console.error('Electron API 基本動作テスト失敗:', err);
    });

  // ログ機能の初期化テスト
  const testLogFunction = async () => {
    try {
      console.log('ログ機能初期化テスト実行');
      await ipcRenderer.invoke('write-log', 'INFO', 'preload.js ログ初期化テスト', '{}');
      console.log('ログ機能初期化テスト成功');
      initStatus.logs = true;
      updateApiStatus();
      return true;
    } catch (error) {
      console.error('ログ機能初期化テスト失敗:', error);
      return false;
    }
  };
  
  // 初期化状態を更新する関数
  const updateApiStatus = () => {
    // すべての機能が初期化されたか確認
    if (initStatus.main && initStatus.logs) {
      apiInitialized = true;
      console.log('electronAPI 完全初期化完了');
    }
  };
  
  // ログ機能テストを実行
  testLogFunction();

  // IPCが利用可能かどうか確認する関数
  const isIPCAvailable = () => {
    return ipcRenderer && typeof ipcRenderer.invoke === 'function';
  };

  // APIをcontextBridgeで公開
  contextBridge.exposeInMainWorld('electronAPI', {
    // API初期化状態確認のためのヘルパー関数
    isInitialized: () => apiInitialized,
    isLogsReady: () => initStatus.logs,
    
    // 診断用API - APIが正しく公開されているか確認するための関数
    checkAPI: () => {
      return {
        available: true,
        timestamp: new Date().toISOString(),
        initStatus: { ...initStatus }
      };
    },
    
    // ファイルシステム操作
    readFile: (path, options) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('fs-read-file', path, options);
    },
    writeFile: (path, data) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('fs-write-file', path, data);
    },
    
    // コマンド実行
    runCommand: (command) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('run-command', command);
    },
    
    // システム情報取得
    getSystemInfo: () => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('get-system-info');
    },
    
    // 設定管理
    saveSettings: (settings) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      console.log('設定保存リクエスト送信');
      return ipcRenderer.invoke('save-settings', settings);
    },
    getSettings: () => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      console.log('設定取得リクエスト送信');
      return ipcRenderer.invoke('get-settings');
    },
    
    // API接続テスト - 標準プロバイダー
    testOpenAIConnection: (apiKey, apiEndpoint) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('test-openai-connection', apiKey, apiEndpoint);
    },
    testAnthropicConnection: (apiKey, apiEndpoint) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('test-anthropic-connection', apiKey, apiEndpoint);
    },
      
    // API接続テスト - 追加プロバイダー
    testAzureConnection: (apiKey, endpoint, deploymentName) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('test-azure-connection', apiKey, endpoint, deploymentName);
    },
    testGoogleConnection: (projectId, location, keyFilePath) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('test-google-connection', projectId, location, keyFilePath);
    },
    testOpenRouterConnection: (apiKey) => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('test-openrouter-connection', apiKey);
    },
    testLocalConnection: () => {
      if (!isIPCAvailable()) return Promise.reject(new Error('IPC通信が利用できません'));
      return ipcRenderer.invoke('test-local-connection');
    },

    // ログ機能 - より直接的なアクセスを提供
    getLogContent: async (lines = 100) => {
      try {
        console.log(`preload: getLogContent(${lines})を呼び出します`);
        if (!isIPCAvailable()) {
          console.error('getLogContent: IPC通信が利用できません');
          return 'IPC通信エラー: レンダラープロセスとメインプロセス間の接続に問題があります。';
        }
        return await ipcRenderer.invoke('get-log-content', lines);
      } catch (error) {
        console.error('getLogContent呼び出しエラー:', error);
        return `エラー: ${error.message}`;
      }
    },
    
    getErrorLogContent: async (lines = 100) => {
      try {
        console.log(`preload: getErrorLogContent(${lines})を呼び出します`);
        if (!isIPCAvailable()) {
          console.error('getErrorLogContent: IPC通信が利用できません');
          return 'IPC通信エラー: レンダラープロセスとメインプロセス間の接続に問題があります。';
        }
        return await ipcRenderer.invoke('get-error-log-content', lines);
      } catch (error) {
        console.error('getErrorLogContent呼び出しエラー:', error);
        return `エラー: ${error.message}`;
      }
    },
    
    getLogFiles: async () => {
      try {
        console.log('preload: getLogFilesを呼び出します');
        if (!isIPCAvailable()) {
          console.error('getLogFiles: IPC通信が利用できません');
          return [];
        }
        return await ipcRenderer.invoke('get-log-files');
      } catch (error) {
        console.error('getLogFiles呼び出しエラー:', error);
        return [];
      }
    },
    
    setLogLevel: async (level) => {
      try {
        console.log(`preload: setLogLevel(${level})を呼び出します`);
        if (!isIPCAvailable()) {
          console.error('setLogLevel: IPC通信が利用できません');
          return false;
        }
        return await ipcRenderer.invoke('set-log-level', level);
      } catch (error) {
        console.error('setLogLevel呼び出しエラー:', error);
        return false;
      }
    },
    
    writeLog: async (level, message, dataStr) => {
      try {
        console.log(`preload: writeLog(${level}, ${message})を呼び出します`);
        if (!isIPCAvailable()) {
          console.error('writeLog: IPC通信が利用できません');
          return false;
        }
        return await ipcRenderer.invoke('write-log', level, message, dataStr);
      } catch (error) {
        console.error('writeLog呼び出しエラー:', error);
        return false;
      }
    },
    
    // 従来のlogs構造も互換性のために維持
    logs: {
      getLogContent: async (lines = 100) => {
        try {
          console.log(`preload: logs.getLogContent(${lines})を呼び出します`);
          if (!isIPCAvailable()) {
            console.error('logs.getLogContent: IPC通信が利用できません');
            return 'IPC通信エラー: レンダラープロセスとメインプロセス間の接続に問題があります。';
          }
          return await ipcRenderer.invoke('get-log-content', lines);
        } catch (error) {
          console.error('logs.getLogContent呼び出しエラー:', error);
          return `エラー: ${error.message}`;
        }
      },
      
      getErrorLogContent: async (lines = 100) => {
        try {
          console.log(`preload: logs.getErrorLogContent(${lines})を呼び出します`);
          if (!isIPCAvailable()) {
            console.error('logs.getErrorLogContent: IPC通信が利用できません');
            return 'IPC通信エラー: レンダラープロセスとメインプロセス間の接続に問題があります。';
          }
          return await ipcRenderer.invoke('get-error-log-content', lines);
        } catch (error) {
          console.error('logs.getErrorLogContent呼び出しエラー:', error);
          return `エラー: ${error.message}`;
        }
      },
      
      getLogFiles: async () => {
        try {
          console.log('preload: logs.getLogFilesを呼び出します');
          if (!isIPCAvailable()) {
            console.error('logs.getLogFiles: IPC通信が利用できません');
            return [];
          }
          return await ipcRenderer.invoke('get-log-files');
        } catch (error) {
          console.error('logs.getLogFiles呼び出しエラー:', error);
          return [];
        }
      },
      
      setLogLevel: async (level) => {
        try {
          console.log(`preload: logs.setLogLevel(${level})を呼び出します`);
          if (!isIPCAvailable()) {
            console.error('logs.setLogLevel: IPC通信が利用できません');
            return false;
          }
          return await ipcRenderer.invoke('set-log-level', level);
        } catch (error) {
          console.error('logs.setLogLevel呼び出しエラー:', error);
          return false;
        }
      },
      
      writeLog: async (level, message, dataStr) => {
        try {
          console.log(`preload: logs.writeLog(${level}, ${message})を呼び出します`);
          if (!isIPCAvailable()) {
            console.error('logs.writeLog: IPC通信が利用できません');
            return false;
          }
          return await ipcRenderer.invoke('write-log', level, message, dataStr);
        } catch (error) {
          console.error('logs.writeLog呼び出しエラー:', error);
          return false;
        }
      }
    }
  });
  
  console.log('preload.js: electronAPI オブジェクトが公開されました');
  
  // 公開されたAPIの構造をデバッグ
  console.log('electronAPI構造:', {
    hasDirectLogMethods: true,
    hasLogsAPI: true,
    hasFSAPI: true,
    hasRunCommand: true,
    hasGetSystemInfo: true,
    hasSettingsAPI: true
  });
} catch (error) {
  console.error('preload.jsでのAPI公開中にエラーが発生しました:', error);
}