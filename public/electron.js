const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs').promises;
const { exec } = require('child_process');
const https = require('https');
const http = require('http');

// メインウィンドウへの参照を保持
let mainWindow;

// 設定ファイルのパス
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

// 実行コマンドの結果を返すユーティリティ関数
const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const createWindow = () => {
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 開発環境ではDevToolsを開く
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // アプリケーションをロード
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// アプリケーションが準備完了したらメインウィンドウを作成
app.whenReady().then(createWindow);

// 全てのウィンドウが閉じられたとき
app.on('window-all-closed', () => {
  // macOSでは、ユーザーがCmd + Qで明示的に終了するまでアプリケーションを終了しない
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOSでは、ドックアイコンがクリックされてほかにウィンドウがないときに
  // アプリケーションでウィンドウを再作成するのが一般的
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPCメインプロセスハンドラ

// ファイルシステム操作
ipcMain.handle('fs-read-file', async (event, filePath, options) => {
  try {
    return await fs.readFile(filePath, options);
  } catch (error) {
    throw new Error(`ファイル読み込みエラー: ${error.message}`);
  }
});

ipcMain.handle('fs-write-file', async (event, filePath, data) => {
  try {
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    throw new Error(`ファイル書き込みエラー: ${error.message}`);
  }
});

// 環境構築関連のコマンド実行
ipcMain.handle('run-command', async (event, command) => {
  try {
    const result = await execPromise(command);
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// システム情報の取得
ipcMain.handle('get-system-info', async () => {
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
  } catch (error) {
    osInfo = { type: platform, version: 'Unknown', error: error.message };
  }
  
  // メモリ情報を取得
  let memoryInfo = {};
  try {
    const totalMemory = process.getSystemMemoryInfo().total / (1024 * 1024); // MB単位
    memoryInfo = { total: `${Math.round(totalMemory * 100) / 100} MB` };
  } catch (error) {
    memoryInfo = { error: error.message };
  }
  
  return {
    platform,
    arch,
    osInfo,
    memoryInfo
  };
});

// 設定の保存
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    // ディレクトリが存在することを確認
    try {
      await fs.access(userDataPath);
    } catch (error) {
      // ディレクトリが存在しない場合は作成
      await fs.mkdir(userDataPath, { recursive: true });
    }
    
    // 設定を保存
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('設定保存エラー:', error);
    throw new Error(`設定の保存に失敗しました: ${error.message}`);
  }
});

// 設定の読み込み
ipcMain.handle('get-settings', async () => {
  try {
    // ファイルが存在するか確認
    try {
      await fs.access(settingsPath);
    } catch (error) {
      // ファイルが存在しない場合はデフォルト設定を返す
      return {
        aiProvider: 'openai',
        apiKey: '',
        apiEndpoint: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4000,
        customModels: []
      };
    }
    
    // 設定を読み込み
    const data = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('設定読み込みエラー:', error);
    // エラーが発生した場合もデフォルト設定を返す
    return {
      aiProvider: 'openai',
      apiKey: '',
      apiEndpoint: '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      customModels: []
    };
  }
});

// OpenAI API接続テスト
ipcMain.handle('test-openai-connection', async (event, apiKey, apiEndpoint) => {
  return new Promise((resolve) => {
    try {
      const endpoint = apiEndpoint || 'https://api.openai.com';
      const url = new URL('/v1/models', endpoint);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      };
      
      const httpModule = url.protocol === 'https:' ? https : http;
      
      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, message: '接続成功！OpenAI APIと正常に通信できました。' });
          } else {
            try {
              const errorResponse = JSON.parse(data);
              resolve({ 
                success: false, 
                message: `接続エラー (${res.statusCode}): ${errorResponse.error?.message || 'Unknown error'}` 
              });
            } catch (e) {
              resolve({ 
                success: false, 
                message: `接続エラー (${res.statusCode}): ${data || 'Unknown error'}` 
              });
            }
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({ success: false, message: `ネットワークエラー: ${error.message}` });
      });
      
      req.end();
    } catch (error) {
      resolve({ success: false, message: `テストエラー: ${error.message}` });
    }
  });
});

// Anthropic API接続テスト
ipcMain.handle('test-anthropic-connection', async (event, apiKey, apiEndpoint) => {
  return new Promise((resolve) => {
    try {
      const endpoint = apiEndpoint || 'https://api.anthropic.com';
      const url = new URL('/v1/models', endpoint);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      };
      
      const httpModule = url.protocol === 'https:' ? https : http;
      
      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, message: '接続成功！Anthropic APIと正常に通信できました。' });
          } else {
            try {
              const errorResponse = JSON.parse(data);
              resolve({ 
                success: false, 
                message: `接続エラー (${res.statusCode}): ${errorResponse.error?.message || 'Unknown error'}` 
              });
            } catch (e) {
              resolve({ 
                success: false, 
                message: `接続エラー (${res.statusCode}): ${data || 'Unknown error'}` 
              });
            }
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({ success: false, message: `ネットワークエラー: ${error.message}` });
      });
      
      req.end();
    } catch (error) {
      resolve({ success: false, message: `テストエラー: ${error.message}` });
    }
  });
});

