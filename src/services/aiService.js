// AIプロバイダーとの通信を管理するサービス
import logger from '../utils/frontendLogger';

// 専門家AI用プロンプトテンプレート
const EXPERT_PROMPT_TEMPLATE = `
あなたは{expertName}として、以下の要求仕様を分析してください。
{expertDescription}としての専門的な視点から、洞察力のある分析と具体的な要件提案を行ってください。

## 要求仕様:
{specification}

## 追加コンテキスト:
{additionalContext}

## 指示:
1. 上記の要求仕様を分析し、具体的な機能要件と非機能要件を識別してください。
2. 各要件に優先度（MUST/SHOULD/COULD/WONT）を割り当ててください。
3. 要件の不明瞭な部分や、仕様から抜け落ちている可能性のある要件を指摘してください。
4. ユーザーに確認すべき質問をリストアップしてください。

## 回答形式:
以下のJSON形式で回答してください:
{
  "analysis": "要求仕様の全体分析",
  "requirements": [
    {
      "id": "FR-001",
      "description": "機能要件の説明",
      "priority": "MUST/SHOULD/COULD/WONT",
      "rationale": "この要件が必要な理由"
    }
  ],
  "concerns": [
    {
      "topic": "懸念事項のトピック",
      "description": "懸念の詳細"
    }
  ],
  "questions": [
    {
      "question": "質問内容",
      "context": "この質問が必要な理由",
      "priority": "HIGH/MEDIUM/LOW",
      "requires_user_input": true/false,
      "reason_for_user_input": "ユーザー入力が必要な理由"
    }
  ]
}
`;

// まとめAI用プロンプトテンプレート
const SUMMARIZER_PROMPT_TEMPLATE = `
あなたは複数の専門家AIの意見を統合する「まとめAI」です。
専門家AIの分析結果を統合し、一貫性のある要件定義と質問を作成してください。

## 専門家AIの分析結果:
{expertAnalysesJSON}

## プロジェクト情報:
プロジェクト名: {projectName}
現在のイテレーション: {iterationCount}
{previousRequirementsContext}

## 指示:
1. 専門家AIの意見を統合し、矛盾点を解決してください。
2. ユーザーに確認すべき質問と自動回答可能な質問を分類してください。
3. 専門家AI間の一致度を評価してください。
4. 前回の要件があれば、それらを考慮に入れてください。

## 回答形式:
以下のJSON形式で回答してください:
{
  "questions": {
    "user_required_questions": [
      {
        "id": "Q-001",
        "question": "質問内容",
        "context": "質問の背景",
        "priority": "HIGH",
        "expertId": "専門家ID"
      }
    ],
    "auto_answered_questions": [
      {
        "id": "Q-002",
        "question": "質問内容",
        "answer": "自動生成された回答",
        "confidence": "HIGH/MEDIUM/LOW",
        "rationale": "自動回答の根拠",
        "expertId": "専門家ID"
      }
    ]
  },
  "consensus_evaluation": {
    "score": 0.72,
    "disagreement_areas": [
      {
        "topic": "不一致のトピック",
        "experts": ["expert_id_1", "expert_id_2"]
      }
    ],
    "iteration_recommendation": "CONTINUE/COMPLETE"
  }
}
`;

// 要件生成用プロンプトテンプレート
const REQUIREMENTS_GENERATION_TEMPLATE = `
あなたは要件定義エンジニアです。
ユーザーの回答に基づいて、最終的な要件定義ドキュメントを作成してください。

## 質問と回答:
{questionsAndAnswersJSON}

## 前回の要件:
{previousRequirementsJSON}

## プロジェクト情報:
プロジェクト名: {projectName}
現在のイテレーション: {iterationCount}

## 指示:
1. ユーザーの回答を分析し、具体的な要件に変換してください。
2. 前回の要件があれば、それらを更新または追加してください。
3. 要件には一意のIDを割り当て、適切な優先度を設定してください。
4. イテレーション番号も記録してください。

## 回答形式:
以下のJSON形式で回答してください:
{
  "requirements": [
    {
      "id": "FR-001",
      "category": "機能要件",
      "description": "要件の説明",
      "priority": "MUST/SHOULD/COULD/WONT",
      "status": "approved/discussion",
      "details": "詳細説明",
      "iteration": 1
    }
  ]
}
`;

