import React, { useState, useEffect, useContext } from 'react';
import ProjectContext from '../context/ProjectContext';
import './ImplementationPhase.css';

const ImplementationPhase = () => {
  const { project } = useContext(ProjectContext);
  const [currentStep, setCurrentStep] = useState('task-division');
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [environmentSetup, setEnvironmentSetup] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // タスク生成のシミュレーション
  useEffect(() => {
    const simulateTasks = () => {
      // タスク分割
      setTimeout(() => {
        const generatedTasks = [
          {
            id: 'task-1',
            name: 'ユーザー認証モジュール',
            status: 'completed',
            persona: 'セキュリティ専門家',
            complexity: 'medium',
            progress: 100,
            code: `// ユーザー認証モジュール
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const authenticateUser = async (username, password) => {
  try {
    // ユーザーをデータベースから取得
    const user = await getUserByUsername(username);
    
    if (!user) {
      return { success: false, message: 'ユーザーが見つかりません' };
    }
    
    // パスワードの検証
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return { success: false, message: 'パスワードが正しくありません' };
    }
    
    // JWTトークンの生成
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return { 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: '認証処理中にエラーが発生しました' };
  }
};`
          },
          {
            id: 'task-2',
            name: 'データベース接続',
            status: 'in-progress',
            persona: 'データベース専門家',
            complexity: 'medium',
            progress: 65,
            code: `// データベース接続モジュール
import { Pool } from 'pg';

// 環境設定から接続情報を読み込み
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// クエリ実行用のヘルパー関数
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  console.log('実行されたクエリ:', { text, duration, rows: res.rowCount });
  
  return res;
};

// トランザクション用のヘルパー
export const getClient = async () => {
  const client = await pool.connect();
  
  // オリジナルのメソッドを保存
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  // クエリをラップしてログ出力
  client.query = (...args) => {
    console.log('トランザクションクエリ:', args[0]);
    return originalQuery.apply(client, args);
  };
  
  // クライアントをラップして安全にリリース
  client.release = () => {
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };
  
  return client;
};`
          },
          {
            id: 'task-3',
            name: 'UI実装',
            status: 'queued',
            persona: 'フロントエンド専門家',
            complexity: 'high',
            progress: 0,
          },
          {
            id: 'task-4',
            name: 'APIエンドポイント',
            status: 'queued',
            persona: 'バックエンド専門家',
            complexity: 'medium',
            progress: 0,
          },
          {
            id: 'task-5',
            name: 'テストスイート',
            status: 'queued',
            persona: 'テスト専門家',
            complexity: 'medium',
            progress: 0,
          },
        ];
        
        setTasks(generatedTasks);
        setProgress(20);
        setCurrentStep('implementation');
        
        // 環境構築セットアップ
        setTimeout(() => {
          const setupSteps = [
            { id: 'env-1', name: 'Node.js環境', status: 'completed' },
            { id: 'env-2', name: 'PostgreSQLデータベース', status: 'completed' },
            { id: 'env-3', name: 'Dockerコンテナ', status: 'in-progress' },
            { id: 'env-4', name: 'CI/CDパイプライン', status: 'queued' },
          ];
          
          setEnvironmentSetup(setupSteps);
          setProgress(40);
          
          // 実装の進行をシミュレート
          let currentProgress = 40;
          const progressInterval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            
            // タスクの進行状況を更新
            if (currentProgress === 60) {
              setTasks(prev => {
                const updated = [...prev];
                const task = updated.find(t => t.id === 'task-2');
                if (task) {
                  task.progress = 100;
                  task.status = 'completed';
                }
                return updated;
              });
              
              setEnvironmentSetup(prev => {
                const updated = [...prev];
                const env = updated.find(e => e.id === 'env-3');
                if (env) {
                  env.status = 'completed';
                }
                return updated;
              });
            }
            
            if (currentProgress === 80) {
              setTasks(prev => {
                const updated = [...prev];
                const task = updated.find(t => t.id === 'task-3');
                if (task) {
                  task.progress = 100;
                  task.status = 'completed';
                  task.code = `// UI実装 - ログインコンポーネント
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, Alert } from '@mui/material';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await login(username, password);
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('ログイン処理中にエラーが発生しました');
      console.error(err);
    }
  };
  
  return (
    <div className="login-form">
      <h2>ログイン</h2>
      {error && <Alert severity="error">{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={isLoading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
    </div>
  );
};`;
                }
                return updated;
              });
            }
            
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              setProgress(100);
              setCurrentStep('completed');
              
              setTasks(prev => {
                return prev.map(task => {
                  if (task.status === 'queued') {
                    return { ...task, status: 'completed', progress: 100 };
                  }
                  return task;
                });
              });
              
              setEnvironmentSetup(prev => {
                return prev.map(env => {
                  if (env.status === 'queued') {
                    return { ...env, status: 'completed' };
                  }
                  return env;
                });
              });
            }
          }, 2000);
          
          return () => clearInterval(progressInterval);
        }, 2000);
      }, 2000);
    };
    
    simulateTasks();
  }, []);
  
  const handleTaskClick = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setSelectedTask(task);
  };
  
  const closeTaskDetail = () => {
    setSelectedTask(null);
  };
  
  return (
    <div className="implementation-phase-container">
      <h2>実装・環境構築フェーズ</h2>
      
      <div className="progress-container card">
        <h3>進捗状況</h3>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-labels">
          <span className="progress-label">{progress}% 完了</span>
          <span className="progress-step">{
            currentStep === 'task-division' ? 'タスク分割中...' :
            currentStep === 'implementation' ? '実装中...' :
            '実装完了'
          }</span>
        </div>
      </div>
      
      <div className="implementation-dashboard">
        <div className="tasks-container card">
          <h3>タスク一覧</h3>
          <div className="tasks-list">
            {tasks.map(task => (
              <div 
                key={task.id}
                className={`task-item ${task.status}`}
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="task-header">
                  <span className="task-name">{task.name}</span>
                  <span className={`task-status ${task.status}`}>
                    {task.status === 'completed' ? '完了' : 
                     task.status === 'in-progress' ? '実装中' : '待機中'}
                  </span>
                </div>
                <div className="task-details">
                  <span className="task-persona">{task.persona}</span>
                  <span className="task-complexity">
                    複雑度: {task.complexity === 'high' ? '高' : 
                            task.complexity === 'medium' ? '中' : '低'}
                  </span>
                </div>
                {task.progress > 0 && (
                  <div className="task-progress-container">
                    <div 
                      className="task-progress-bar"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="environment-container card">
          <h3>環境構築状況</h3>
          <div className="environment-list">
            {environmentSetup.map(env => (
              <div key={env.id} className={`environment-item ${env.status}`}>
                <span className="environment-name">{env.name}</span>
                <span className={`environment-status ${env.status}`}>
                  {env.status === 'completed' ? '完了' : 
                   env.status === 'in-progress' ? '設定中' : '待機中'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedTask && selectedTask.code && (
        <div className="task-detail-overlay" onClick={closeTaskDetail}>
          <div className="task-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="task-detail-header">
              <h3>{selectedTask.name}</h3>
              <button className="close-button" onClick={closeTaskDetail}>×</button>
            </div>
            <div className="task-detail-content">
              <div className="task-code">
                <pre>{selectedTask.code}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {currentStep === 'completed' && (
        <div className="completion-card card">
          <h3>実装完了</h3>
          <p>すべてのタスクが完了し、環境構築が完了しました。次のフェーズに進むことができます。</p>
          <div className="button-group">
            <button className="success">テストフェーズへ進む</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImplementationPhase;
