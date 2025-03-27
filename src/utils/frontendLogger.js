// src/utils/frontendLogger.js

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
      
      // Electron API が利用可能かどうか
      this.isElectron = window.electronAPI !== undefined;
    }
    
    /**
     * Electron環境かどうかを確認
     * @returns {boolean}
     */
    isElectronEnv() {
      return this.isElectron;
    }
    
    /**
     * ログの内容を取得
     * @param {number} lines - 取得する行数
     * @returns {Promise<string>} ログの内容
     */
    async getLogContent(lines = 100) {
      if (!this.isElectronEnv()) {
        return 'Electron環境でのみ利用可能です';
      }
      return await window.electronAPI.logs.getLogContent(lines);
    }
    
    /**
     * エラーログの内容を取得
     * @param {number} lines - 取得する行数
     * @returns {Promise<string>} エラーログの内容
     */
    async getErrorLogContent(lines = 100) {
      if (!this.isElectronEnv()) {
        return 'Electron環境でのみ利用可能です';
      }
      return await window.electronAPI.logs.getErrorLogContent(lines);
    }
    
    /**
     * ログファイルの一覧を取得
     * @returns {Promise<Array>} ログファイル情報の配列
     */
    async getLogFiles() {
      if (!this.isElectronEnv()) {
        return [];
      }
      return await window.electronAPI.logs.getLogFiles();
    }
    
    /**
     * ログレベルを設定
     * @param {string} level - ログレベル (DEBUG, INFO, WARN, ERROR, FATAL)
     */
    setLogLevel(level) {
      if (this.levels[level] !== undefined) {
        this.currentLevel = this.levels[level];
        
        if (this.isElectronEnv()) {
          window.electronAPI.logs.setLogLevel(level).catch(err => {
            console.error('ログレベル設定エラー:', err);
          });
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
      if (this.isElectronEnv()) {
        try {
          // データをJSON文字列に変換（nullの場合は空オブジェクト）
          const dataStr = data ? JSON.stringify(data) : '{}';
          
          // メインプロセスにログを送信
          window.electronAPI.logs.writeLog(level, message, dataStr).catch(err => {
            console.error('ログ送信エラー:', err);
          });
        } catch (error) {
          console.error('ログ変換/送信エラー:', error);
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