// 設定とAPIキーの取得
const getSettings = async () => {
  try {
    if (window.electronAPI && typeof window.electronAPI.getSettings === 'function') {
      const settings = await window.electronAPI.getSettings();
      if (settings) {
        return settings;
      }
    }
    
    // ブラウザ環境または設定が見つからない場合
    const savedSettings = localStorage.getItem('aiBoSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    // デフォルト設定を返す
    logger.warn('設定が見つかりません。デフォルト設定を使用します。');
    return {
      aiProvider: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    };
  } catch (error) {
    logger.error('設定の取得に失敗しました:', error);
    // エラーの場合もデフォルト設定を返す
    return {
      aiProvider: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000
    };
  }
};

// OpenAI APIへのリクエスト
const callOpenAI = async (prompt, model, temperature, maxTokens) => {
  try {
    const settings = await getSettings();
    const apiKey = settings.apiKey;
    const apiEndpoint = settings.apiEndpoint || 'https://api.openai.com';
    
    logger.debug('OpenAI API呼び出し', { model, temperature, maxTokens });
    
    const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || settings.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature || settings.temperature,
        max_tokens: maxTokens || settings.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error('OpenAI API呼び出しエラー:', error);
    throw error;
  }
};

// Anthropic APIへのリクエスト
const callAnthropic = async (prompt, model, temperature, maxTokens) => {
  try {
    const settings = await getSettings();
    const apiKey = settings.anthropicApiKey;
    const apiEndpoint = settings.anthropicApiEndpoint || 'https://api.anthropic.com';
    
    logger.debug('Anthropic API呼び出し', { model, temperature, maxTokens });
    
    const response = await fetch(`${apiEndpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || settings.anthropicModel || 'claude-3-opus',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens || settings.maxTokens,
        temperature: temperature || settings.temperature
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    logger.error('Anthropic API呼び出しエラー:', error);
    throw error;
  }
};

// Azure OpenAI APIへのリクエスト
const callAzure = async (prompt, deploymentName, temperature, maxTokens) => {
  try {
    const settings = await getSettings();
    const apiKey = settings.azureApiKey;
    const endpoint = settings.azureEndpoint;
    const deployment = deploymentName || settings.azureDeploymentName;
    
    if (!endpoint || !deployment) {
      throw new Error('Azure設定が不完全です');
    }
    
    logger.debug('Azure OpenAI API呼び出し', { deployment, temperature, maxTokens });
    
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-05-15`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature || settings.temperature,
        max_tokens: maxTokens || settings.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Azure OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error('Azure OpenAI API呼び出しエラー:', error);
    throw error;
  }
};

// Google Vertex AIへのリクエスト
const callGoogleVertexAI = async (prompt, model, temperature, maxTokens) => {
  try {
    logger.debug('Google Vertex AI API呼び出し試行');
    
    // GoogleはElectronのIPC経由での実装が必要なため、ブラウザ環境では非対応
    if (window.electronAPI && typeof window.electronAPI.callGoogleAI === 'function') {
      const settings = await getSettings();
      return await window.electronAPI.callGoogleAI(prompt, {
        projectId: settings.googleProjectId,
        location: settings.googleLocation,
        model: model || settings.googleModel || 'gemini-pro',
        temperature: temperature || settings.temperature,
        maxTokens: maxTokens || settings.maxTokens
      });
    } else {
      throw new Error('Google Vertex AI APIはElectron環境でのみ利用可能です');
    }
  } catch (error) {
    logger.error('Google Vertex AI API呼び出しエラー:', error);
    throw error;
  }
};

// OpenRouter APIへのリクエスト
const callOpenRouter = async (prompt, model, temperature, maxTokens) => {
  try {
    const settings = await getSettings();
    const apiKey = settings.openrouterApiKey;
    
    logger.debug('OpenRouter API呼び出し', { model, temperature, maxTokens });
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'ai-bo-prototype'
      },
      body: JSON.stringify({
        model: model || settings.openrouterModel || 'openai/gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature || settings.temperature,
        max_tokens: maxTokens || settings.maxTokens
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    logger.error('OpenRouter API呼び出しエラー:', error);
    throw error;
  }
};

// ローカルモデルへのリクエスト
const callLocalModel = async (prompt, params = {}) => {
  try {
    logger.debug('ローカルモデル呼び出し試行');
    
    // ローカルモデルはElectronのIPC経由での実装が必要
    if (window.electronAPI && typeof window.electronAPI.callLocalModel === 'function') {
      const settings = await getSettings();
      return await window.electronAPI.callLocalModel(prompt, {
        modelPath: settings.localModelPath,
        temperature: params.temperature || settings.temperature,
        maxTokens: params.maxTokens || settings.maxTokens,
        ...params
      });
    } else {
      throw new Error('ローカルモデルはElectron環境でのみ利用可能です');
    }
  } catch (error) {
    logger.error('ローカルモデル呼び出しエラー:', error);
    throw error;
  }
};

// AI処理の実行 - プロバイダーに応じたAPIを呼び出す
const processWithAI = async (prompt, options = {}) => {
  try {
    let settings = await getSettings();
    
    // オプションから設定を優先
    const provider = options.provider || settings.aiProvider || 'openai';
    const model = options.model || settings.model || 'gpt-4o';
    const temperature = options.temperature || settings.temperature || 0.7;
    const maxTokens = options.maxTokens || settings.maxTokens || 4000;
    
    logger.info('AI処理実行', { provider, promptLength: prompt.length });
    
    switch (provider) {
      case 'openai':
        return await callOpenAI(prompt, model, temperature, maxTokens);
      case 'anthropic':
        return await callAnthropic(prompt, model, temperature, maxTokens);
      case 'azure':
        return await callAzure(prompt, model, temperature, maxTokens);
      case 'google':
        return await callGoogleVertexAI(prompt, model, temperature, maxTokens);
      case 'openrouter':
        return await callOpenRouter(prompt, model, temperature, maxTokens);
      case 'local':
        return await callLocalModel(prompt, options);
      default:
        throw new Error(`未対応のAIプロバイダー: ${provider}`);
    }
  } catch (error) {
    logger.error('AI処理エラー:', error);
    throw error;
  }
};

// 専門家AIによる分析
const processWithExpertAI = async (specification, expert, context = {}) => {
  try {
    logger.info('専門家AI分析開始', { expertId: expert.id, expertName: expert.name });
    
    // 追加コンテキストの処理
    let additionalContext = '';
    if (context.iteration > 1 && context.previousRequirements && context.previousRequirements.length > 0) {
      additionalContext = `
## 前回のイテレーションで特定された要件:
${JSON.stringify(context.previousRequirements, null, 2)}

これらの要件を考慮に入れて、分析と質問を更新してください。`;
    }
    
    if (context.additionalInput) {
      additionalContext += `
## ユーザーからの追加要求仕様:
${context.additionalInput}

この追加要求も考慮に入れてください。`;
    }
    
    // 専門家AI用のプロンプトを作成
    const expertPrompt = EXPERT_PROMPT_TEMPLATE
      .replace('{expertName}', expert.name)
      .replace('{expertDescription}', expert.description || `${expert.name}としての専門知識を持つAI`)
      .replace('{specification}', specification)
      .replace('{additionalContext}', additionalContext);
    
    // 専門家固有の設定
    const expertOptions = {
      provider: expert.provider,
      model: expert.providerSettings?.model || expert.model,
      temperature: 0.2, // 専門家は一貫性を重視
      maxTokens: 4000 // 十分な回答スペース
    };
    
    // AIを呼び出し
    const response = await processWithAI(expertPrompt, expertOptions);
    
    // JSON応答をパース
    const parsedResponse = parseAIResponse(response);
    
    // 専門家情報を追加
    return {
      expertId: expert.id,
      expertName: expert.name,
      ...parsedResponse
    };
  } catch (error) {
    logger.error(`専門家AI分析エラー (${expert.name}):`, error);
    // エラーを含む結果を返す (完全に失敗させないため)
    return {
      expertId: expert.id,
      expertName: expert.name,
      error: error.message,
      analysis: "分析中にエラーが発生しました",
      requirements: [],
      questions: []
    };
  }
};

// 複数の専門家AIで並列処理
const processWithExpertAIs = async (specification, expertAIs, context = {}) => {
  try {
    logger.info('複数専門家AI分析開始', { expertCount: expertAIs.length });
    
    // 有効な専門家AIだけをフィルタリング
    const enabledExperts = expertAIs.filter(expert => expert.status !== 'error');
    
    // 各専門家AI用のプロンプトを作成し並列処理
    const expertPromises = enabledExperts.map(expert => 
      processWithExpertAI(specification, expert, context)
    );
    
    // すべての専門家AIの結果を待機
    const results = await Promise.all(expertPromises);
    logger.info('複数専門家AI分析完了', { successCount: results.filter(r => !r.error).length });
    return results;
  } catch (error) {
    logger.error('専門家AI並列処理エラー:', error);
    throw error;
  }
};

// まとめAIによる統合処理
const processWithSummarizerAI = async (expertResults, context = {}) => {
  try {
    logger.info('まとめAI処理開始', { expertResultsCount: expertResults.length });
    
    // 専門家AI分析結果をJSONとして整形
    const expertResultsJSON = JSON.stringify(expertResults, null, 2);
    
    // 前回の要件に関するコンテキスト
    let previousRequirementsContext = "初回の要件定義です";
    if (context.previousRequirements && context.previousRequirements.length > 0) {
      previousRequirementsContext = `前回のイテレーションで特定された要件が存在します。適宜これらを参考にしてください。`;
    }
    
    // まとめAI用のプロンプト
    const prompt = SUMMARIZER_PROMPT_TEMPLATE
      .replace('{expertAnalysesJSON}', expertResultsJSON)
      .replace('{projectName}', context.projectName || '未名プロジェクト')
      .replace('{iterationCount}', context.iteration || 1)
      .replace('{previousRequirementsContext}', previousRequirementsContext);
    
    // AIプロバイダーに送信 (まとめAIは主要なプロバイダーを使用)
    const settings = await getSettings();
    
    const response = await processWithAI(prompt, {
      provider: settings.aiProvider || 'openai',
      model: settings.model || 'gpt-4o',
      temperature: 0.3, // まとめAIも一貫性を重視
      maxTokens: 4000 // 十分な回答スペース
    });
    
    // JSON応答をパース
    const result = parseAIResponse(response);
    logger.info('まとめAI処理完了', { 
      userQuestions: result.questions?.user_required_questions?.length || 0,
      autoAnswers: result.questions?.auto_answered_questions?.length || 0,
      consensusScore: result.consensus_evaluation?.score
    });
    
    return result;
  } catch (error) {
    logger.error('まとめAI処理エラー:', error);
    throw error;
  }
};

// 質問回答に基づく要件生成
const processUserAnswers = async (questions, previousRequirements = [], context = {}) => {
  try {
    logger.info('ユーザー回答処理開始', { 
      questionCount: questions.length,
      previousRequirementsCount: previousRequirements.length
    });
    
    // 質問と回答をJSONとして整形
    const questionsAndAnswersJSON = JSON.stringify(questions, null, 2);
    
    // 前回の要件をJSONとして整形
    const previousRequirementsJSON = previousRequirements.length > 0 
      ? JSON.stringify(previousRequirements, null, 2)
      : "前回の要件はありません。";
    
    // 要件生成用のプロンプト
    const prompt = REQUIREMENTS_GENERATION_TEMPLATE
      .replace('{questionsAndAnswersJSON}', questionsAndAnswersJSON)
      .replace('{previousRequirementsJSON}', previousRequirementsJSON)
      .replace('{projectName}', context.projectName || '未名プロジェクト')
      .replace('{iterationCount}', context.iteration || 1);
    
    // AIプロバイダーに送信
    const settings = await getSettings();
    const response = await processWithAI(prompt, {
      provider: settings.aiProvider || 'openai',
      model: settings.model || 'gpt-4o',
      temperature: 0.2, // 要件生成も一貫性を重視
      maxTokens: 4000  
    });
    
    // JSON応答をパース
    const result = parseAIResponse(response);
    logger.info('要件生成完了', { 
      requirementsCount: result.requirements?.length || 0
    });
    
    return result;
  } catch (error) {
    logger.error('要件生成エラー:', error);
    throw error;
  }
};

// JSON応答をパースするヘルパー関数
const parseAIResponse = (response) => {
  try {
    // JSON部分を抽出
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                      response.match(/```\n([\s\S]*?)\n```/) || 
                      response.match(/({[\s\S]*})/);
    
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    
    // JSONパース
    logger.debug('AI応答のJSONパース試行', { responseLength: response.length });
    const parsedData = JSON.parse(jsonStr);
    return parsedData;
  } catch (error) {
    logger.error('JSONパースエラー:', error);
    logger.debug('パース対象文字列:', response.substring(0, 300) + "...");
    
    // フォールバック: 単純な応答をオブジェクトに
    return { 
      parseError: true, 
      rawResponse: response,
      analysis: "AI応答のパースに失敗しました。"
    };
  }
};

export {
  getSettings,
  processWithAI,
  processWithExpertAI,
  processWithExpertAIs,
  processWithSummarizerAI,
  processUserAnswers,
  parseAIResponse
};