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
  
  // API初期化状態の追跡
  const [apiInitialized, setApiInitialized] = useState(false);
  // 待機中フラグ
  const [waitingForApi, setWaitingForApi] = useState(false);
  
  // ログの直接読み込み (ipcRendererを使わず直接表示)
  const [directLog, setDirectLog] = useState([]);
  
  // Electron環境の検出と詳細レポート
  useEffect(() => {
    // 初期実行時にタイムスタンプログを追加
    const timestamp = new Date().toISOString();
    setDirectLog([`[${timestamp}] LogViewer: コンポーネント初期化`]);
    
    // APIの初期化チェックを開始
    checkElectronAPI();
  }, []);

  // electronAPIの検出と初期化待機
  const checkElectronAPI = () => {
    console.log("========== ELECTRON API 診断 ==========");
    addDirectLog('INFO', 'Electron API診断開始');
    
    // 初期化されているかどうか確認する関数
    const checkInitialization = () => {
      if (window && window.electronAPI) {
        // APIの初期化状態確認メソッドを呼び出す（新API）
        if (typeof window.electronAPI.isInitialized === 'function') {
          const isInitialized = window.electronAPI.isInitialized();
          console.log("electronAPI初期化状態:", isInitialized);
          addDirectLog('DEBUG', `electronAPI.isInitialized()=${isInitialized}`);
          
          if (isInitialized) {
            // API初期化完了
            setApiInitialized(true);
            setWaitingForApi(false);
            setElectronStatus({
              detected: true,
              message: 'Electron API 初期化完了',
              error: null
            });
            
            // ログ機能テスト
            testLogFunctions();
            
            // ログとファイル一覧を読み込む
            loadLogs();
            loadLogFiles();
            return true;
          }
        } else {
          // 従来の方法でのチェック
          const hasLogs = window.electronAPI.logs && 
                         typeof window.electronAPI.logs.getLogContent === 'function';
          
          // 直接APIでのチェック（preload.js修正後）
          const hasDirectLogApi = typeof window.electronAPI.getLogContent === 'function';
          
          console.log("electronAPI.logs 存在:", hasLogs);
          console.log("electronAPI.getLogContent 存在:", hasDirectLogApi);
          addDirectLog('DEBUG', `logs API=${hasLogs}, 直接API=${hasDirectLogApi}`);
          
          if (hasLogs || hasDirectLogApi) {
            // API利用可能
            setApiInitialized(true);
            setWaitingForApi(false);
            setElectronStatus({
              detected: true,
              message: 'Electron API 利用可能',
              error: null
            });
            
            // ログ機能テスト
            testLogFunctions();
            
            // ログとファイル一覧を読み込む
            loadLogs();
            loadLogFiles();
            return true;
          }
        }
      }
      
      return false;
    };
    
    // API初期化を待機
    if (!checkInitialization()) {
      setWaitingForApi(true);
      addDirectLog('INFO', 'Electron API初期化待機中...');
      
      // 定期的にAPI初期化をチェック
      const intervalId = setInterval(() => {
        if (checkInitialization()) {
          // 初期化完了したら定期チェックを停止
          clearInterval(intervalId);
        }
      }, 300); // 300ms間隔でチェック
      
      // 10秒後にタイムアウト
      setTimeout(() => {
        if (!apiInitialized) {
          clearInterval(intervalId);
          setWaitingForApi(false);
          setElectronStatus({
            detected: false,
            message: 'Electron API初期化タイムアウト',
            error: 'APIの初期化に10秒以上かかったため、クライアント側ログのみ表示します。'
          });
          addDirectLog('ERROR', 'Electron API初期化タイムアウト');
        }
      }, 10000);
    }
    
    // 各種API存在確認の診断
    if (window && window.electronAPI) {
      // API構造を診断
      const api = window.electronAPI;
      const apiStructure = {
        checkAPI: typeof api.checkAPI === 'function',
        logs: typeof api.logs !== 'undefined',
        getLogContent: typeof api.getLogContent === 'function',
        getErrorLogContent: typeof api.getErrorLogContent === 'function',
        getLogFiles: typeof api.getLogFiles === 'function',
        writeLog: typeof api.writeLog === 'function'
      };
      
      console.log("API構造診断:", apiStructure);
      addDirectLog('DEBUG', `API構造: ${JSON.stringify(apiStructure)}`);
      
      // ログAPI構造の診断
      if (api.logs) {
        const logsStructure = {
          getLogContent: typeof api.logs.getLogContent === 'function',
          getErrorLogContent: typeof api.logs.getErrorLogContent === 'function', 
          getLogFiles: typeof api.logs.getLogFiles === 'function',
          writeLog: typeof api.logs.writeLog === 'function'
        };
        
        console.log("logs API構造診断:", logsStructure);
        addDirectLog('DEBUG', `logs構造: ${JSON.stringify(logsStructure)}`);
      }
    } else {
      console.log("electronAPIが見つかりません");
      addDirectLog('ERROR', 'electronAPIが見つかりません');
      setElectronStatus({
        detected: false,
        message: 'Electron APIが検出できません',
        error: 'window.electronAPIが未定義です'
      });
    }
    
    console.log("===================================");
  };
  
  // ログ機能のテスト実行
  const testLogFunctions = async () => {
    try {
      addDirectLog('INFO', 'ログ機能テスト開始');
      
      // 直接メソッドと従来メソッドを両方テスト
      const testDirectGetLog = async () => {
        if (window.electronAPI && typeof window.electronAPI.getLogContent === 'function') {
          try {
            const result = await window.electronAPI.getLogContent(10);
            const success = typeof result === 'string';
            addDirectLog('DEBUG', `直接getLogContentテスト: ${success ? '成功' : '失敗'}`);
            return success;
          } catch (error) {
            addDirectLog('ERROR', `直接getLogContentテスト失敗: ${error.message}`);
            return false;
          }
        }
        return false;
      };
      
      const testNestedGetLog = async () => {
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.getLogContent === 'function') {
          try {
            const result = await window.electronAPI.logs.getLogContent(10);
            const success = typeof result === 'string';
            addDirectLog('DEBUG', `従来getLogContentテスト: ${success ? '成功' : '失敗'}`);
            return success;
          } catch (error) {
            addDirectLog('ERROR', `従来getLogContentテスト失敗: ${error.message}`);
            return false;
          }
        }
        return false;
      };
      
      // 両方のメソッドをテスト
      const directSuccess = await testDirectGetLog();
      const nestedSuccess = await testNestedGetLog();
      
      if (directSuccess || nestedSuccess) {
        addDirectLog('INFO', 'ログ機能テスト成功');
      } else {
        addDirectLog('ERROR', 'ログ機能テスト失敗');
      }
    } catch (error) {
      addDirectLog('ERROR', `ログ機能テスト中にエラー: ${error.message}`);
    }
  };

  // フォールバックログの生成
  const generateFallbackLog = () => {
    // クライアント側で生成したログエントリを返す
    return directLog.join('\n');
  };
  
  // コンポーネントマウント時に実行
  useEffect(() => {
    // 定期更新設定
    if (refreshInterval) {
      const intervalId = setInterval(() => {
        if (apiInitialized) {
          loadLogs();
        }
        // 定期的なダミーログも追加
        addDirectLog('INFO', '定期更新チェック');
      }, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab, refreshInterval, lines, apiInitialized]);
  
  // 直接ログを追加する関数
  const addDirectLog = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? JSON.stringify(data) : '';
    const logEntry = `[${timestamp}] [${level}] ${message} ${dataStr}`.trim();
    
    setDirectLog(prev => {
      const newLogs = [...prev, logEntry];
      // 最大1000行まで保持
      if (newLogs.length > 1000) {
        return newLogs.slice(-1000);
      }
      return newLogs;
    });
    
    // 実際にロガーも使用
    if (level === 'DEBUG') logger.debug(message, data);
    else if (level === 'INFO') logger.info(message, data);
    else if (level === 'WARN') logger.warn(message, data);
    else if (level === 'ERROR') logger.error(message, data);
    else logger.info(message, data);
  };
  
  // ログコンテンツの読み込み
  const loadLogs = async () => {
    if (!apiInitialized) {
      setLogContent(generateFallbackLog());
      setErrorLogContent('Electron APIが初期化されていないため、エラーログは利用できません。');
      return;
    }
    
    setIsLoading(true);
    addDirectLog('DEBUG', 'ログ読み込み処理開始');
    
    try {
      if (activeTab === 'normal') {
        addDirectLog('DEBUG', `通常ログを${lines}行取得します`);
        
        // 直接メソッドを試す
        if (window.electronAPI && typeof window.electronAPI.getLogContent === 'function') {
          try {
            const content = await window.electronAPI.getLogContent(lines);
            setLogContent(content || 'ログは空です。');
            addDirectLog('INFO', 'ログ読み込み成功（直接API）');
            setIsLoading(false);
            return;
          } catch (error) {
            addDirectLog('ERROR', `直接APIでのログ読み込み失敗: ${error.message}`);
            // 従来メソッドでリトライ
          }
        }
        
        // 従来メソッドを試す
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.getLogContent === 'function') {
          try {
            const content = await window.electronAPI.logs.getLogContent(lines);
            setLogContent(content || 'ログは空です。');
            addDirectLog('INFO', 'ログ読み込み成功（従来API）');
          } catch (error) {
            addDirectLog('ERROR', `従来APIでのログ読み込み失敗: ${error.message}`);
            setLogContent(`ログ取得中にエラーが発生しました: ${error.message}\n\n${generateFallbackLog()}`);
          }
        } else {
          // どちらの方法も使えない場合
          setLogContent(generateFallbackLog());
          addDirectLog('WARN', 'ログ読み込み機能が利用できないためフォールバック');
        }
      } else if (activeTab === 'error') {
        addDirectLog('DEBUG', `エラーログを${lines}行取得します`);
        
        // 直接メソッドを試す
        if (window.electronAPI && typeof window.electronAPI.getErrorLogContent === 'function') {
          try {
            const content = await window.electronAPI.getErrorLogContent(lines);
            setErrorLogContent(content || 'エラーログは空です。');
            addDirectLog('INFO', 'エラーログ読み込み成功（直接API）');
            setIsLoading(false);
            return;
          } catch (error) {
            addDirectLog('ERROR', `直接APIでのエラーログ読み込み失敗: ${error.message}`);
            // 従来メソッドでリトライ
          }
        }
        
        // 従来メソッドを試す
        if (window.electronAPI && window.electronAPI.logs && 
            typeof window.electronAPI.logs.getErrorLogContent === 'function') {
          try {
            const content = await window.electronAPI.logs.getErrorLogContent(lines);
            setErrorLogContent(content || 'エラーログは空です。');
            addDirectLog('INFO', 'エラーログ読み込み成功（従来API）');
          } catch (error) {
            addDirectLog('ERROR', `従来APIでのエラーログ読み込み失敗: ${error.message}`);
            setErrorLogContent(`エラーログ取得中にエラーが発生しました: ${error.message}`);
          }
        } else {
          // どちらの方法も使えない場合
          setErrorLogContent('エラーログ機能が利用できません。');
          addDirectLog('WARN', 'エラーログ読み込み機能が利用できません');
        }
      }
    } catch (error) {
      addDirectLog('ERROR', `ログ読み込み処理エラー: ${error.message}`);
      if (activeTab === 'normal') {
        setLogContent(`ログの読み込みに失敗しました: ${error.message}\n\n${generateFallbackLog()}`);
      } else {
        setErrorLogContent(`エラーログの読み込みに失敗しました: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // ログファイル一覧の読み込み
  const loadLogFiles = async () => {
    if (!apiInitialized) {
      return;
    }
    
    try {
      addDirectLog('DEBUG', 'ログファイル一覧取得開始');
      
      // 直接メソッドを試す
      if (window.electronAPI && typeof window.electronAPI.getLogFiles === 'function') {
        try {
          const files = await window.electronAPI.getLogFiles();
          setLogFiles(files);
          addDirectLog('INFO', 'ログファイル一覧取得成功（直接API）', { count: files.length });
          return;
        } catch (error) {
          addDirectLog('ERROR', `直接APIでのログファイル一覧取得失敗: ${error.message}`);
          // 従来メソッドでリトライ
        }
      }
      
      // 従来メソッドを試す
      if (window.electronAPI && window.electronAPI.logs && 
          typeof window.electronAPI.logs.getLogFiles === 'function') {
        try {
          const files = await window.electronAPI.logs.getLogFiles();
          setLogFiles(files);
          addDirectLog('INFO', 'ログファイル一覧取得成功（従来API）', { count: files.length });
        } catch (error) {
          addDirectLog('ERROR', `従来APIでのログファイル一覧取得失敗: ${error.message}`);
          setLogFiles([]);
        }
      } else {
        // どちらの方法も使えない場合
        addDirectLog('WARN', 'ログファイル一覧機能が利用できません');
        setLogFiles([]);
      }
    } catch (error) {
      addDirectLog('ERROR', `ログファイル一覧取得エラー: ${error.message}`);
      setLogFiles([]);
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
    
    // 直接メソッドを試す
    if (window.electronAPI && typeof window.electronAPI.setLogLevel === 'function') {
      window.electronAPI.setLogLevel(level)
        .then(() => addDirectLog('DEBUG', 'ログレベル設定成功（直接API）'))
        .catch(err => addDirectLog('ERROR', `ログレベル設定エラー（直接API）: ${err.message}`));
    } 
    // 従来メソッドを試す
    else if (window.electronAPI && window.electronAPI.logs && 
             typeof window.electronAPI.logs.setLogLevel === 'function') {
      window.electronAPI.logs.setLogLevel(level)
        .then(() => addDirectLog('DEBUG', 'ログレベル設定成功（従来API）'))
        .catch(err => addDirectLog('ERROR', `ログレベル設定エラー（従来API）: ${err.message}`));
    }
  };
  
  // 手動更新
  const handleRefresh = () => {
    addDirectLog('INFO', '手動更新実行');
    loadLogs();
    if (apiInitialized) {
      loadLogFiles();
    }
  };
  
  // 環境状態再チェック
  const recheckEnvironment = () => {
    addDirectLog('INFO', 'Electron環境を再チェックします');
    checkElectronAPI();
  };
  
  // テストログ生成
  const generateTestLog = () => {
    addDirectLog('DEBUG', 'テストデバッグログ', { source: 'LogViewer', test: true });
    addDirectLog('INFO', 'テスト情報ログ', { source: 'LogViewer', test: true });
    addDirectLog('WARN', 'テスト警告ログ', { source: 'LogViewer', test: true });
    addDirectLog('ERROR', 'テストエラーログ', { source: 'LogViewer', test: true });
    
    // 直接メソッドでもログを書き込む
    if (window.electronAPI && typeof window.electronAPI.writeLog === 'function') {
      window.electronAPI.writeLog('INFO', 'テストログ（直接API）', '{"test":true}')
        .then(() => addDirectLog('DEBUG', 'テストログ書き込み成功（直接API）'))
        .catch(err => addDirectLog('ERROR', `テストログ書き込みエラー（直接API）: ${err.message}`));
    } 
    // 従来メソッドでもログを書き込む
    else if (window.electronAPI && window.electronAPI.logs && 
             typeof window.electronAPI.logs.writeLog === 'function') {
      window.electronAPI.logs.writeLog('INFO', 'テストログ（従来API）', '{"test":true}')
        .then(() => addDirectLog('DEBUG', 'テストログ書き込み成功（従来API）'))
        .catch(err => addDirectLog('ERROR', `テストログ書き込みエラー（従来API）: ${err.message}`));
    }
    
    // すぐにログを再読み込み
    setTimeout(() => {
      loadLogs();
      if (apiInitialized) {
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
        <div className={`status-indicator ${apiInitialized ? 'success' : 'error'}`}>
          {electronStatus.message}
          {electronStatus.error && <div className="error-details">{electronStatus.error}</div>}
          {waitingForApi && <div className="loading-indicator">API初期化を待機中...</div>}
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
            onClick={() => { setActiveTab('files'); if (apiInitialized) loadLogFiles(); }}
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
            {apiInitialized ? (
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