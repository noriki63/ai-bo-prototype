import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectContext from '../context/ProjectContext';
import logger from '../utils/frontendLogger'; // ロガーをインポート
import './ProjectCreation.css';

const ProjectCreation = () => {
  const navigate = useNavigate();
  const { project, setProject } = useContext(ProjectContext);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // コンポーネントマウント時にログを記録
  useEffect(() => {
    logger.info('プロジェクト作成画面を表示', { 
      hasExistingProject: !!project.name,
      currentPhase: project.currentPhase || 'none'
    });
    
    // 終了時のクリーンアップ
    return () => {
      logger.debug('プロジェクト作成画面を終了');
    };
  }, []);
  
  // フォーム入力の状態
  const [formData, setFormData] = useState({
    name: project.name || '',
    specification: project.specification || '',
    techStack: project.advancedSettings?.techStack || false,
    architecture: project.advancedSettings?.architecture || false,
    database: project.advancedSettings?.database || false,
    security: project.advancedSettings?.security || false,
    performance: project.advancedSettings?.performance || false
  });

  // 入力変更ハンドラ
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    logger.debug(`フォーム入力変更: ${name}`, { type, value: type === 'checkbox' ? checked : value });
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 詳細設定の表示切り替え
  const toggleAdvanced = () => {
    logger.debug(`詳細設定の表示切り替え: ${!showAdvanced ? '表示' : '非表示'}`);
    setShowAdvanced(!showAdvanced);
  };

  // プロジェクト作成ハンドラ
  const handleCreateProject = (e) => {
    e.preventDefault();
    logger.info('プロジェクト作成開始', { 
      name: formData.name,
      specificationLength: formData.specification.length,
      advancedSettings: {
        techStack: formData.techStack,
        architecture: formData.architecture,
        database: formData.database,
        security: formData.security,
        performance: formData.performance
      }
    });
    
    setIsProcessing(true);
    
    // プロジェクト情報を更新
    const projectData = {
      ...project,
      name: formData.name,
      specification: formData.specification,
      advancedSettings: {
        techStack: formData.techStack,
        architecture: formData.architecture,
        database: formData.database,
        security: formData.security,
        performance: formData.performance
      },
      currentPhase: 'requirements',
      createdAt: new Date().toISOString()
    };
    
    setProject(projectData);
    logger.debug('プロジェクトデータ設定完了', { projectName: projectData.name });
    
    // 処理のシミュレーション
    setTimeout(() => {
      setIsProcessing(false);
      logger.info('プロジェクト作成完了、要件定義フェーズへ移動', { projectName: formData.name });
      navigate('/requirements');
    }, 1500);
  };

  return (
    <div className="project-creation-container">
      <h2>新規プロジェクト作成</h2>
      
      <form onSubmit={handleCreateProject} className="project-form card">
        <div className="form-group">
          <label htmlFor="projectName">プロジェクト名:</label>
          <input
            type="text"
            id="projectName"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="プロジェクト名を入力してください"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="projectSpec">プロジェクト概要（どんなシステムを作りたいか）:</label>
          <textarea
            id="projectSpec"
            name="specification"
            value={formData.specification}
            onChange={handleChange}
            placeholder="作りたいシステムの概要を自由に記述してください"
            required
          />
        </div>
        
        <div className="advanced-settings">
          <button 
            type="button" 
            className="toggle-advanced secondary"
            onClick={toggleAdvanced}
          >
            {showAdvanced ? '詳細設定を隠す ▲' : '詳細設定を表示 ▼'}
          </button>
          
          {showAdvanced && (
            <div className="advanced-options">
              <p>以下のオプションを選択すると、より詳細な設定が可能になります：</p>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="techStack"
                    checked={formData.techStack}
                    onChange={handleChange}
                  />
                  技術スタック指定
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="architecture"
                    checked={formData.architecture}
                    onChange={handleChange}
                  />
                  アーキテクチャ指定
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="database"
                    checked={formData.database}
                    onChange={handleChange}
                  />
                  データベース要件
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="security"
                    checked={formData.security}
                    onChange={handleChange}
                  />
                  セキュリティ要件
                </label>
                
                <label>
                  <input
                    type="checkbox"
                    name="performance"
                    checked={formData.performance}
                    onChange={handleChange}
                  />
                  パフォーマンス要件
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            className="create-button"
            disabled={isProcessing || !formData.name || !formData.specification}
          >
            {isProcessing ? '処理中...' : 'プロジェクト作成'}
          </button>
        </div>
        
        {isProcessing && (
          <div className="loading-indicator">
            <div className="loading"></div>
            <p>プロジェクトを初期化しています...</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProjectCreation;