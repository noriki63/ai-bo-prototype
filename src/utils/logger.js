const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const electron = require('electron');

/**
 * AI棒ロガークラス
 * 
 * アプリケーションのログを管理し、ファイルとコンソールに出力します。
 * メインプロセスとレンダラープロセスの両方で使用可能です。
 */
class AIBoLogger {
  constructor() {
    // Electronのアプリケーションオブジェクト取得
    this.electronApp = electron.app || (electron.remote && electron.remote.app);
    
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
    
    // ログファイルパス設定
    this.logDir = this._getLogDirectory();
    this.logFile = path.join(this.logDir, 'aibo.log');
    this.errorLogFile = path.join(this.logDir, 'aibo-error.log');
    
    // ログファイルの最大サイズ (5MB)
    this.maxLogSize = 5 * 1024 * 1024;
    
    // ログディレクトリの作成
    this._ensureLogDirectoryExists();
    
    // 古いログをアーカイブ
    this._rotateLogsIfNeeded();
  }
  
  /**
   * ログディレクトリを取得
   * @private
   * @returns {string} ログディレクトリのパス
   */
  _getLogDirectory() {
    if (this.electronApp) {
      // ユーザーのアプリデータディレクトリ内にlogsディレクトリを作成
      return path.join(this.electronApp.getPath('userData'), 'logs');
    } else {
      // フォールバック (ブラウザ環境など)
      return path.join(__dirname, '..', '..', 'logs');
    }
  }
  
  /**
   * ログディレクトリが存在することを確認
   * @private
   */
  _ensureLogDirectoryExists() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('ログディレクトリの作成に失敗しました:', error);
    }
  }
  
  /**
   * ログファイルのサイズを確認し、必要に応じてローテーション
   * @private
   */
  _rotateLogsIfNeeded() {
    try {
      // 通常ログファイルのローテーション
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxLogSize) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          const archiveLogFile = path.join(this.logDir, `aibo-${timestamp}.log`);
          fs.renameSync(this.logFile, archiveLogFile);
        }
      }
      
      // エラーログファイルのローテーション
      if (fs.existsSync(this.errorLogFile)) {
        const stats = fs.statSync(this.errorLogFile);
        if (stats.size > this.maxLogSize) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          const archiveLogFile = path.join(this.logDir, `aibo-error-${timestamp}.log`);
          fs.renameSync(this.errorLogFile, archiveLogFile);
        }
      }
    } catch (error) {
      console.error('ログローテーションに失敗しました:', error);
    }
  }
  
  /**
   * ログを出力
   * @private
   * @param {string} level - ログレベル
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  _log(level, message, data = null) {
    if (this.levels[level] < this.currentLevel) {
      return;
    }
    
    try {
      const timestamp = new Date().toISOString();
      const processType = this._isRenderer() ? 'RENDERER' : 'MAIN';
      const formattedData = data ? JSON.stringify(data) : '';
      const logEntry = `[${timestamp}] [${processType}] [${level}] ${message} ${formattedData}`.trim() + '\n';
      
      // コンソール出力
      switch (level) {
        case 'DEBUG':
          console.debug(logEntry);
          break;
        case 'INFO':
          console.info(logEntry);
          break;
        case 'WARN':
          console.warn(logEntry);
          break;
        case 'ERROR':
        case 'FATAL':
          console.error(logEntry);
          break;
        default:
          console.log(logEntry);
      }
      
      // ファイル出力（通常ログ）
      fs.appendFileSync(this.logFile, logEntry);
      
      // エラーレベルならエラーログにも出力
      if (level === 'ERROR' || level === 'FATAL') {
        fs.appendFileSync(this.errorLogFile, logEntry);
      }
    } catch (error) {
      console.error('ログ出力に失敗しました:', error);
    }
  }
  
  /**
   * レンダラープロセスかどうかを判定
   * @private
   * @returns {boolean}
   */
  _isRenderer() {
    return process && process.type === 'renderer';
  }
  
  /**
   * ログレベルを設定
   * @param {string} level - ログレベル (DEBUG, INFO, WARN, ERROR, FATAL)
   */
  setLogLevel(level) {
    if (this.levels[level] !== undefined) {
      this.currentLevel = this.levels[level];
    } else {
      this._log('WARN', `無効なログレベル: ${level}`);
    }
  }
  
  /**
   * ログファイルの内容を取得
   * @param {number} lines - 取得する行数（デフォルト: 100）
   * @returns {Promise<string>} ログファイルの内容
   */
  async getLogContent(lines = 100) {
    try {
      if (!fs.existsSync(this.logFile)) {
        return '';
      }
      
      const content = await fs.promises.readFile(this.logFile, 'utf8');
      const logLines = content.split('\n');
      const recentLines = logLines.slice(-lines);
      return recentLines.join('\n');
    } catch (error) {
      console.error('ログファイルの読み込みに失敗しました:', error);
      return '';
    }
  }
  
  /**
   * エラーログファイルの内容を取得
   * @param {number} lines - 取得する行数（デフォルト: 100）
   * @returns {Promise<string>} エラーログファイルの内容
   */
  async getErrorLogContent(lines = 100) {
    try {
      if (!fs.existsSync(this.errorLogFile)) {
        return '';
      }
      
      const content = await fs.promises.readFile(this.errorLogFile, 'utf8');
      const logLines = content.split('\n');
      const recentLines = logLines.slice(-lines);
      return recentLines.join('\n');
    } catch (error) {
      console.error('エラーログファイルの読み込みに失敗しました:', error);
      return '';
    }
  }
  
  /**
   * ログファイルの一覧を取得
   * @returns {Promise<Array>} ログファイル情報の配列
   */
  async getLogFiles() {
    try {
      const files = await fs.promises.readdir(this.logDir);
      const logFiles = [];
      
      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = await fs.promises.stat(filePath);
        
        logFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
      
      return logFiles.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('ログファイル一覧の取得に失敗しました:', error);
      return [];
    }
  }
  
  /**
   * デバッグレベルのログを出力
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  debug(message, data) {
    this._log('DEBUG', message, data);
  }
  
  /**
   * 情報レベルのログを出力
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  info(message, data) {
    this._log('INFO', message, data);
  }
  
  /**
   * 警告レベルのログを出力
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  warn(message, data) {
    this._log('WARN', message, data);
  }
  
  /**
   * エラーレベルのログを出力
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  error(message, data) {
    this._log('ERROR', message, data);
  }
  
  /**
   * 致命的エラーレベルのログを出力
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加データ
   */
  fatal(message, data) {
    this._log('FATAL', message, data);
  }
}

// シングルトンインスタンス
const logger = new AIBoLogger();
module.exports = logger;