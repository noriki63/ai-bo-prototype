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
      this.isElectron = this._checkElectronAvailability();
      
      console.log(`フロントエンドロガー初期化: Electron環境=${this.isElectron}`);
    }
    
    /**
     * Electron APIが利用可能かどうかをチェック
     * @private
     * @returns {boolean}
     */
    _checkElectronAvailability() {
        // Developer Toolsにデバッグ情報を出力
        console.log('Electron検出テスト:');
        console.log('- window.electronAPI:', window.electronAPI !== undefined);
        console.log('- window.electronAPI.logs:', window.electronAPI && window.electronAPI.logs !== undefined);
        console.log('- window.process:', window && window.process !== undefined);
        console.log('- window.process.type:', window && window.process && window.process.type);
        
        // IPCハンドラが実際に存在するか確認を追加
        if (window.electronAPI && window.electronAPI.logs) {
            console.log('- electronAPI.logs.getLogContent:', typeof window.electronAPI.logs.getLogContent === 'function');
            console.log('- electronAPI.logs.writeLog:', typeof window.electronAPI.logs.writeLog === 'function');
        }
        
        // より堅牢なチェック
        const isElectronEnv = !!(
            // electronAPIの存在確認（preload.jsで定義）- 最も信頼性の高い方法
            (window && window.electronAPI && window.electronAPI.logs) ||
            // 標準的なElectron検出
            (window && window.process && window.process.type) || 
            // location.protocolでfile:プロトコルを確認（Electron buildの場合）
            (window && window.location && window.location.protocol === 'file:')
        );
        
        console.log('Electron環境検出結果:', isElectronEnv);
        return isElectronEnv;
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
        console.warn('Electron環境でないためログを取得できません');
        return 'Electron環境でのみ利用可能です';
      }
      
      try {
        console.log(`ログコンテンツの取得を試みます (${lines}行)`);
        if (!window.electronAPI || !window.electronAPI.logs || !window.electronAPI.logs.getLogContent) {
          console.error('electronAPI.logs.getLogContent 関数が見つかりません');
          return 'ログ取得関数が利用できません。アプリを再起動してください。';
        }
        
        const content = await window.electronAPI.logs.getLogContent(lines);
        console.log(`ログコンテンツ取得成功: ${content?.length || 0}バイト`);
        return content;
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
      if (!this.isElectronEnv()) {
        console.warn('Electron環境でないためエラーログを取得できません');
        return 'Electron環境でのみ利用可能です';
      }
      
      try {
        console.log(`エラーログコンテンツの取得を試みます (${lines}行)`);
        if (!window.electronAPI || !window.electronAPI.logs || !window.electronAPI.logs.getErrorLogContent) {
          console.error('electronAPI.logs.getErrorLogContent 関数が見つかりません');
          return 'エラーログ取得関数が利用できません。アプリを再起動してください。';
        }
        
        const content = await window.electronAPI.logs.getErrorLogContent(lines);
        console.log(`エラーログコンテンツ取得成功: ${content?.length || 0}バイト`);
        return content;
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
      if (!this.isElectronEnv()) {
        console.warn('Electron環境でないためログファイル一覧を取得できません');
        return [];
      }
      
      try {
        console.log('ログファイル一覧の取得を試みます');
        if (!window.electronAPI || !window.electronAPI.logs || !window.electronAPI.logs.getLogFiles) {
          console.error('electronAPI.logs.getLogFiles 関数が見つかりません');
          return [];
        }
        
        const files = await window.electronAPI.logs.getLogFiles();
        console.log(`ログファイル一覧取得成功: ${files.length}ファイル`);
        return files;
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
        
        if (this.isElectronEnv() && window.electronAPI && window.electronAPI.logs && window.electronAPI.logs.setLogLevel) {
          window.electronAPI.logs.setLogLevel(level).catch(err => {
            console.error('ログレベル設定エラー:', err);
          });
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
      if (this.isElectronEnv() && window.electronAPI && window.electronAPI.logs && window.electronAPI.logs.writeLog) {
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