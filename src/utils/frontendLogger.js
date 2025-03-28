/**
 * フロントエンドロガークラス
 * 
 * Reactコンポーネントからログを記録するためのユーティリティクラス。
 * メインプロセスのロガーと連携し、アプリケーション全体でログを統一します。
 */
class FrontendLogger {
    constructor() {
      // ログレベル定義
      this.levels = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4,
      };
      
      // デフォルトのログレベル
      this.currentLevel = this.levels.INFO;
      
      // ログのローカルバッファ（API利用不可時用）
      this.logBuffer = [];
      
      // 初期化状態
      this.initialized = false;
      this.initializeAttempted = false;
      
      // Electron API が利用可能かどうか（初期化時に確認）
      this.isElectron = false;
      this.hasLogsAPI = false;
      
      // 初期化
      this._initialize();
      
      console.log(`フロントエンドロガー初期化開始...`);
    }
    
    /**
     * ロガーを初期化し、Electron環境を検出する
     * @private
     */
    _initialize() {
      if (this.initializeAttempted) return;
      this.initializeAttempted = true;

      // electronAPIの利用可能性をチェック
      if (window && window.electronAPI) {
        this.isElectron = true;
        
        // API初期化状態を確認（新メソッド）
        if (typeof window.electronAPI.isInitialized === 'function') {
          const isInitialized = window.electronAPI.isInitialized();
          if (isInitialized) {
            this.initialized = true;
            this.hasLogsAPI = true;
            console.log('フロントエンドロガー: Electron API 初期化済み');
          } else {
            console.log('フロントエンドロガー: Electron API 初期化待機中');
            // APIが初期化完了したら再度チェック
            this._waitForApiInitialization();
          }
        } else {
          // 従来の方法でチェック
          this.hasLogsAPI = this._checkLogsAPI();
          if (this.hasLogsAPI) {
            this.initialized = true;
            console.log('フロントエンドロガー: 従来API検出済み');
          } else {
            console.log('フロントエンドロガー: Electron API検出済み、ログAPI利用不可');
          }
        }
      } else {
        console.log('フロントエンドロガー: Electron API未検出');
        this.isElectron = false;
        this.hasLogsAPI = false;
      }
      
      // アプリケーション終了時にバッファを送信
      if (window) {
        window.addEventListener('beforeunload', () => {
          this._flushLogBuffer();
        });
      }
      
      // 診断ログ出力
      const diagnostics = {
        electronAPIExists: this.isElectron,
        logsAPIAvailable: this.hasLogsAPI,
        initialized: this.initialized
      };
      console.log('フロントエンドロガー初期化完了:', diagnostics);
    }
    
    /**
     * APIの初期化を待機する
     * @private
     */
    _waitForApiInitialization() {
      // 最大10秒間待機
      let attempts = 0;
      const maxAttempts = 20; // 500ms x 20 = 10秒
      
      const checkInitialization = () => {
        if (window && window.electronAPI && typeof window.electronAPI.isInitialized === 'function') {
          if (window.electronAPI.isInitialized()) {
            this.initialized = true;
            this.hasLogsAPI = true;
            console.log('フロントエンドロガー: Electron API 初期化完了');
            this._flushLogBuffer(); // バッファされたログを送信
            return;
          }
        } else if (window && window.electronAPI) {
          // 従来の方法でチェック
          this.hasLogsAPI = this._checkLogsAPI();
          if (this.hasLogsAPI) {
            this.initialized = true;
            console.log('フロントエンドロガー: 従来API利用可能');
            this._flushLogBuffer(); // バッファされたログを送信
            return;
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkInitialization, 500);
        } else {
          console.warn('フロントエンドロガー: API初期化タイムアウト、ローカルログのみ使用');
        }
      };
      
      checkInitialization();
    }
    
    /**
     * ログAPIが利用可能かチェック
     * @private
     * @returns {boolean}
     */
    _checkLogsAPI() {
      // 直接メソッドをチェック
      const hasDirectMethods = window.electronAPI && 
          typeof window.electronAPI.writeLog === 'function' &&
          typeof window.electronAPI.getLogContent === 'function';
      
      // 従来のネストされたメソッドをチェック
      const hasNestedMethods = window.electronAPI && 
          window.electronAPI.logs && 
          typeof window.electronAPI.logs.writeLog === 'function' &&
          typeof window.electronAPI.logs.getLogContent === 'function';
          
      return hasDirectMethods || hasNestedMethods;
    }
    
    /**
     * Electron環境かどうかを確認
     * @returns {boolean}
     */
    isElectronEnv() {
      return this.isElectron;
    }
    
    /**
     * ログAPIが利用可能かどうかを確認
     * @returns {boolean}
     */
    isLogsAPIAvailable() {
      return this.hasLogsAPI && this.initialized;
    }
    
    /**
     * バッファされたログを送信
     * @private
     */
    _flushLogBuffer() {
      if (!this.isLogsAPIAvailable() || this.logBuffer.length === 0) return;
      
      console.log(`フロントエンドロガー: ${this.logBuffer.length}件のバッファログを送信`);
      
      // バッファからログを取り出して送信
      for (const logEntry of this.logBuffer) {
        const { level, message, data } = logEntry;
        this._sendLogToMain(level, message, data);
      }
      
      // バッファをクリア
      this.logBuffer = [];
    }
    
    /**
     * ログをメインプロセスに送信
     * @private
     * @param {string} level - ログレベル
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    _sendLogToMain(level, message, data) {
      if (!this.isElectronEnv()) return;
      
      try {
        // データをJSON文字列に変換（nullの場合は空オブジェクト）
        const dataStr = data ? JSON.stringify(data) : '{}';
        
        // 直接メソッドを試す
        if (window.electronAPI && typeof window.electronAPI.writeLog === 'function') {
          window.electronAPI.writeLog(level, message, dataStr).catch(err => {
            console.error('ログ送信エラー (直接API):', err);
          });
          return;
        }
        
        // 従来メソッドを試す
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.writeLog === 'function') {
          window.electronAPI.logs.writeLog(level, message, dataStr).catch(err => {
            console.error('ログ送信エラー (従来API):', err);
          });
          return;
        }
      } catch (error) {
        console.error('ログ変換/送信エラー:', error);
      }
    }
    
    /**
     * ログの内容を取得
     * @param {number} lines - 取得する行数
     * @returns {Promise<string>} ログの内容
     */
    async getLogContent(lines = 100) {
      if (!this.isLogsAPIAvailable()) {
        console.warn('ログAPI利用不可のためログを取得できません');
        return 'ログAPIが利用できません';
      }
      
      try {
        // 直接メソッドを試す
        if (window.electronAPI && typeof window.electronAPI.getLogContent === 'function') {
          try {
            const content = await window.electronAPI.getLogContent(lines);
            return content || 'ログは空です';
          } catch (error) {
            console.error('直接APIでのログ取得エラー:', error);
            // 従来メソッドでリトライ
          }
        }
        
        // 従来メソッドを試す
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.getLogContent === 'function') {
          const content = await window.electronAPI.logs.getLogContent(lines);
          return content || 'ログは空です';
        }
        
        return 'ログ取得機能が利用できません';
      } catch (error) {
        console.error('ログコンテンツ取得エラー:', error);
        return `エラー: ${error.message}`;
      }
    }
    
    /**
     * エラーログの内容を取得
     * @param {number} lines - 取得する行数
     * @returns {Promise<string>} エラーログの内容
     */
    async getErrorLogContent(lines = 100) {
      if (!this.isLogsAPIAvailable()) {
        console.warn('ログAPI利用不可のためエラーログを取得できません');
        return 'ログAPIが利用できません';
      }
      
      try {
        // 直接メソッドを試す
        if (window.electronAPI && typeof window.electronAPI.getErrorLogContent === 'function') {
          try {
            const content = await window.electronAPI.getErrorLogContent(lines);
            return content || 'エラーログは空です';
          } catch (error) {
            console.error('直接APIでのエラーログ取得エラー:', error);
            // 従来メソッドでリトライ
          }
        }
        
        // 従来メソッドを試す
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.getErrorLogContent === 'function') {
          const content = await window.electronAPI.logs.getErrorLogContent(lines);
          return content || 'エラーログは空です';
        }
        
        return 'エラーログ取得機能が利用できません';
      } catch (error) {
        console.error('エラーログコンテンツ取得エラー:', error);
        return `エラー: ${error.message}`;
      }
    }
    
    /**
     * ログファイルの一覧を取得
     * @returns {Promise<Array>} ログファイル情報の配列
     */
    async getLogFiles() {
      if (!this.isLogsAPIAvailable()) {
        console.warn('ログAPI利用不可のためログファイル一覧を取得できません');
        return [];
      }
      
      try {
        // 直接メソッドを試す
        if (window.electronAPI && typeof window.electronAPI.getLogFiles === 'function') {
          try {
            return await window.electronAPI.getLogFiles();
          } catch (error) {
            console.error('直接APIでのログファイル一覧取得エラー:', error);
            // 従来メソッドでリトライ
          }
        }
        
        // 従来メソッドを試す
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.getLogFiles === 'function') {
          return await window.electronAPI.logs.getLogFiles();
        }
        
        return [];
      } catch (error) {
        console.error('ログファイル一覧取得エラー:', error);
        return [];
      }
    }
    
    /**
     * ログレベルを設定
     * @param {string} level - ログレベル (DEBUG, INFO, WARN, ERROR, FATAL)
     */
    setLogLevel(level) {
      if (this.levels[level] !== undefined) {
        console.log(`ログレベルを設定: ${level}`);
        this.currentLevel = this.levels[level];
        
        if (this.isLogsAPIAvailable()) {
          // 直接メソッドを試す
          if (window.electronAPI && typeof window.electronAPI.setLogLevel === 'function') {
            window.electronAPI.setLogLevel(level).catch(err => {
              console.error('ログレベル設定エラー (直接API):', err);
            });
            return;
          }
          
          // 従来メソッドを試す
          if (window.electronAPI && window.electronAPI.logs && 
              typeof window.electronAPI.logs.setLogLevel === 'function') {
            window.electronAPI.logs.setLogLevel(level).catch(err => {
              console.error('ログレベル設定エラー (従来API):', err);
            });
          }
        } else {
          console.warn('Electron環境でないためログレベルをメインプロセスに反映できません');
        }
      } else {
        console.warn(`無効なログレベル: ${level}`);
      }
    }
    
    /**
     * ログ出力（共通処理）
     * @private
     * @param {string} level - ログレベル
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    _log(level, message, data = null) {
      // ログレベルチェック
      if (this.levels[level] < this.currentLevel) {
        return;
      }
      
      // コンソール出力
      const timestamp = new Date().toISOString();
      const logPrefix = `[${timestamp}] [FRONTEND] [${level}]`;
      
      switch (level) {
        case 'DEBUG':
          console.debug(`${logPrefix} ${message}`, data);
          break;
        case 'INFO':
          console.info(`${logPrefix} ${message}`, data);
          break;
        case 'WARN':
          console.warn(`${logPrefix} ${message}`, data);
          break;
        case 'ERROR':
        case 'FATAL':
          console.error(`${logPrefix} ${message}`, data);
          break;
        default:
          console.log(`${logPrefix} ${message}`, data);
      }
      
      // Electron環境の場合、IPCを使ってメインプロセスにログを送信
      if (this.isLogsAPIAvailable()) {
        this._sendLogToMain(level, message, data);
      } else if (this.isElectronEnv()) {
        // ログAPIが初期化されていないためバッファに追加
        this.logBuffer.push({ level, message, data });
        
        // バッファが大きすぎる場合は古いログを削除
        if (this.logBuffer.length > 1000) {
          this.logBuffer.shift(); // 最も古いログを削除
        }
      }
    }
    
    /**
     * デバッグレベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    debug(message, data) {
      this._log('DEBUG', message, data);
    }
    
    /**
     * 情報レベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    info(message, data) {
      this._log('INFO', message, data);
    }
    
    /**
     * 警告レベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    warn(message, data) {
      this._log('WARN', message, data);
    }
    
    /**
     * エラーレベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    error(message, data) {
      this._log('ERROR', message, data);
    }
    
    /**
     * 致命的エラーレベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {Object} data - 追加データ
     */
    fatal(message, data) {
      this._log('FATAL', message, data);
    }
}

// シングルトンインスタンス
const logger = new FrontendLogger();
export default logger;