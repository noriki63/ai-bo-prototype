import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/frontendLogger';
import './LogViewer.css';

const LogViewer = () => {
  const navigate = useNavigate();
  const [logContent, setLogContent] = useState('');
  const [errorLogContent, setErrorLogContent] = useState('');
  const [logFiles, setLogFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('normal');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lines, setLines] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [electronStatus, setElectronStatus] = useState({
    detected: false,
    message: 'Electron環境を確認中...',
    error: null
  });
  
  // ログの直接読み込み (ipcRendererを使わず直接表示)
  const [directLog, setDirectLog] = useState([]);
  
  // Electron環境の検出と詳細レポート
  useEffect(() => {
    checkElectronEnvironment();
  }, []);

  // 追加: 初期化時にelectronAPIをチェック
  useEffect(() => {
    // API検出の診断を実行
    checkElectronAPI();
  }, []);

  // 追加: electronAPIの検出を直接チェックするヘルパー関数
  const checkElectronAPI = () => {
    console.log("========== ELECTRON API 診断 ==========");
    // windowオブジェクトの存在確認
    console.log("window存在:", typeof window !== 'undefined');
    
    // electronAPIの存在確認
    if (typeof window !== 'undefined') {
      console.log("electronAPI存在:", typeof window.electronAPI !== 'undefined');
      
      // electronAPI内の各APIをチェック
      if (typeof window.electronAPI !== 'undefined') {
        const api = window.electronAPI;
        console.log("- checkAPI:", typeof api.checkAPI === 'function' ? "利用可能" : "未定義");
        console.log("- logs:", typeof api.logs !== 'undefined' ? "利用可能" : "未定義");
        
        // checkAPIメソッドが存在する場合は呼び出してみる
        if (typeof api.checkAPI === 'function') {
          const result = api.checkAPI();
          console.log("checkAPI結果:", result);
        }
        
        // logs APIの詳細を確認
        if (typeof api.logs !== 'undefined') {
          const logsAPI = api.logs;
          console.log("  - getLogContent:", typeof logsAPI.getLogContent === 'function' ? "利用可能" : "未定義");
          console.log("  - getErrorLogContent:", typeof logsAPI.getErrorLogContent === 'function' ? "利用可能" : "未定義");
          console.log("  - getLogFiles:", typeof logsAPI.getLogFiles === 'function' ? "利用可能" : "未定義");
          console.log("  - setLogLevel:", typeof logsAPI.setLogLevel === 'function' ? "利用可能" : "未定義");
          console.log("  - writeLog:", typeof logsAPI.writeLog === 'function' ? "利用可能" : "未定義");
        }
      }
    }
    
    // 診断結果をディレクトログに追加
    setDirectLog(prev => [
      ...prev,
      "[DIAG] Electron API診断を実行しました",
      `[DIAG] window.electronAPI存在: ${typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined'}`,
      `[DIAG] window.electronAPI.logs存在: ${typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined' && typeof window.electronAPI.logs !== 'undefined'}`
    ]);
    
    console.log("===================================");
  };

  const generateFallbackLog = () => {
    // クライアント側で生成したログエントリを返す
    const timestamp = new Date().toISOString();
    return [
      `[${timestamp}] [FRONTEND] [INFO] LogViewer: フォールバックログが生成されました`,
      `[${timestamp}] [FRONTEND] [INFO] Electron環境状態: ${JSON.stringify(electronStatus.details || {})}`,
      `[${timestamp}] [FRONTEND] [INFO] ブラウザ情報: ${navigator.userAgent}`,
      ...directLog
    ].join('\n');
  };
  
  // Electron環境を詳細にチェックする関数
  const checkElectronEnvironment = () => {
    try {
      console.log("Electron環境の詳細チェックを開始");
      
      // まず直接アクセスできるか試みる
      checkElectronAPI();
      
      const checks = {
        windowExists: !!window,
        electronAPIExists: !!(window && window.electronAPI),
        logsAPIExists: !!(window && window.electronAPI && window.electronAPI.logs),
        getLogContentExists: !!(window && window.electronAPI && window.electronAPI.logs && 
                             typeof window.electronAPI.logs.getLogContent === 'function'),
        writeLogExists: !!(window && window.electronAPI && window.electronAPI.logs && 
                        typeof window.electronAPI.logs.writeLog === 'function'),
        processExists: !!(window && window.process),
        processTypeExists: !!(window && window.process && window.process.type)
      };
      
      // API参照をデバッグ
      if (window.electronAPI) {
        console.log("electronAPI構造:", Object.keys(window.electronAPI));
        if (window.electronAPI.logs) {
          console.log("logs API構造:", Object.keys(window.electronAPI.logs));
        } else {
          console.log("logs APIが見つかりません");
        }
      }
      
      console.log("Electron環境チェック結果:", checks);
      
      // ロガー経由でログを記録
      logger.info('Electron環境チェック結果', checks);
      
      // Electron環境の状態を更新
      const isElectronEnv = checks.logsAPIExists && checks.getLogContentExists;
      setElectronStatus({
        detected: isElectronEnv,
        message: isElectronEnv 
          ? 'Electron環境を正常に検出しました' 
          : 'Electron環境が検出できません。クライアント側ログのみ表示します。',
        error: null,
        details: checks
      });
      
      // DirectLogに情報を追加
      const detailsText = Object.entries(checks)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
        
      setDirectLog(prev => [
        ...prev,
        '[INFO] ログビューア起動',
        `[INFO] Electron API状態: ${isElectronEnv ? '利用可能' : '利用不可'}`,
        '[INFO] Electron環境チェック詳細:',
        detailsText
      ]);
      
      // ただし、Electron APIがなくてもgetSystemInfoだけは試してみる
      if (window.electronAPI && typeof window.electronAPI.getSystemInfo === 'function') {
        window.electronAPI.getSystemInfo()
          .then(info => {
            console.log("システム情報取得成功:", info);
            setDirectLog(prev => [
              ...prev,
              '[DIAG] システム情報取得成功',
              `[DIAG] プラットフォーム: ${info.platform}`,
              `[DIAG] アーキテクチャ: ${info.arch}`
            ]);
          })
          .catch(err => {
            console.error("システム情報取得エラー:", err);
          });
      }
      
      // Electron環境が利用可能ならすぐにログを読み込み
      if (isElectronEnv) {
        loadLogs();
        loadLogFiles();
      }
    } catch (error) {
      console.error("Electron環境チェック中にエラー:", error);
      setElectronStatus({
        detected: false,
        message: 'Electron環境チェック中にエラーが発生しました',
        error: error.message
      });
    }
  };
  
  // コンポーネントマウント時に実行
  useEffect(() => {
    // テストログを生成
    addDirectLog('INFO', 'ログビューアでテストログを生成');
    
    // 通常のログ読み込みも試行
    if (electronStatus.detected) {
      loadLogs();
    }
    
    // 定期更新設定
    if (refreshInterval) {
      const intervalId = setInterval(() => {
        if (electronStatus.detected) {
          loadLogs();
        }
        // 定期的なダミーログも追加
        addDirectLog('INFO', '定期更新チェック');
      }, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab, refreshInterval, lines, electronStatus.detected]);
  
  // 直接ログを追加する関数
  const addDirectLog = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message} ${data ? JSON.stringify(data) : ''}`;
    
    setDirectLog(prev => {
      const newLogs = [...prev, logEntry];
      // 最大100行まで保持
      if (newLogs.length > 100) {
        return newLogs.slice(-100);
      }
      return newLogs;
    });
    
    // 実際にロガーも使用
    logger[level.toLowerCase()](message, data);
  };
  
  // ログ一覧の取得
  useEffect(() => {
    if (electronStatus.detected) {
      loadLogFiles();
    }
  }, [electronStatus.detected]);
  
  // ログコンテンツの読み込み
  const loadLogs = async () => {
    if (!electronStatus.detected) {
      setLogContent(generateFallbackLog());
      setErrorLogContent('Electron環境が検出できないため、エラーログは利用できません。');
      return;
    }
    
    setIsLoading(true);
    console.log("ログ読み込み処理を開始します");
    addDirectLog('DEBUG', 'ログ読み込み処理開始');
    
    try {
      if (activeTab === 'normal') {
        console.log(`通常ログを${lines}行取得します`);
        try {
          console.log("window.electronAPI.logs:", window.electronAPI.logs);
          console.log("window.electronAPI.logs.getLogContent:", window.electronAPI.logs.getLogContent);
          const content = await window.electronAPI.logs.getLogContent(lines);
          console.log("取得したログ内容の長さ:", content?.length || 0);
          setLogContent(content || 'ログは空です。');
          addDirectLog('INFO', 'ログ読み込み成功');
        } catch (error) {
          console.error("getLogContent呼び出しエラー:", error);
          setLogContent(`ログ取得中にエラーが発生しました: ${error.message}`);
          addDirectLog('ERROR', 'ログ読み込み失敗', { error: error.message });
        }
      } else if (activeTab === 'error') {
        console.log(`エラーログを${lines}行取得します`);
        try {
          const content = await window.electronAPI.logs.getErrorLogContent(lines);
          console.log("取得したエラーログ内容の長さ:", content?.length || 0);
          setErrorLogContent(content || 'エラーログは空です。');
          addDirectLog('INFO', 'エラーログ読み込み成功');
        } catch (error) {
          console.error("getErrorLogContent呼び出しエラー:", error);
          setErrorLogContent(`エラーログ取得中にエラーが発生しました: ${error.message}`);
          addDirectLog('ERROR', 'エラーログ読み込み失敗', { error: error.message });
        }
      }
    } catch (error) {
      console.error('ログ読み込みエラー詳細:', error);
      addDirectLog('ERROR', 'ログ読み込み失敗', { error: error.message });
      if (activeTab === 'normal') {
        setLogContent(`ログの読み込みに失敗しました: ${error.message}`);
      } else {
        setErrorLogContent(`エラーログの読み込みに失敗しました: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // ログファイル一覧の読み込み
  const loadLogFiles = async () => {
    if (!electronStatus.detected) {
      return;
    }
    
    try {
      addDirectLog('DEBUG', 'ログファイル一覧取得開始');
      const files = await window.electronAPI.logs.getLogFiles();
      console.log(`${files.length}個のログファイルを取得しました`);
      setLogFiles(files);
      addDirectLog('INFO', 'ログファイル一覧取得成功', { count: files.length });
    } catch (error) {
      console.error('ログファイル一覧の取得に失敗しました:', error);
      addDirectLog('ERROR', 'ログファイル一覧取得失敗', { error: error.message });
    }
  };
  
  // ログの自動更新設定変更
  const handleRefreshChange = (e) => {
    const value = e.target.value;
    setRefreshInterval(value ? parseInt(value) : null);
  };
  
  // 表示行数変更
  const handleLinesChange = (e) => {
    setLines(parseInt(e.target.value));
  };
  
  // ログレベル変更
  const handleLogLevelChange = (e) => {
    const level = e.target.value;
    logger.setLogLevel(level);
    addDirectLog('INFO', `ログレベルを${level}に変更しました`);
  };
  
  // 手動更新
  const handleRefresh = () => {
    addDirectLog('INFO', '手動更新実行');
    loadLogs();
    if (electronStatus.detected) {
      loadLogFiles();
    }
  };
  
  // 環境状態再チェック
  const recheckEnvironment = () => {
    addDirectLog('INFO', 'Electron環境を再チェックします');
    checkElectronEnvironment();
  };
  
  // テストログ生成
  const generateTestLog = () => {
    addDirectLog('DEBUG', 'テストデバッグログ', { source: 'LogViewer', test: true });
    addDirectLog('INFO', 'テスト情報ログ', { source: 'LogViewer', test: true });
    addDirectLog('WARN', 'テスト警告ログ', { source: 'LogViewer', test: true });
    addDirectLog('ERROR', 'テストエラーログ', { source: 'LogViewer', test: true });
    console.log('テストログを生成しました');
    
    // すぐにログを再読み込み
    setTimeout(() => {
      loadLogs();
      if (electronStatus.detected) {
        loadLogFiles();
      }
    }, 500);
  };
  
  // ファイルサイズのフォーマット
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 日付フォーマット
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="log-viewer-container">
      <h2>ログビューア</h2>
      
      {/* Electron環境状態表示 */}
      <div className="electron-status">
        <div className={`status-indicator ${electronStatus.detected ? 'success' : 'error'}`}>
          {electronStatus.message}
          {electronStatus.error && <div className="error-details">{electronStatus.error}</div>}
        </div>
        <button onClick={recheckEnvironment} className="recheck-button">
          環境再チェック
        </button>
      </div>
      
      <div className="log-controls">
        <div className="control-group">
          <label>
            表示行数:
            <select value={lines} onChange={handleLinesChange}>
              <option value="50">50行</option>
              <option value="100">100行</option>
              <option value="500">500行</option>
              <option value="1000">1000行</option>
            </select>
          </label>
          
          <label>
            自動更新:
            <select value={refreshInterval || ''} onChange={handleRefreshChange}>
              <option value="">無効</option>
              <option value="5">5秒</option>
              <option value="10">10秒</option>
              <option value="30">30秒</option>
              <option value="60">1分</option>
            </select>
          </label>
          
          <label>
            ログレベル:
            <select onChange={handleLogLevelChange} defaultValue="INFO">
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="FATAL">FATAL</option>
            </select>
          </label>
          
          <button onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? '読込中...' : '更新'}
          </button>
          
          <button onClick={generateTestLog} style={{ marginLeft: '10px' }}>
            テストログ生成
          </button>
        </div>
        
        <div className="tab-buttons">
          <button 
            className={activeTab === 'normal' ? 'active' : ''} 
            onClick={() => setActiveTab('normal')}
          >
            通常ログ
          </button>
          <button 
            className={activeTab === 'error' ? 'active' : ''} 
            onClick={() => setActiveTab('error')}
          >
            エラーログ
          </button>
          <button 
            className={activeTab === 'files' ? 'active' : ''} 
            onClick={() => { setActiveTab('files'); if (electronStatus.detected) loadLogFiles(); }}
          >
            ログファイル
          </button>
        </div>
      </div>
      
      <div className="log-content-container">
        {activeTab === 'normal' && (
          <div className="log-content">
            <pre>{logContent || directLog.join('\n')}</pre>
          </div>
        )}
        
        {activeTab === 'error' && (
          <div className="log-content error-log">
            <pre>{errorLogContent || '直接エラーログはありません。'}</pre>
          </div>
        )}
        
        {activeTab === 'files' && (
          <div className="log-files">
            {electronStatus.detected ? (
              <table>
                <thead>
                  <tr>
                    <th>ファイル名</th>
                    <th>サイズ</th>
                    <th>更新日時</th>
                  </tr>
                </thead>
                <tbody>
                  {logFiles.length > 0 ? (
                    logFiles.map((file, index) => (
                      <tr key={index}>
                        <td>{file.name}</td>
                        <td>{formatFileSize(file.size)}</td>
                        <td>{formatDate(file.modified)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data">ログファイルがありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="no-data" style={{ padding: '20px' }}>
                Electron APIが利用できないため、ログファイル一覧を表示できません。
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="button-group">
        <button onClick={() => navigate('/settings')}>
          設定に戻る
        </button>
      </div>
    </div>
  );
};

export default LogViewer;