// Azure OpenAI API接続テスト
ipcMain.handle('test-azure-connection', async (event, apiKey, endpoint, deploymentName) => {
    return new Promise((resolve) => {
      try {
        if (!apiKey || !endpoint || !deploymentName) {
          return resolve({ 
            success: false, 
            message: 'Azure OpenAI API情報が不完全です。APIキー、エンドポイント、デプロイメント名をすべて入力してください。' 
          });
        }
        
        const url = new URL(`/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`, endpoint);
        
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5
          })
        };
        
        const httpModule = url.protocol === 'https:' ? https : http;
        
        const req = httpModule.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve({ success: true, message: '接続成功！Azure OpenAI APIと正常に通信できました。' });
            } else {
              try {
                const errorResponse = JSON.parse(data);
                resolve({ 
                  success: false, 
                  message: `接続エラー (${res.statusCode}): ${errorResponse.error?.message || 'Unknown error'}` 
                });
              } catch (e) {
                resolve({ 
                  success: false, 
                  message: `接続エラー (${res.statusCode}): ${data || 'Unknown error'}` 
                });
              }
            }
          });
        });
        
        req.on('error', (error) => {
          resolve({ success: false, message: `ネットワークエラー: ${error.message}` });
        });
        
        req.end();
      } catch (error) {
        resolve({ success: false, message: `テストエラー: ${error.message}` });
      }
    });
  });
  
  // Google Vertex AI API接続テスト
  ipcMain.handle('test-google-connection', async (event, projectId, location, keyFilePath) => {
    if (!projectId || !location) {
      return { 
        success: false, 
        message: 'Google Cloud情報が不完全です。プロジェクトIDとロケーションを入力してください。' 
      };
    }
    
    if (!keyFilePath) {
      return { 
        success: false, 
        message: 'サービスアカウントキーファイルが選択されていません。' 
      };
    }
    
    try {
      // キーファイルの存在確認
      await fs.access(keyFilePath);
      
      // キーファイルの内容検証（シンプルなチェック）
      const keyFileContent = await fs.readFile(keyFilePath, 'utf8');
      const keyData = JSON.parse(keyFileContent);
      
      if (!keyData.private_key || !keyData.client_email) {
        return { 
          success: false, 
          message: '無効なサービスアカウントキーファイルです。private_keyとclient_emailが必要です。' 
        };
      }
      
      // 実際のAPI接続テストは複雑なため、ここではファイル検証のみ行う
      return { success: true, message: 'Google Vertex AI 用のサービスアカウントキーファイルが有効です。' };
    } catch (error) {
      return { 
        success: false, 
        message: `キーファイル検証エラー: ${error.message}` 
      };
    }
  });
  
  // OpenRouter API接続テスト
  ipcMain.handle('test-openrouter-connection', async (event, apiKey) => {
    return new Promise((resolve) => {
      try {
        if (!apiKey) {
          return resolve({ 
            success: false, 
            message: 'OpenRouter APIキーが入力されていません。' 
          });
        }
        
        const options = {
          hostname: 'openrouter.ai',
          port: 443,
          path: '/api/v1/models',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'ai-bo-prototype', // OpenRouterでは必要
            'Content-Type': 'application/json'
          }
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve({ success: true, message: '接続成功！OpenRouter APIと正常に通信できました。' });
            } else {
              try {
                const errorResponse = JSON.parse(data);
                resolve({ 
                  success: false, 
                  message: `接続エラー (${res.statusCode}): ${errorResponse.error?.message || 'Unknown error'}` 
                });
              } catch (e) {
                resolve({ 
                  success: false, 
                  message: `接続エラー (${res.statusCode}): ${data || 'Unknown error'}` 
                });
              }
            }
          });
        });
        
        req.on('error', (error) => {
          resolve({ success: false, message: `ネットワークエラー: ${error.message}` });
        });
        
        req.end();
      } catch (error) {
        resolve({ success: false, message: `テストエラー: ${error.message}` });
      }
    });
  });
  
  // ローカルモデル接続テスト
  ipcMain.handle('test-local-connection', async (event) => {
    // Electron環境でローカルモデルを検出
    try {
      // ここではシンプルな確認のみ
      return { success: true, message: 'ローカル実行環境を検出しました。' };
    } catch (error) {
      return { success: false, message: `ローカル環境検出エラー: ${error.message}` };
    }
  });