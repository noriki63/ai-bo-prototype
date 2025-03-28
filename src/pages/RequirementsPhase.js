import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectContext from '../context/ProjectContext';
import { expertAIs, mockQuestions, mockRequirements } from '../data/mockData';
import { 
  processWithExpertAIs, 
  processWithSummarizerAI, 
  processUserAnswers 
} from '../services/aiService';
import logger from '../utils/frontendLogger';
import './RequirementsPhase.css';

// 信頼度のラベルマッピング
const confidenceLabels = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

// アイコンマッピング（専門家AI設定から読み込む場合に使用）
const expertIcons = {
  'tech': 'laptop-code',
  'security': 'shield-alt',
  'business': 'chart-line',
  'user': 'user',
  'maintenance': 'tools',
  'architect': 'drafting-compass',
  'database': 'database',
  'ui': 'palette',
  'devops': 'server',
  'qa': 'bug',
  'custom': 'cogs'
};

// Electronが使用可能かどうかをチェック
const isElectron = () => {
  return window && window.process && window.process.type;
};

const RequirementsPhase = () => {
  const navigate = useNavigate();
  const { project, setProject } = useContext(ProjectContext);
  
  // コンポーネントマウント時にログ出力
  useEffect(() => {
    logger.info('要件定義フェーズ開始', { 
      projectName: project.name,
      projectSpecification: project.specification?.substring(0, 100) // 長すぎる仕様は短縮
    });
    
    // コンポーネントのアンマウント時にログ
    return () => {
      logger.debug('要件定義フェーズコンポーネントのアンマウント');
    };
  }, []);
  
  // 繰り返し処理のための状態
  const [iterationCount, setIterationCount] = useState(0);
  const [maxIterations, setMaxIterations] = useState(3);
  const [consensusReached, setConsensusReached] = useState(false);
  const [consensusScore, setConsensusScore] = useState(0);
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [experts, setExperts] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [autoAnswers, setAutoAnswers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [processingStep, setProcessingStep] = useState('expert-analysis');
  const [answers, setAnswers] = useState({});
  const [editingAutoAnswer, setEditingAutoAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousRequirements, setPreviousRequirements] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [useRealApi, setUseRealApi] = useState(true); // APIを使用するフラグ（デフォルトはtrue）
  const [retryCount, setRetryCount] = useState(0); // 再試行カウンター
  
  // モーダル制御
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddInputModal, setShowAddInputModal] = useState(false);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  
  // 初期化
  useEffect(() => {
    // 専門家AI設定の読み込み
    const loadExpertSettings = async () => {
      logger.debug('専門家AI設定の読み込み開始');
      let expertSettings = null;
      
      if (isElectron() && window.electronAPI) {
        try {
          const settings = await window.electronAPI.getSettings();
          if (settings && settings.expertSettings) {
            expertSettings = settings.expertSettings;
            logger.debug('Electron環境から専門家AI設定を読み込み成功');
          }
        } catch (error) {
          logger.error('専門家AI設定の読み込みエラー (Electron)', error);
        }
      } else {
        const savedSettings = localStorage.getItem('aiBoSettings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            if (settings.expertSettings) {
              expertSettings = settings.expertSettings;
              logger.debug('ローカルストレージから専門家AI設定を読み込み成功');
            }
          } catch (error) {
            logger.error('専門家AI設定の解析エラー', error);
          }
        }
      }
      
      // 設定があれば専門家AIを初期化
      if (expertSettings && expertSettings.phaseExperts && expertSettings.phaseExperts.requirements) {
        const requirementsExperts = expertSettings.phaseExperts.requirements;
        
        // 設定から専門家AIを初期化
        if (requirementsExperts.enabled && requirementsExperts.experts.length > 0) {
          const customExperts = requirementsExperts.experts.map(expert => ({
            id: expert.id,
            name: expert.name,
            description: expert.description,
            icon: expertIcons[expert.iconType] || 'user',
            status: 'processing',
            expertise: expert.expertise,
            provider: expert.provider,
            model: expert.model,
            providerSettings: expert.providerSettings
          }));
          
          setExperts(customExperts);
          logger.info('カスタム専門家AI設定を適用', { 
            expertCount: customExperts.length 
          });
        } else {
          // デフォルト専門家AIの初期化
          logger.info('デフォルト専門家AI設定を使用', { 
            expertCount: expertAIs.length 
          });
          setExperts(expertAIs.map(expert => ({ ...expert, status: 'processing' })));
        }
      } else {
        // デフォルト専門家AIの初期化
        logger.info('デフォルト専門家AI設定を使用', { 
          expertCount: expertAIs.length 
        });
        setExperts(expertAIs.map(expert => ({ ...expert, status: 'processing' })));
      }
    };
    
    loadExpertSettings().then(() => {
      logger.debug('専門家AI分析開始');
      
      if (useRealApi) {
        // 実際のAPIを使用
        runExpertAnalysis();
      } else {
        // シミュレーション
        simulateExpertAnalysis();
      }
    });
  }, [retryCount]); // retryCountが変わると再実行
  
  // 実際のAPI呼び出しによる専門家AI分析
  const runExpertAnalysis = async () => {
    try {
      logger.info('実際のAI APIを使用した専門家AI分析開始', {
        expertCount: experts.length,
        projectSpec: project.specification?.substring(0, 50) + "...",
      });
      
      setApiError(null);
      setIsLoading(true);
      
      // 専門家AIの一部をエラー状態に設定（ロード表示のため）
      setExperts(prev => prev.map(expert => ({ ...expert, status: 'processing' })));
      
      // 専門家AI分析を実行
      const expertResults = await processWithExpertAIs(
        project.specification,
        experts,
        {
          iteration: iterationCount + 1,
          previousRequirements: previousRequirements,
          additionalInput: additionalRequirements,
          projectName: project.name
        }
      );
      
      // 専門家AIの状態を更新（成功/エラー）
      const updatedExperts = experts.map(expert => {
        const result = expertResults.find(r => r.expertId === expert.id);
        return {
          ...expert,
          status: result?.error ? 'error' : 'completed'
        };
      });
      setExperts(updatedExperts);
      
      // まとめAIの処理を開始
      await processSummarizerAI(expertResults);
      
    } catch (error) {
      setApiError(`専門家AI分析エラー: ${error.message}`);
      logger.error('専門家AI分析エラー', error);
      setIsLoading(false);
    }
  };
  
  // まとめAIによる統合処理
  const processSummarizerAI = async (expertResults) => {
    try {
      logger.info('まとめAI処理開始', { expertResultsCount: expertResults.length });
      setProcessingStep('summarization');
      
      // まとめAIによる統合処理
      const summaryResult = await processWithSummarizerAI(
        expertResults,
        {
          projectName: project.name,
          iteration: iterationCount + 1,
          previousRequirements: previousRequirements
        }
      );
      
      // 質問と自動回答を設定
      const userRequiredQuestions = summaryResult.questions?.user_required_questions || [];
      const autoAnsweredQuestions = summaryResult.questions?.auto_answered_questions || [];
      
      setUserQuestions(userRequiredQuestions);
      setAutoAnswers(autoAnsweredQuestions);
      
      // 一致度を設定
      const consensusValue = summaryResult.consensus_evaluation?.score || 0;
      setConsensusScore(consensusValue);
      setConsensusReached(consensusValue >= 0.8); // 80%以上で一致とみなす
      
      setProcessingStep('questions');
      
      // 繰り返し回数を更新
      setIterationCount(prev => prev + 1);
      
      logger.info('まとめAI処理完了', {
        userQuestions: userRequiredQuestions.length,
        autoAnswers: autoAnsweredQuestions.length,
        consensusScore: consensusValue
      });
      
    } catch (error) {
      setApiError(`まとめAI処理エラー: ${error.message}`);
      logger.error('まとめAI処理エラー', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 専門家AIの分析シミュレーション（APIを使わない場合のフォールバック）
  const simulateExpertAnalysis = () => {
    logger.info('専門家AI分析プロセスのシミュレーション開始', { expertCount: experts.length });
    const expertDelay = 1000; // 1秒
    
    experts.forEach((expert, index) => {
      setTimeout(() => {
        logger.debug(`専門家AI分析完了: ${expert.name}`);
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
            logger.info('全専門家AI分析完了、まとめAI処理開始');
            setProcessingStep('summarization');
            
            // まとめAIの処理シミュレーション
            setTimeout(() => {
              logger.info('まとめAI処理完了');
              setUserQuestions(mockQuestions.userRequired);
              setAutoAnswers(mockQuestions.autoAnswered);
              setProcessingStep('questions');
              
              // 専門家AIの一致度を計算（シミュレーション）
              const consensus = calculateConsensus();
              logger.debug(`専門家AI一致度計算: ${Math.round(consensus * 100)}%`);
              setConsensusScore(consensus);
              setConsensusReached(consensus >= 0.8); // 80%以上で一致とみなす
              
              // 繰り返し回数を更新
              setIterationCount(prev => prev + 1);
              
              setIsLoading(false);
            }, 2000);
          }, 500);
        }
      }, expertDelay * (index + 1));
    });
  };
  
  // 専門家AIの一致度計算（シミュレーション）
  const calculateConsensus = () => {
    // 実際のシステムでは、各専門家AIの要件分析結果の類似度を計算
    // ここではイテレーションごとに上昇するよう簡易シミュレーション
    return Math.min(0.4 + (iterationCount * 0.2), 1.0);
  };
  
  // 繰り返し分析を実行
  const runNextIteration = (keepRequirements = true, additionalInput = '') => {
    logger.info('次のイテレーション開始', { 
      iterationCount, 
      keepRequirements, 
      hasAdditionalInput: !!additionalInput 
    });
    
    // 前回の要件と回答を保存
    if (keepRequirements) {
      setPreviousRequirements(requirements);
    } else {
      setPreviousRequirements([]);
    }
    
    // 追加入力を保存
    setAdditionalRequirements(additionalInput);
    
    // 状態をリセット
    setUserQuestions([]);
    setAutoAnswers([]);
    setAnswers({});
    setProcessingStep('expert-analysis');
    setExperts(prev => prev.map(expert => ({ ...expert, status: 'processing' })));
    
    if (useRealApi) {
      // 実際のAPIを使用
      runExpertAnalysis();
    } else {
      // シミュレーション
      simulateNextIteration();
    }
  };
  
  // 次のイテレーションのシミュレーション（API未使用時）
  const simulateNextIteration = () => {
    logger.debug('次のイテレーションシミュレーション開始');
    const expertDelay = 800; // 少し早く
    
    experts.forEach((expert, index) => {
      setTimeout(() => {
        logger.debug(`イテレーション専門家AI分析完了: ${expert.name}`);
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
            logger.info('全イテレーション専門家AI分析完了、まとめAI処理開始');
            setProcessingStep('summarization');
            
            setTimeout(() => {
              logger.info('イテレーションまとめAI処理完了');
              // 2回目以降は質問が減少するシミュレーション
              if (iterationCount >= 2) {
                setUserQuestions(mockQuestions.userRequired.slice(0, 1));
                logger.debug('質問数の減少: 1問');
              } else {
                setUserQuestions(mockQuestions.userRequired.slice(0, 2));
                logger.debug('質問数の減少: 2問');
              }
              setAutoAnswers(mockQuestions.autoAnswered);
              setProcessingStep('questions');
              
              // イテレーション1回目の場合、追加入力に基づく要件を生成（シミュレーション）
              if (iterationCount === 0 && additionalRequirements) {
                // 追加入力に基づく要件を表示するためのログ（デバッグ用）
                logger.debug('追加入力に基づく要件生成', { additionalRequirements });
              }
              
              // 一致度を更新
              const consensus = calculateConsensus();
              logger.debug(`イテレーション一致度更新: ${Math.round(consensus * 100)}%`);
              setConsensusScore(consensus);
              setConsensusReached(consensus >= 0.8);
              
              // 繰り返し回数を更新
              setIterationCount(prev => prev + 1);
              
              setIsLoading(false);
            }, 1500);
          }, 500);
        }
      }, expertDelay * (index + 1));
    });
  };
  
  // 回答の変更ハンドラ
  const handleAnswerChange = (questionId, value) => {
    logger.debug(`質問への回答を変更: ${questionId}`);
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // 自動回答の編集モード切り替え
  const toggleEditAutoAnswer = (answerId) => {
    logger.debug(`自動回答の編集モード切り替え: ${answerId}`);
    if (editingAutoAnswer === answerId) {
      setEditingAutoAnswer(null);
    } else {
      setEditingAutoAnswer(answerId);
    }
  };
  
  // 自動回答の更新
  const updateAutoAnswer = (answerId, newAnswer) => {
    logger.info(`自動回答を更新: ${answerId}`, { newAnswer });
    setAutoAnswers(prev => 
      prev.map(item => 
        item.id === answerId 
          ? { ...item, answer: newAnswer, userEdited: true } 
          : item
      )
    );
    setEditingAutoAnswer(null);
  };
  
  // 質問への回答を送信
  const submitAnswers = async () => {
    // すべての質問に回答されているか確認
    const allAnswered = userQuestions.every(q => answers[q.id]);
    
    if (!allAnswered) {
      logger.warn('未回答の質問があります');
      alert('すべての質問に回答してください。');
      return;
    }
    
    logger.info('ユーザー質問への回答を送信', { answerCount: Object.keys(answers).length });
    setIsSubmitting(true);
    
    if (useRealApi) {
      try {
        // 質問を回答済みに更新
        const answeredQuestions = userQuestions.map(q => ({
          ...q,
          answered: true,
          answer: answers[q.id]
        }));
        
        // 自動回答済みの質問も含める
        const allQuestions = [
          ...answeredQuestions,
          ...autoAnswers
        ];
        
        setProcessingStep('requirements-generation');
        
        // 回答処理と要件生成
        const requirementsResult = await processUserAnswers(
          allQuestions,
          previousRequirements,
          { 
            projectName: project.name,
            iteration: iterationCount 
          }
        );
        
        // 結果を設定
        setRequirements(requirementsResult.requirements || []);
        setProcessingStep('requirements-review');
        setAnalysisComplete(true);
        
      } catch (error) {
        setApiError(`要件生成エラー: ${error.message}`);
        logger.error('要件生成エラー', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // シミュレーション
      simulateRequirementsGeneration();
    }
  };
  
  // 要件生成のシミュレーション（APIを使わない場合）
  const simulateRequirementsGeneration = () => {
    // 回答の処理をシミュレーション
    setTimeout(() => {
      // 質問を回答済みに更新
      const answeredQuestions = userQuestions.map(q => ({
        ...q,
        answered: true,
        answer: answers[q.id]
      }));
      
      setUserQuestions(answeredQuestions);
      setProcessingStep('requirements-generation');
      logger.debug('要件生成プロセス開始');
      
      // 要件生成のシミュレーション
      setTimeout(() => {
        logger.info('要件生成完了');
        
        // 繰り返し処理時、前回の要件を基に新たな要件を生成
        if (iterationCount > 1 && previousRequirements.length > 0) {
          const updatedRequirements = [...previousRequirements];
          
          // 前回の要件に新たな要件を追加（シミュレーション）
          if (!updatedRequirements.some(r => r.id === 'FR-004')) {
            logger.debug('要件追加: FR-004 ユーザー通知システム');
            updatedRequirements.push({
              id: 'FR-004',
              category: '機能要件',
              description: 'ユーザー通知システム',
              priority: 'SHOULD',
              status: 'approved',
              details: 'ユーザーに重要なイベントを通知する機能を実装する。',
              iteration: iterationCount
            });
          }
          
          if (!updatedRequirements.some(r => r.id === 'NFR-004')) {
            logger.debug('要件追加: NFR-004 ユーザビリティテスト');
            updatedRequirements.push({
              id: 'NFR-004',
              category: '非機能要件',
              description: 'ユーザビリティテスト',
              priority: 'SHOULD',
              status: 'discussion',
              details: '実際のユーザーによるユーザビリティテストを実施し、UIの改善を行う。',
              iteration: iterationCount
            });
          }
          
          setRequirements(updatedRequirements);
        } else {
          // 初回は通常のモック要件
          logger.debug('初期要件セット生成', { requirementCount: mockRequirements.length });
          const initialRequirements = mockRequirements.map(req => ({
            ...req,
            iteration: 1
          }));
          setRequirements(initialRequirements);
        }
        
        setProcessingStep('requirements-review');
        setIsSubmitting(false);
        setAnalysisComplete(true);
      }, 2000);
    }, 1500);
  };
  
  // 要件を承認して次のフェーズへ
  const approveRequirements = () => {
    logger.info('要件定義を承認して次のフェーズへ進む', {
      requirementCount: requirements.length,
      iterationCount,
      consensusScore: Math.round(consensusScore * 100)
    });
    
    setProject({
      ...project,
      requirements: requirements,
      currentPhase: 'design',
      iterationData: {
        count: iterationCount,
        consensus: consensusScore
      }
    });
    
    navigate('/design');
  };
  
  // 要件の承認状態を変更
  const toggleRequirementStatus = (reqId) => {
    logger.debug(`要件承認状態を切り替え: ${reqId}`);
    setRequirements(prev => 
      prev.map(req => 
        req.id === reqId 
          ? { 
              ...req, 
              status: req.status === 'approved' ? 'discussion' : 'approved' 
            }
          : req
      )
    );
  };
  
  // 「要件を追加してやり直す」ボタンのハンドラ
  const handleAddRequirements = () => {
    logger.info('要件追加モーダルを表示');
    // 追加入力モーダルを表示
    setShowAddInputModal(true);
  };
  
  // 追加入力を保存して処理を開始
  const handleSubmitAdditionalRequirements = () => {
    logger.info('追加要件を提出して処理を再開', {
      additionalRequirementsLength: additionalRequirements.length
    });
    
    // モーダルを閉じる
    setShowAddInputModal(false);
    
    // 現在の要件を保存
    setPreviousRequirements(requirements);
    
    // イテレーションをリセット
    setIterationCount(0);
    
    // 次のイテレーションを開始（要件を保持）
    runNextIteration(true, additionalRequirements);
    
    // 入力フィールドをクリア（状態は残す）
  };
  
  // 設定モーダルの表示/非表示
  const toggleSettingsModal = () => {
    logger.debug(`設定モーダルの表示切り替え: ${!showSettingsModal ? '表示' : '非表示'}`);
    setShowSettingsModal(!showSettingsModal);
  };
  
  // 設定を保存
  const saveSettings = (e) => {
    e.preventDefault();
    logger.info('要件定義設定を保存', {
      maxIterations, 
      useRealApi
    });
    setShowSettingsModal(false);
  };
  
  // エラー時の再試行
  const handleRetry = () => {
    logger.info('API呼び出しを再試行');
    setApiError(null);
    setRetryCount(retryCount + 1);
  };
  
  // APIフラグを切り替える
  const toggleApiMode = () => {
    logger.info(`API呼び出しモードを切り替え: ${!useRealApi ? '実際のAPI' : 'シミュレーション'}`);
    setUseRealApi(!useRealApi);
  };
  
  return (
    <div className="requirements-phase-container">
      <h2>要件定義フェーズ</h2>
      
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
      
      {/* API モードインジケーター */}
      <div className={`api-mode-indicator ${useRealApi ? 'api-mode' : 'simulation-mode'}`}>
        <span className="mode-label">モード: {useRealApi ? '実際のAI API' : 'シミュレーション'}</span>
        <button 
          onClick={toggleApiMode} 
          className="mode-toggle-button"
          disabled={isLoading || isSubmitting}
        >
          {useRealApi ? 'シミュレーションに切り替え' : '実際のAPIに切り替え'}
        </button>
      </div>
      
      {/* API エラー表示 */}
      {apiError && (
        <div className="error-card card">
          <h3>エラーが発生しました</h3>
          <p>{apiError}</p>
          <div className="error-actions">
            <button 
              onClick={handleRetry}
              className="retry-button"
            >
              再試行
            </button>
            <button 
              onClick={() => {
                setUseRealApi(false);
                setApiError(null);
                simulateExpertAnalysis();
              }}
              className="fallback-button"
            >
              シミュレーションに切り替え
            </button>
          </div>
        </div>
      )}
      
      {/* 専門家AI分析セクション */}
      <div className="card expert-analysis-section">
        <h3>専門家AI分析</h3>
        <div className="experts-grid">
          {experts.map(expert => (
            <div 
              key={expert.id} 
              className={`expert-card ${expert.status}`}
            >
              <div className="expert-icon">
                <i className={`fas fa-${expert.icon}`}></i>
              </div>
              <div className="expert-info">
                <h4>{expert.name}</h4>
                {expert.model && (
                  <div className="expert-model">
                    モデル: {expert.model}
                  </div>
                )}
                {expert.expertise && expert.expertise.length > 0 && (
                  <div className="expert-expertise">
                    専門: {expert.expertise.join(', ')}
                  </div>
                )}
                <div className="expert-status">
                  {expert.status === 'processing' ? (
                    <span className="processing">分析中...</span>
                  ) : expert.status === 'error' ? (
                    <span className="error">エラー</span>
                  ) : (
                    <span className="completed">分析完了</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 質問セクション */}
      {processingStep === 'summarization' && (
        <div className="card">
          <h3>まとめAI処理中</h3>
          <div className="loading"></div>
          <p className="processing-message">専門家AIの分析結果を統合しています...</p>
        </div>
      )}
      
      {(processingStep === 'questions' || processingStep === 'requirements-generation') && (
        <div className="card questions-section">
          <h3>質問と回答</h3>
          
          {/* ユーザー回答が必要な質問 */}
          <div className="question-group">
            <h4>ユーザー回答が必要:</h4>
            {userQuestions.length > 0 ? (
              userQuestions.map(question => (
                <div key={question.id} className="question-item">
                  <div className="question-header">
                    <span className="question-text">
                      <strong>質問{question.id.substring(1)}:</strong> {question.question}
                    </span>
                    <span className="expert-badge">
                      {experts.find(e => e.id === question.expertId)?.name || '専門家'}
                    </span>
                  </div>
                  
                  <div className="question-context">
                    コンテキスト: {question.context}
                  </div>
                  
                  {question.answered ? (
                    <div className="answer-display">
                      <strong>回答:</strong> {question.answer}
                    </div>
                  ) : (
                    <div className="answer-input">
                      <textarea
                        placeholder="回答を入力してください"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-questions-message">
                ユーザー回答が必要な質問はありません。専門家AIの意見が一致しています。
              </div>
            )}
          </div>
          
          {/* 自動回答済みの質問 */}
          <div className="question-group auto-answered">
            <h4>自動回答済み:</h4>
            {autoAnswers.length > 0 ? (
              autoAnswers.map(answer => (
                <div key={answer.id} className="question-item">
                  <div className="question-header">
                    <span className="question-text">
                      <strong>質問{answer.id.substring(1)}:</strong> {answer.question}
                    </span>
                    <span className="expert-badge">
                      {experts.find(e => e.id === answer.expertId)?.name || '専門家'}
                    </span>
                  </div>
                  
                  <div className="answer-section">
                    {editingAutoAnswer === answer.id ? (
                      <div className="edit-answer">
                        <textarea
                          value={answer.editValue || answer.answer}
                          onChange={(e) => setAutoAnswers(prev => 
                            prev.map(a => a.id === answer.id ? { ...a, editValue: e.target.value } : a)
                          )}
                        />
                        <div className="edit-buttons">
                          <button 
                            onClick={() => updateAutoAnswer(answer.id, answer.editValue || answer.answer)}
                            className="success"
                          >
                            保存
                          </button>
                          <button 
                            onClick={() => toggleEditAutoAnswer(null)}
                            className="secondary"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="answer-display">
                          <strong>回答:</strong> {answer.answer}
                          <span className={`confidence-badge ${answer.confidence.toLowerCase()}`}>
                            信頼度: {confidenceLabels[answer.confidence]}
                          </span>
                          {answer.userEdited && (
                            <span className="user-edited-badge">
                              編集済み
                            </span>
                          )}
                        </div>
                        <div className="answer-rationale">
                          <strong>根拠:</strong> {answer.rationale}
                        </div>
                        <button 
                          onClick={() => toggleEditAutoAnswer(answer.id)}
                          className="edit-button secondary"
                          disabled={isSubmitting}
                        >
                          回答を編集
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-questions-message">
                自動回答済みの質問はありません。
              </div>
            )}
          </div>
          
          {/* 質問回答ボタン */}
          {!isSubmitting && processingStep === 'questions' && (
            <div className="button-group">
              <button 
                onClick={submitAnswers}
                disabled={userQuestions.length > 0 && Object.keys(answers).length < userQuestions.length}
              >
                {userQuestions.length > 0 ? '質問に回答する' : '次へ進む'}
              </button>
            </div>
          )}
          
          {isSubmitting && (
            <div className="loading-indicator">
              <div className="loading"></div>
              <p>回答を処理しています...</p>
            </div>
          )}
        </div>
      )}
      
      {/* 要件表示セクション */}
      {processingStep === 'requirements-generation' && (
        <div className="card">
          <h3>要件定義生成中</h3>
          <div className="loading"></div>
          <p className="processing-message">回答に基づいて要件を生成しています...</p>
        </div>
      )}
      
      {processingStep === 'requirements-review' && (
        <div className="card requirements-section">
          <h3>要件定義ドキュメント</h3>
          
          <div className="requirements-list">
            <h4>機能要件</h4>
            {requirements
              .filter(req => req.category === '機能要件')
              .map(requirement => (
                <div 
                  key={requirement.id} 
                  className={`requirement-item ${requirement.status}`}
                  onClick={() => toggleRequirementStatus(requirement.id)}
                >
                  <div className="requirement-header">
                    <span className="requirement-id">{requirement.id}</span>
                    <span className="requirement-priority">{requirement.priority}</span>
                    <span className={`requirement-status ${requirement.status}`}>
                      {requirement.status === 'approved' ? '承認済み' : '検討中'}
                    </span>
                  </div>
                  <div className="requirement-description">
                    {requirement.description}
                  </div>
                  <div className="requirement-details">
                    {requirement.details}
                  </div>
                  {requirement.iteration > 1 && (
                    <div className="iteration-badge">
                      イテレーション {requirement.iteration} で追加
                    </div>
                  )}
                </div>
              ))}
            
            <h4>非機能要件</h4>
            {requirements
              .filter(req => req.category === '非機能要件')
              .map(requirement => (
                <div 
                  key={requirement.id} 
                  className={`requirement-item ${requirement.status}`}
                  onClick={() => toggleRequirementStatus(requirement.id)}
                >
                  <div className="requirement-header">
                    <span className="requirement-id">{requirement.id}</span>
                    <span className="requirement-priority">{requirement.priority}</span>
                    <span className={`requirement-status ${requirement.status}`}>
                      {requirement.status === 'approved' ? '承認済み' : '検討中'}
                    </span>
                  </div>
                  <div className="requirement-description">
                    {requirement.description}
                  </div>
                  <div className="requirement-details">
                    {requirement.details}
                  </div>
                  {requirement.iteration > 1 && (
                    <div className="iteration-badge">
                      イテレーション {requirement.iteration} で追加
                    </div>
                  )}
                </div>
              ))}
          </div>
          
          <div className="instructions">
            <p>各要件をクリックして承認状態を切り替えることができます。</p>
          </div>
          
          <div className="button-group">
            <button onClick={() => setProcessingStep('questions')} className="secondary">
              質問に戻る
            </button>
            <button 
              onClick={handleAddRequirements} 
              className="primary"
              disabled={iterationCount >= maxIterations || consensusReached}
            >
              要件を追加してやり直す
            </button>
            <button onClick={approveRequirements} className="success">
              要件を承認して次へ進む
            </button>
          </div>
          
          {iterationCount >= maxIterations && !consensusReached && (
            <div className="iteration-limit-message">
              <p>最大イテレーション回数に達しました。さらなる改善が必要な場合は設定から回数を増やしてください。</p>
            </div>
          )}
        </div>
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
              <div className="form-group">
                <label htmlFor="useRealApi">
                  <input
                    type="checkbox"
                    id="useRealApi"
                    checked={useRealApi}
                    onChange={(e) => setUseRealApi(e.target.checked)}
                  />
                  実際のAPIを使用する
                </label>
                <div className="field-hint">
                  オフにするとAI呼び出しをシミュレーションします（デモ用）
                </div>
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
              <h3>追加要件の入力</h3>
              <button className="close-button" onClick={() => setShowAddInputModal(false)}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitAdditionalRequirements(); }}>
              <div className="form-group">
                <label htmlFor="additionalRequirements">
                  現在の要件に追加したい要求仕様を入力してください:
                </label>
                <textarea
                  id="additionalRequirements"
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="例: ユーザーの操作履歴を記録する機能を追加したい、モバイルアプリ版も必要、など"
                  rows={6}
                  required
                />
              </div>
              <div className="form-notice">
                <p>
                  <strong>注意:</strong> この入力内容をもとに、AIが再度要件分析を行い、既存の要件に新たな要件を追加します。
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

export default RequirementsPhase;