import React, { createContext, useState } from 'react';

// プロジェクトの状態を管理するコンテキスト
const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  // プロジェクトの状態
  const [project, setProject] = useState({
    name: '',
    specification: '',
    currentPhase: 'creation',
    // 要件定義フェーズ関連
    requirements: {
      items: [],
      iteration: 0,
      maxIterations: 3,
      consensusScore: 0,
      additionalInput: '',
      status: 'not_started' // 'not_started', 'in_progress', 'waiting_user', 'completed'
    },
    // 設計フェーズ関連
    design: {
      documents: {},
      diagrams: {},
      iteration: 0,
      maxIterations: 3,
      consensusScore: 0,
      additionalInput: '',
      status: 'not_started'
    },
    // 実装フェーズ関連
    implementation: {
      tasks: [],
      files: {},
      progress: 0,
      status: 'not_started'
    }
  });

  // AIプロバイダーと設定の状態
  const [aiSettings, setAiSettings] = useState({
    aiProvider: 'openai',
    apiKey: '',
    apiEndpoint: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
    expertAIs: {
      requirements: [
        { id: 'tech-expert', name: '技術専門家', enabled: true, model: 'gpt-4' },
        { id: 'security-expert', name: 'セキュリティ専門家', enabled: true, model: 'gpt-4' },
        { id: 'business-analyst', name: 'ビジネスアナリスト', enabled: true, model: 'gpt-4' }
      ],
      design: [
        { id: 'architect', name: 'システムアーキテクト', enabled: true, model: 'gpt-4' },
        { id: 'ui-designer', name: 'UIデザイナー', enabled: true, model: 'gpt-4' },
        { id: 'db-designer', name: 'DBデザイナー', enabled: true, model: 'gpt-4' }
      ]
    }
  });

  // プロジェクト内の特定の要素を更新するヘルパー関数
  const updateProjectField = (field, value) => {
    setProject(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 要件定義フェーズの状態を更新
  const updateRequirementsPhase = (updatedData) => {
    setProject(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        ...updatedData
      }
    }));
  };

  // 設計フェーズの状態を更新
  const updateDesignPhase = (updatedData) => {
    setProject(prev => ({
      ...prev,
      design: {
        ...prev.design,
        ...updatedData
      }
    }));
  };

  // 実装フェーズの状態を更新
  const updateImplementationPhase = (updatedData) => {
    setProject(prev => ({
      ...prev,
      implementation: {
        ...prev.implementation,
        ...updatedData
      }
    }));
  };

  // フェーズの進行を更新
  const advancePhase = (nextPhase) => {
    updateProjectField('currentPhase', nextPhase);
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        project, 
        setProject, 
        updateProjectField,
        updateRequirementsPhase,
        updateDesignPhase,
        updateImplementationPhase,
        advancePhase,
        aiSettings,
        setAiSettings
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;