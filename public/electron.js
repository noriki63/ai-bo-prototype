const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs').promises;
const { exec } = require('child_process');
const https = require('https');
const http = require('http');
const logger = require('../src/utils/logger');

// メインウィンドウへの参照を保持
let mainWindow;

// 設定ファイルのパス
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// アプリケーション開始ログ
logger.info('AI棒アプリケーション起動開始');
logger.info(`Electron ${process.versions.electron}, Node ${process.versions.node}`);

// 実行コマンドの結果を返すユーティリティ関数
const execPromise = (command) => {
  logger.debug(`コマンド実行: ${command}`);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error(`コマンド実行エラー: ${command}`, { error: error.message, stderr });
        reject(error);
        return;
      }
      logger.debug(`コマンド実行成功: ${command}`);
      resolve(stdout);
    });
  });
};

const createWindow = () => {
  logger.info('メインウィンドウ作成開始');
  
  // preloadパスの計算 - 単純化して信頼性向上
  let preloadPath;
  if (isDev) {
    preloadPath = path.join(__dirname, 'preload.js');
    logger.info(`開発環境用preloadパス: ${preloadPath}`);
  } else {
    // 本番環境では固定パスを使用
    preloadPath = path.join(app.getAppPath(), 'build', 'preload.js');
    logger.info(`本番環境用preloadパス: ${preloadPath}`);
    
    // パスが存在しない場合の単純なフォールバック
    if (!fs.existsSync(preloadPath)) {
      preloadPath = path.join(__dirname, 'preload.js');
      logger.info(`フォールバックpreloadパス: ${preloadPath}`);
    }
  }
  
  // preloadファイルの存在確認
  try {
    const fileExists = fs.existsSync(preloadPath);
    logger.info(`preloadファイル確認: ${preloadPath} (存在: ${fileExists})`);
    
    if (!fileExists) {
      logger.error(`preloadファイルが見つかりません: ${preloadPath}`);
      // フォールバックパスを試行
      const altPath = path.join(__dirname, 'preload.js');
      if (fs.existsSync(altPath)) {
        preloadPath = altPath;
        logger.info(`代替preloadパスを使用: ${preloadPath}`);
      } else {
        logger.error(`代替preloadファイルも見つかりません: ${altPath}`);
      }
    }
  } catch (err) {
    logger.error(`preloadファイル確認中にエラー: ${err.message}`);
  }
  
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      // 2023年以降のElectronではいくつかの追加設定が推奨されます
      sandbox: false,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
    }
  });

  // 開発環境ではDevToolsを開く
  if (isDev) {
    logger.debug('開発モード: DevTools表示');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // アプリケーションをロード
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  logger.info(`アプリケーションURL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    logger.info('メインウィンドウが閉じられました');
    mainWindow = null;
  });
  
  // コンテンツ読み込み完了時のログ
  mainWindow.webContents.on('did-finish-load', () => {
    logger.info('Webコンテンツの読み込みが完了しました');
    // レンダラープロセスのコンソールをメインプロセスにも表示
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      const levels = ['log', 'warning', 'error', 'debug'];
      logger.debug(`[Renderer] ${levels[level] || 'info'}: ${message}`);
    });
  });
  
  // デバッグ用：preload.jsの読み込み状態を確認
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    logger.error(`Preloadスクリプト読み込みエラー: ${preloadPath}`, { error: error.message });
  });
  
  logger.info('メインウィンドウ作成完了');
};

// アプリケーションが準備完了したらメインウィンドウを作成
app.whenReady().then(() => {
  logger.info('Electronアプリケーション準備完了');
  createWindow();
});

// 全てのウィンドウが閉じられたとき
app.on('window-all-closed', () => {
  logger.info('全ウィンドウ終了');
  // macOSでは、ユーザーがCmd + Qで明示的に終了するまでアプリケーションを終了しない
  if (process.platform !== 'darwin') {
    logger.info('アプリケーション終了');
    app.quit();
  }
});

app.on('activate', () => {
  logger.info('アプリケーションアクティブ化');
  // macOSでは、ドックアイコンがクリックされてほかにウィンドウがないときに
  // アプリケーションでウィンドウを再作成するのが一般的
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// API テスト用のシンプルなハンドラ
ipcMain.handle('check-electron-api', () => {
  logger.info('Electron API動作チェック - 成功');
  return { success: true, message: 'Electron API is working properly' };
});

// ログ関連IPC - シンプルなエラーハンドリングを追加
ipcMain.handle('get-log-content', async (event, lines) => {
  logger.debug(`ログ内容取得リクエスト (${lines}行)`);
  try {
    // 必ず実際のログ内容を返すようにする
    const content = await logger.getLogContent(lines);
    logger.debug(`ログ内容取得成功: ${content.length}バイト`);
    return content || 'ログは空です';
  } catch (error) {
    logger.error('ログ内容取得エラー', { error: error.message });
    return `エラー: ${error.message}`;
  }
});

ipcMain.handle('get-error-log-content', async (event, lines) => {
  logger.debug(`エラーログ内容取得リクエスト (${lines}行)`);
  try {
    const content = await logger.getErrorLogContent(lines);
    logger.debug(`エラーログ内容取得成功: ${content.length}バイト`);
    return content || 'エラーログは空です';
  } catch (error) {
    logger.error('エラーログ内容取得エラー', { error: error.message });
    return `エラー: ${error.message}`;
  }
});

ipcMain.handle('get-log-files', async () => {
  logger.debug('ログファイル一覧取得リクエスト');
  try {
    const files = await logger.getLogFiles();
    logger.debug(`ログファイル一覧取得成功: ${files.length}件`);
    return files;
  } catch (error) {
    logger.error('ログファイル一覧取得エラー', { error: error.message });
    return [];
  }
});

ipcMain.handle('set-log-level', (event, level) => {
  logger.info(`ログレベル変更: ${level}`);
  try {
    logger.setLogLevel(level);
    return true;
  } catch (error) {
    logger.error('ログレベル設定エラー', { error: error.message });
    return false;
  }
});

// フロントエンドからのログ書き込みハンドラ
ipcMain.handle('write-log', (event, level, message, dataStr) => {
  try {
    let data = null;
    if (dataStr) {
      try {
        data = JSON.parse(dataStr);
      } catch (jsonError) {
        logger.error('ログデータのJSON解析エラー:', jsonError);
        data = { parseError: true, originalData: dataStr };
      }
    }
    
    // ログレベルに応じて適切なロガーメソッドを呼び出す
    switch (level) {
      case 'DEBUG':
        logger.debug(message, data);
        break;
      case 'INFO':
        logger.info(message, data);
        break;
      case 'WARN':
        logger.warn(message, data);
        break;
      case 'ERROR':
        logger.error(message, data);
        break;
      case 'FATAL':
        logger.fatal(message, data);
        break;
      default:
        logger.info(message, data);
    }
    
    return true;
  } catch (error) {
    logger.error('ログ書き込みエラー:', error);
    return false;
  }
});

// ファイルシステム操作
ipcMain.handle('fs-read-file', async (event, filePath, options) => {
  try {
    logger.debug(`ファイル読み込み: ${filePath}`);
    return await fs.readFile(filePath, options);
  } catch (error) {
    logger.error(`ファイル読み込みエラー: ${filePath}`, { error: error.message });
    throw new Error(`ファイル読み込みエラー: ${error.message}`);
  }
});

ipcMain.handle('fs-write-file', async (event, filePath, data) => {
  try {
    logger.debug(`ファイル書き込み: ${filePath}`);
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    logger.error(`ファイル書き込みエラー: ${filePath}`, { error: error.message });
    throw new Error(`ファイル書き込みエラー: ${error.message}`);
  }
});

// 環境構築関連のコマンド実行
ipcMain.handle('run-command', async (event, command) => {
  logger.info(`コマンド実行: ${command}`);
  try {
    const result = await execPromise(command);
    logger.debug('コマンド実行成功');
    return { success: true, output: result };
  } catch (error) {
    logger.error('コマンド実行失敗', { error: error.message });
    return { success: false, error: error.message };
  }
});

// システム情報の取得
ipcMain.handle('get-system-info', async () => {
  logger.info('システム情報取得');
  const platform = process.platform;
  const arch = process.arch;
  
  // OSの詳細情報を取得
  let osInfo = {};
  
  try {
    if (platform === 'darwin') {
      // macOS
      const macOSVersion = await execPromise('sw_vers -productVersion');
      osInfo = { 
        type: 'macOS', 
        version: macOSVersion.trim(),
        processor: await execPromise('sysctl -n machdep.cpu.brand_string').then(res => res.trim())
      };
    } else if (platform === 'win32') {
      // Windows
      const windowsVersion = await execPromise('ver');
      osInfo = { 
        type: 'Windows', 
        version: windowsVersion.trim().replace(/[\r\n]/g, '')
      };
    } else if (platform === 'linux') {
      // Linux
      const linuxDistro = await execPromise('cat /etc/os-release | grep PRETTY_NAME').then(res => {
        const match = res.match(/PRETTY_NAME="(.+)"/);
        return match ? match[1] : 'Unknown Linux';
      });
      osInfo = { type: 'Linux', version: linuxDistro };
    }
    logger.debug('OS情報取得成功', osInfo);
  } catch (error) {
    logger.error('OS情報取得エラー', { error: error.message });
    osInfo = { type: platform, version: 'Unknown', error: error.message };
  }
  
  // メモリ情報を取得
  let memoryInfo = {};
  try {
    const totalMemory = process.getSystemMemoryInfo().total / (1024 * 1024); // MB単位
    memoryInfo = { total: `${Math.round(totalMemory * 100) / 100} MB` };
    logger.debug('メモリ情報取得成功', memoryInfo);
  } catch (error) {
    logger.error('メモリ情報取得エラー', { error: error.message });
    memoryInfo = { error: error.message };
  }
  
  return {
    platform,
    arch,
    osInfo,
    memoryInfo
  };
});

// 設定の保存と取得
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    logger.debug('設定保存');
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    logger.error('設定保存エラー', { error: error.message });
    throw error;
  }
});

ipcMain.handle('get-settings', async () => {
  try {
    // fs.accessでファイルの存在確認
    let fileExists = false;
    try {
      await fs.access(settingsPath);
      fileExists = true;
    } catch (e) {
      fileExists = false;
    }
    
    if (fileExists) {
      logger.debug('既存設定読み込み');
      const data = await fs.readFile(settingsPath, 'utf8');
      return JSON.parse(data);
    }
    
    logger.debug('設定ファイルが存在しません');
    return null;
  } catch (error) {
    logger.error('設定読み込みエラー', { error: error.message });
    return null;
  }
});

// 以下、API接続テスト用のダミーハンドラ
// 実際の実装では、外部APIへの接続テストロジックを追加

ipcMain.handle('test-openai-connection', async (event, apiKey, apiEndpoint) => {
  logger.info('OpenAI接続テスト', { endpoint: apiEndpoint || 'デフォルト' });
  return { success: true, message: 'OpenAI APIに正常に接続できました（シミュレーション）' };
});

ipcMain.handle('test-anthropic-connection', async (event, apiKey, apiEndpoint) => {
  logger.info('Anthropic接続テスト', { endpoint: apiEndpoint || 'デフォルト' });
  return { success: true, message: 'Anthropic APIに正常に接続できました（シミュレーション）' };
});

ipcMain.handle('test-azure-connection', async (event, apiKey, endpoint, deploymentName) => {
  logger.info('Azure OpenAI接続テスト', { endpoint, deploymentName });
  return { success: true, message: 'Azure OpenAI APIに正常に接続できました（シミュレーション）' };
});

ipcMain.handle('test-google-connection', async (event, projectId, location, keyFilePath) => {
  logger.info('Google Vertex AI接続テスト', { projectId, location });
  return { success: true, message: 'Google Vertex AIに正常に接続できました（シミュレーション）' };
});

ipcMain.handle('test-openrouter-connection', async (event, apiKey) => {
  logger.info('OpenRouter接続テスト');
  return { success: true, message: 'OpenRouter APIに正常に接続できました（シミュレーション）' };
});

ipcMain.handle('test-local-connection', async (event) => {
  logger.info('ローカルモデル接続テスト');
  return { success: true, message: 'ローカルモデルに正常に接続できました（シミュレーション）' };
});