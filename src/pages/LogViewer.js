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
  
  // Electron APIが使えるかどうか
  const hasElectronAPI = window && window.electronAPI && window.electronAPI.logs;
  
  // ログの直接読み込み (ipcRendererを使わず直接表示)
  const [directLog, setDirectLog] = useState([]);
  
  // コンポーネントマウント時に実行
  useEffect(() => {
    // 直接ログを初期化
    setDirectLog([
      '[INFO] ログビューア起動',
      '[INFO] Electron API状態: ' + (hasElectronAPI ? '利用可能' : '利用不可'),
      '[INFO] ログレベル: INFO'
    ]);
    
    // テストログを生成
    addDirectLog('INFO', 'ログビューアでテストログを生成');
    
    // 通常のログ読み込みも試行
    loadLogs();
    
    // 定期更新設定
    if (refreshInterval) {
      const intervalId = setInterval(() => {
        loadLogs();
        // 定期的なダミーログも追加
        addDirectLog('INFO', '定期更新チェック');
      }, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab, refreshInterval, lines]);
  
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
    if (hasElectronAPI) {
      loadLogFiles();
    }
  }, []);
  
  // ログコンテンツの読み込み
  const loadLogs = async () => {
    if (!hasElectronAPI) {
      setLogContent('Electron環境が検出できないため、ダイレクトログを表示します。\n\n' + directLog.join('\n'));
      setErrorLogContent('Electron環境が検出できません。');
      return;
    }
    
    setIsLoading(true);
    console.log("ログ読み込み処理を開始します");
    addDirectLog('DEBUG', 'ログ読み込み処理開始');
    
    try {
      if (activeTab === 'normal') {
        console.log(`通常ログを${lines}行取得します`);
        const content = await window.electronAPI.logs.getLogContent(lines);
        console.log("取得したログ内容の長さ:", content?.length || 0);
        setLogContent(content || 'ログは空です。');
      } else if (activeTab === 'error') {
        console.log(`エラーログを${lines}行取得します`);
        const content = await window.electronAPI.logs.getErrorLogContent(lines);
        console.log("取得したエラーログ内容の長さ:", content?.length || 0);
        setErrorLogContent(content || 'エラーログは空です。');
      }
      addDirectLog('INFO', 'ログ読み込み成功');
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
    if (hasElectronAPI) {
      loadLogFiles();
    }
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
      if (hasElectronAPI) {
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
            onClick={() => { setActiveTab('files'); if (hasElectronAPI) loadLogFiles(); }}
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
            {hasElectronAPI ? (
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