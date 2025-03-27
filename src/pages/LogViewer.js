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
  
  // Electron環境かどうかを確認
  const isElectronEnv = logger.isElectronEnv();
  
  // 初期ロード時とタブ切り替え時にログを取得
  useEffect(() => {
    loadLogs();
    
    // 定期更新設定
    if (refreshInterval) {
      const intervalId = setInterval(loadLogs, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [activeTab, refreshInterval, lines]);
  
  // ログ一覧の取得
  useEffect(() => {
    if (isElectronEnv) {
      loadLogFiles();
    }
  }, []);
  
  // ログコンテンツの読み込み
  const loadLogs = async () => {
    if (!isElectronEnv) {
      setLogContent('Electron環境でのみログを表示できます。');
      setErrorLogContent('Electron環境でのみログを表示できます。');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (activeTab === 'normal') {
        const content = await logger.getLogContent(lines);
        setLogContent(content || 'ログは空です。');
      } else if (activeTab === 'error') {
        const content = await logger.getErrorLogContent(lines);
        setErrorLogContent(content || 'エラーログは空です。');
      }
    } catch (error) {
      logger.error('ログの読み込みに失敗しました', error);
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
      const files = await logger.getLogFiles();
      setLogFiles(files);
    } catch (error) {
      logger.error('ログファイル一覧の取得に失敗しました', error);
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
    logger.info(`ログレベルを${level}に変更しました`);
  };
  
  // 手動更新
  const handleRefresh = () => {
    loadLogs();
    loadLogFiles();
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
            onClick={() => { setActiveTab('files'); loadLogFiles(); }}
          >
            ログファイル
          </button>
        </div>
      </div>
      
      <div className="log-content-container">
        {activeTab === 'normal' && (
          <div className="log-content">
            <pre>{logContent}</pre>
          </div>
        )}
        
        {activeTab === 'error' && (
          <div className="log-content error-log">
            <pre>{errorLogContent}</pre>
          </div>
        )}
        
        {activeTab === 'files' && (
          <div className="log-files">
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