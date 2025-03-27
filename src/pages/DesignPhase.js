import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectContext from '../context/ProjectContext';
import './DesignPhase.css';

const DesignPhase = () => {
  const navigate = useNavigate();
  const { project, setProject } = useContext(ProjectContext);
  
  // isElectron関数の追加
  const isElectron = () => {
    return window && window.process && window.process.type;
  };
  
  // 繰り返し処理のための状態
  const [iterationCount, setIterationCount] = useState(0);
  const [maxIterations, setMaxIterations] = useState(3);
  const [consensusReached, setConsensusReached] = useState(false);
  const [consensusScore, setConsensusScore] = useState(0);
  
  // 基本状態
  const [isLoading, setIsLoading] = useState(true);
  const [designComplete, setDesignComplete] = useState(false);
  const [experts, setExperts] = useState([
    { id: 'architect', name: 'システムアーキテクト', status: 'processing' },
    { id: 'db-designer', name: 'データベース設計者', status: 'processing' },
    { id: 'ui-designer', name: 'UIデザイナー', status: 'processing' },
    { id: 'security-architect', name: 'セキュリティアーキテクト', status: 'processing' }
  ]);
  
  const [designComponents, setDesignComponents] = useState([]);
  const [previousDesign, setPreviousDesign] = useState([]);
  const [processingStep, setProcessingStep] = useState('expert-analysis');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddInputModal, setShowAddInputModal] = useState(false);
  const [additionalDesignInput, setAdditionalDesignInput] = useState('');
  
  // 初期化
  useEffect(() => {
    // 専門家AI設定の読み込み
    const loadExpertSettings = async () => {
      let expertSettings = null;
      
      if (isElectron() && window.electronAPI) {
        try {
          const settings = await window.electronAPI.getSettings();
          if (settings && settings.expertSettings) {
            expertSettings = settings.expertSettings;
          }
        } catch (error) {
          console.error('専門家AI設定の読み込みエラー:', error);
        }
      } else {
        const savedSettings = localStorage.getItem('aiBoSettings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            if (settings.expertSettings) {
              expertSettings = settings.expertSettings;
            }
          } catch (error) {
            console.error('専門家AI設定の解析エラー:', error);
          }
        }
      }
      
      // 設定があれば専門家AIを初期化
      if (expertSettings && expertSettings.phaseExperts && expertSettings.phaseExperts.design) {
        const designExperts = expertSettings.phaseExperts.design;
        
        // 設定から専門家AIを初期化
        if (designExperts.enabled && designExperts.experts.length > 0) {
          const customExperts = designExperts.experts.map(expert => ({
            id: expert.id,
            name: expert.name,
            status: 'processing',
            iconType: expert.iconType,
            model: expert.model,
            expertise: expert.expertise
          }));
          
          setExperts(customExperts);
        }
      }
      
      // 初期の設計プロセスシミュレーション実行
      simulateDesignProcess();
    };
    
    loadExpertSettings();
  }, []);
  
  // 専門家AIの一致度計算（シミュレーション）
  const calculateConsensus = () => {
    // イテレーションごとに上昇するよう簡易シミュレーション
    return Math.min(0.4 + (iterationCount * 0.2), 1.0);
  };
  
  // 設計プロセスのシミュレーション
  const simulateDesignProcess = () => {
    // experts配列が空の場合はデフォルト専門家を設定
    if (!experts || experts.length === 0) {
      setExperts([
        { id: 'architect', name: 'システムアーキテクト', status: 'processing' },
        { id: 'db-designer', name: 'データベース設計者', status: 'processing' },
        { id: 'ui-designer', name: 'UIデザイナー', status: 'processing' },
        { id: 'security-architect', name: 'セキュリティアーキテクト', status: 'processing' }
      ]);
    }
    
    const expertDelay = 1200; // 1.2秒
    
    // 専門家AIの状態を順次更新
    experts.forEach((expert, index) => {
      setTimeout(() => {
        setExperts(prev => {
          const updated = [...prev];
          const expertIndex = updated.findIndex(e => e.id === expert.id);
          if (expertIndex !== -1) {
            updated[expertIndex] = { ...updated[expertIndex], status: 'completed' };
          }
          return updated;
        });
        
        // 全ての専門家の分析が完了したら次のステップへ
        if (index === experts.length - 1) {
          setTimeout(() => {
            setProcessingStep('integration');
            
            // まとめAIの処理シミュレーション
            setTimeout(() => {
              const initialDesign = [
                {
                  id: 'arch-1',
                  name: 'システムアーキテクチャ',
                  type: 'architecture',
                  expertId: 'architect',
                  description: 'マイクロサービスアーキテクチャを採用し、スケーラビリティと保守性を確保します。',
                  details: 'フロントエンド、APIゲートウェイ、認証サービス、ビジネスロジックサービス、データサービスの5つの主要コンポーネントで構成します。',
                  status: 'proposed',
                  iteration: 1
                },
                {
                  id: 'db-1',
                  name: 'データモデル',
                  type: 'database',
                  expertId: 'db-designer',
                  description: 'PostgreSQLを使用したリレーショナルデータベース設計により、データの整合性と効率的なクエリを実現します。',
                  details: 'ユーザー、プロダクト、オーダー、ペイメントの4つの主要エンティティを持ちます。',
                  status: 'proposed',
                  iteration: 1
                },
                {
                  id: 'ui-1',
                  name: 'ユーザーインターフェース',
                  type: 'ui',
                  expertId: 'ui-designer',
                  description: 'Reactを使用したモダンなSPA（Single Page Application）により、レスポンシブで高速なUI体験を提供します。',
                  details: 'Material-UIコンポーネントライブラリを活用し、一貫性のあるデザインシステムを実装します。',
                  status: 'proposed',
                  iteration: 1
                },
                {
                  id: 'sec-1',
                  name: 'セキュリティ設計',
                  type: 'security',
                  expertId: 'security-architect',
                  description: 'JWT認証、HTTPS通信、入力検証など、多層的なセキュリティ対策を実装します。',
                  details: 'ユーザー認証には、JWTトークンを使用し、リフレッシュトークンによるセッション管理を行います。',
                  status: 'proposed',
                  iteration: 1
                }
              ];
              
              setDesignComponents(initialDesign);
              setProcessingStep('review');
              setIsLoading(false);
              
              // 一致度を計算
              const consensus = calculateConsensus();
              setConsensusScore(consensus);
              setConsensusReached(consensus >= 0.8);
              
              // 繰り返し回数を更新
              setIterationCount(prev => prev + 1);
              
              setDesignComplete(true);
            }, 2000);
          }, 500);
        }
      }, expertDelay * (index + 1));
    });
  };
  
  // 再設計（繰り返し処理）
  const runNextIteration = (keepDesign = true, additionalInput = '') => {
    // 前回の設計を保存
    if (keepDesign) {
      setPreviousDesign(designComponents);
    } else {
      setPreviousDesign([]);
    }
    
    // 状態をリセット
    setProcessingStep('expert-analysis');
    setIsLoading(true);
    setDesignComplete(false);
    setExperts(experts.map(expert => ({ ...expert, status: 'processing' })));
    
    // 専門家AIの分析を再実行（シミュレーション）
    const expertDelay = 800; // 少し早く
    
    experts.forEach((expert, index) => {
      setTimeout(() => {
        setExperts(prev => {
          const updated = [...prev];
          const expertIndex = updated.findIndex(e => e.id === expert.id);
          if (expertIndex !== -1) {
            updated[expertIndex] = { ...updated[expertIndex], status: 'completed' };
          }
          return updated;
        });
        
        if (index === experts.length - 1) {
          setTimeout(() => {
            setProcessingStep('integration');
            
            setTimeout(() => {
              // イテレーション1回目の場合、追加入力に基づく設計を生成（シミュレーション）
              let updatedDesign = [];
              
              if (iterationCount === 0 && additionalInput) {
                // 追加入力に基づく設計を表示するためのログ（デバッグ用）
                console.log('追加入力に基づく新たな設計生成:', additionalInput);
                
                // シミュレーション: 追加入力に基づく設計の生成
                if (keepDesign && previousDesign.length > 0) {
                  updatedDesign = [...previousDesign];
                  
                  // 追加入力から設計コンポーネントを生成（シミュレーション）
                  const newComponent = {
                    id: `add-1`,
                    name: additionalInput.length > 30 
                      ? additionalInput.substring(0, 30) + '...' 
                      : additionalInput,
                    type: 'additional',
                    expertId: 'architect',
                    description: `${additionalInput} に関する設計コンポーネント`,
                    details: `ユーザー入力: "${additionalInput}" に基づいた設計コンポーネント。実際のシステムでは、この入力を元にAIが適切な設計を生成します。`,
                    status: 'proposed',
                    iteration: 1
                  };
                  
                  updatedDesign.push(newComponent);
                } else {
                  // 初期設計と同じ
                  updatedDesign = previousDesign.map(item => ({
                    ...item,
                    iteration: 1
                  }));
                }
              } else if (keepDesign && previousDesign.length > 0) {
                // 通常のシミュレーション（既存のまま）
                updatedDesign = [...previousDesign];
                
                // イテレーションに応じて新たな設計コンポーネントを追加
                if (iterationCount === 1) {
                  updatedDesign.push({
                    id: 'sec-2',
                    name: 'データ暗号化',
                    type: 'security',
                    expertId: 'security-architect',
                    description: 'センシティブなデータは保存時と通信時に暗号化します。',
                    details: 'AES-256暗号化アルゴリズムを使用し、データベースに保存する前にセンシティブな情報を暗号化します。',
                    status: 'proposed',
                    iteration: 2
                  });
                } else if (iterationCount === 2) {
                  updatedDesign.push({
                    id: 'arch-2',
                    name: 'キャッシュ層',
                    type: 'architecture',
                    expertId: 'architect',
                    description: 'Redisを使用したキャッシュ層を追加し、パフォーマンスを向上させます。',
                    details: '頻繁にアクセスされるデータをキャッシュし、データベースの負荷を軽減します。',
                    status: 'proposed',
                    iteration: 3
                  });
                }
              } else {
                // 初期設計と同じ
                updatedDesign = previousDesign.map(item => ({
                  ...item,
                  iteration: iterationCount + 1
                }));
              }
              
              setDesignComponents(updatedDesign);
              setProcessingStep('review');
              setIsLoading(false);
              
              // 一致度を更新
              const consensus = calculateConsensus();
              setConsensusScore(consensus);
              setConsensusReached(consensus >= 0.8);
              
              // 繰り返し回数を更新
              setIterationCount(prev => prev + 1);
              
              setDesignComplete(true);
            }, 1500);
          }, 500);
        }
      }, expertDelay * (index + 1));
    });
  };
  
  // 設計を承認
  const handleApproveDesign = () => {
    // 設計コンポーネントをすべて承認済みに更新
    const approvedDesigns = designComponents.map(component => ({
      ...component,
      status: 'approved'
    }));
    
    setProject({
      ...project,
      design: {
        components: approvedDesigns,
        architecture: "マイクロサービス",
        database: "PostgreSQL",
        ui: "React",
        dataModel: "設計済み",
        approved: true,
        iterationData: {
          count: iterationCount,
          consensus: consensusScore
        }
      },
      currentPhase: 'implementation'
    });
    
    navigate('/implementation');
  };
  
  // 設計コンポーネントのステータスを切り替え
  const toggleComponentStatus = (componentId) => {
    setDesignComponents(prev => 
      prev.map(component => 
        component.id === componentId 
          ? { 
              ...component, 
              status: component.status === 'approved' ? 'proposed' : 'approved' 
            }
          : component
      )
    );
  };
  
  // 設計を追加する処理
  const handleAddDesign = () => {
    // 追加入力モーダルを表示
    setShowAddInputModal(true);
  };
  
  // 追加入力を保存して処理を開始
  const handleSubmitAdditionalDesign = () => {
    // モーダルを閉じる
    setShowAddInputModal(false);
    
    // 現在の設計を保存
    setPreviousDesign(designComponents);
    
    // イテレーションをリセット
    setIterationCount(0);
    
    // 次のイテレーションを開始（設計を保持）
    runNextIteration(true, additionalDesignInput);
    
    // 入力フィールドをクリア
    setAdditionalDesignInput('');
  };
  
  // 設定モーダルの表示/非表示
  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };
  
  // 設定を保存
  const saveSettings = (e) => {
    e.preventDefault();
    setShowSettingsModal(false);
  };
  
  return (
    <div className="design-phase-container">
      <h2>設計フェーズ</h2>
      
      <div className="phase-header">
        <div className="iteration-info">
          <span className="iteration-count">イテレーション: {iterationCount}/{maxIterations}</span>
          <div className="consensus-meter">
            <div className="consensus-label">意見一致度:</div>
            <div className="consensus-bar-container">
              <div 
                className="consensus-bar" 
                style={{ width: `${consensusScore * 100}%` }}
              ></div>
            </div>
            <div className="consensus-value">{Math.round(consensusScore * 100)}%</div>
          </div>
          {consensusReached && (
            <div className="consensus-reached">意見一致に達しました</div>
          )}
        </div>
        <button onClick={toggleSettingsModal} className="settings-button secondary">
          設定
        </button>
      </div>
      
      {isLoading ? (
        <div className="card loading-card">
          <h3>設計処理中...</h3>
          <div className="loading"></div>
          <p>要件に基づいて最適な設計を生成しています。これには数分かかることがあります。</p>
          
          <div className="experts-status">
            {experts.map(expert => (
              <div 
                key={expert.id} 
                className={`expert-status-item ${expert.status}`}
              >
                <span className="expert-name">{expert.name}</span>
                {expert.model && (
                  <span className="expert-model">{expert.model}</span>
                )}
                <span className="expert-progress">
                  {expert.status === 'processing' ? '処理中...' : '完了'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="card design-components">
            <h3>設計コンポーネント</h3>
            
            <div className="component-grid">
              {designComponents.map(component => (
                <div
                  key={component.id}
                  className={`design-component ${component.status}`}
                  onClick={() => toggleComponentStatus(component.id)}
                >
                  <div className="component-header">
                    <span className="component-name">{component.name}</span>
                    <span className={`component-status ${component.status}`}>
                      {component.status === 'approved' ? '承認済み' : '提案中'}
                    </span>
                  </div>
                  <div className="component-type">
                    {component.type === 'architecture' ? 'アーキテクチャ' :
                     component.type === 'database' ? 'データベース' :
                     component.type === 'ui' ? 'ユーザーインターフェース' :
                     component.type === 'security' ? 'セキュリティ' :
                     component.type}
                  </div>
                  <div className="component-description">
                    {component.description}
                  </div>
                  <div className="component-details">
                    {component.details}
                  </div>
                  {component.iteration > 1 && (
                    <div className="iteration-badge">
                      イテレーション {component.iteration} で追加
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="card design-diagrams">
            <h3>設計図</h3>
            <div className="diagram-container">
              <div className="diagram">
                <h4>システムアーキテクチャ図</h4>
                <div className="diagram-placeholder">
                  <p>[システムアーキテクチャ図のプレースホルダー]</p>
                  <p>実際の実装では、Mermaidなどを使用して図表を表示</p>
                </div>
              </div>
              
              <div className="diagram">
                <h4>データモデル図</h4>
                <div className="diagram-placeholder">
                  <p>[ERダイアグラムのプレースホルダー]</p>
                  <p>実際の実装では、Mermaidなどを使用して図表を表示</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card design-approval">
            <h3>設計の承認</h3>
            <p>上記の設計内容を確認し、承認またはフィードバックを提供してください。</p>
            <div className="instructions">
              <p>各設計コンポーネントをクリックして承認状態を切り替えることができます。</p>
            </div>
            <div className="button-group">
              <button className="secondary" onClick={() => navigate('/requirements')}>
                要件定義に戻る
              </button>
              <button 
                className="primary" 
                onClick={handleAddDesign}
                disabled={iterationCount >= maxIterations || consensusReached}
              >
                設計を追加してやり直す
              </button>
              <button className="success" onClick={handleApproveDesign}>
                設計を承認して実装フェーズへ進む
              </button>
            </div>
            
            {iterationCount >= maxIterations && !consensusReached && (
              <div className="iteration-limit-message">
                <p>最大イテレーション回数に達しました。さらなる改善が必要な場合は設定から回数を増やしてください。</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* 設定モーダル */}
      {showSettingsModal && (
        <div className="settings-modal-overlay" onClick={toggleSettingsModal}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>設定</h3>
              <button className="close-button" onClick={toggleSettingsModal}>×</button>
            </div>
            <form onSubmit={saveSettings}>
              <div className="form-group">
                <label htmlFor="maxIterations">最大イテレーション回数:</label>
                <input
                  type="number"
                  id="maxIterations"
                  min="1"
                  max="10"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="consensusThreshold">意見一致閾値:</label>
                <select 
                  id="consensusThreshold"
                  defaultValue="0.8"
                >
                  <option value="0.7">70% (低)</option>
                  <option value="0.8">80% (中)</option>
                  <option value="0.9">90% (高)</option>
                </select>
              </div>
              <div className="button-group">
                <button type="submit" className="primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 追加入力モーダル */}
      {showAddInputModal && (
        <div className="input-modal-overlay" onClick={() => setShowAddInputModal(false)}>
          <div className="input-modal" onClick={e => e.stopPropagation()}>
            <div className="input-modal-header">
              <h3>追加設計の入力</h3>
              <button className="close-button" onClick={() => setShowAddInputModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitAdditionalDesign(); }}>
              <div className="form-group">
                <label htmlFor="additionalDesignInput">
                  現在の設計に追加したい要望を入力してください:
                </label>
                <textarea
                  id="additionalDesignInput"
                  value={additionalDesignInput}
                  onChange={(e) => setAdditionalDesignInput(e.target.value)}
                  placeholder="例: キャッシュ機能を追加したい、マイクロサービスアーキテクチャにしたい、など"
                  rows={6}
                  required
                />
              </div>
              <div className="form-notice">
                <p>
                  <strong>注意:</strong> この入力内容をもとに、AIが再度設計分析を行い、既存の設計に新たな要素を追加します。
                  イテレーションカウンターはリセットされ、意見が一致するか最大回数に達するまで繰り返します。
                </p>
              </div>
              <div className="button-group">
                <button type="button" className="secondary" onClick={() => setShowAddInputModal(false)}>
                  キャンセル
                </button>
                <button type="submit" className="primary">
                  追加して再開
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignPhase;