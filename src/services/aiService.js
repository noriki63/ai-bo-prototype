// AIプロバイダーとの通信を管理するサービス

// 設定とAPIキーの取得
const getSettings = async () => {
    try {
      return await window.electronAPI.getSettings();
    } catch (error) {
      console.error('設定の取得に失敗しました:', error);
      throw error;
    }
  };
  
  // OpenAI APIへのリクエスト
  const callOpenAI = async (prompt, model, temperature, maxTokens) => {
    try {
      const settings = await getSettings();
      const apiKey = settings.apiKey;
      const apiEndpoint = settings.apiEndpoint || 'https://api.openai.com';
      
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
      console.error('OpenAI API呼び出しエラー:', error);
      throw error;
    }
  };
  
  // Anthropic APIへのリクエスト
  const callAnthropic = async (prompt, model, temperature, maxTokens) => {
    try {
      const settings = await getSettings();
      const apiKey = settings.apiKey;
      const apiEndpoint = settings.apiEndpoint || 'https://api.anthropic.com';
      
      const response = await fetch(`${apiEndpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || settings.model,
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
      console.error('Anthropic API呼び出しエラー:', error);
      throw error;
    }
  };
  
  // Azure OpenAI APIへのリクエスト
  const callAzure = async (prompt, deploymentName, temperature, maxTokens) => {
    try {
      const settings = await getSettings();
      const apiKey = settings.apiKey;
      const endpoint = settings.apiEndpoint;
      
      if (!endpoint || !deploymentName) {
        throw new Error('Azure設定が不完全です');
      }
      
      const response = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`, {
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
      console.error('Azure OpenAI API呼び出しエラー:', error);
      throw error;
    }
  };
  
  // Google Vertex AIへのリクエスト
  // 注: 実際の実装では認証方法が異なるため、ElectronのIPCを使用して実装する必要がある
  const callGoogleVertexAI = async (prompt, model, temperature, maxTokens) => {
    // 現時点ではモック実装
    throw new Error('Google Vertex AI APIは現在実装中です');
  };
  
  // OpenRouter APIへのリクエスト
  const callOpenRouter = async (prompt, model, temperature, maxTokens) => {
    try {
      const settings = await getSettings();
      const apiKey = settings.apiKey;
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'ai-bo-prototype'
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
        throw new Error(`OpenRouter API Error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API呼び出しエラー:', error);
      throw error;
    }
  };
  
  // AI処理の実行 - プロバイダーに応じたAPIを呼び出す
  const processWithAI = async (prompt, options = {}) => {
    try {
      const settings = await getSettings();
      const provider = options.provider || settings.aiProvider;
      const model = options.model || settings.model;
      const temperature = options.temperature || settings.temperature;
      const maxTokens = options.maxTokens || settings.maxTokens;
      
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
        default:
          throw new Error(`未対応のAIプロバイダー: ${provider}`);
      }
    } catch (error) {
      console.error('AI処理エラー:', error);
      throw error;
    }
  };
  
  // 複数の専門家AIで並列処理
  const processWithExpertAIs = async (prompt, expertAIs, options = {}) => {
    try {
      // 有効な専門家AIだけをフィルタリング
      const enabledExperts = expertAIs.filter(expert => expert.enabled);
      
      // 各専門家AI用のプロンプトを作成
      const expertPromises = enabledExperts.map(async (expert) => {
        const expertPrompt = `あなたは${expert.name}として以下の要求仕様を分析してください。
  ${prompt}
  
  以下のJSON形式で回答してください:
  {
    "analysis": "要求仕様の分析",
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
        "question": "明確にすべき質問",
        "context": "この質問が必要な背景",
        "priority": "HIGH/MEDIUM/LOW",
        "requires_user_input": true/false,
        "reason_for_user_input": "ユーザー入力が必要な理由"
      }
    ]
  }`;
  
        try {
          const response = await processWithAI(expertPrompt, {
            model: expert.model || options.model,
            temperature: options.temperature,
            maxTokens: options.maxTokens
          });
          
          // JSON応答をパース
          const parsedResponse = parseAIResponse(response);
          
          return {
            expertId: expert.id,
            expertName: expert.name,
            ...parsedResponse
          };
        } catch (error) {
          console.error(`${expert.name}の処理中にエラーが発生:`, error);
          return {
            expertId: expert.id,
            expertName: expert.name,
            error: error.message
          };
        }
      });
      
      // すべての専門家AIの結果を待機
      return await Promise.all(expertPromises);
    } catch (error) {
      console.error('専門家AIの処理エラー:', error);
      throw error;
    }
  };
  
  // まとめAIによる統合処理
  const processWithSummarizerAI = async (expertResults, projectContext, options = {}) => {
    try {
      const settings = await getSettings();
      const provider = options.provider || settings.aiProvider;
      const model = options.model || settings.model;
      const temperature = options.temperature || settings.temperature;
      const maxTokens = options.maxTokens || settings.maxTokens;
      
      // 専門家AI分析結果をJSONとして整形
      const expertResultsJson = JSON.stringify(expertResults, null, 2);
      
      // プロジェクトコンテキストを整形
      const contextJson = JSON.stringify(projectContext, null, 2);
      
      // まとめAI用のプロンプト
      const prompt = `あなたは専門家AIの分析結果を統合するまとめAIです。
  複数の専門家AIによる要求仕様に対する分析結果を統合して、一貫性のある要件定義を作成してください。
  また、専門家AIが挙げた質問を分析し、ユーザーの入力が必要なものと自動的に回答できるものに分類してください。
  
  ## 専門家AI分析結果:
  ${expertResultsJson}
  
  ## プロジェクトコンテキスト:
  ${contextJson}
  
  以下のJSON形式で回答してください:
  {
    "summarized_requirements": {
      "requirements": [
        {
          "id": "FR-001",
          "category": "機能要件",
          "description": "要件の説明",
          "priority": "MUST/SHOULD/COULD/WONT",
          "status": "approved/discussion",
          "details": "詳細説明",
          "rationale": "理由"
        }
      ],
      "conflicts": [
        {
          "id": "CONF-001",
          "requirements": ["FR-003", "FR-007"],
          "description": "対立の説明",
          "resolution_options": [
            {
              "id": "RES-001",
              "description": "解決策の説明",
              "impact": "影響"
            }
          ]
        }
      ],
      "questions": {
        "user_required_questions": [
          {
            "id": "Q-001",
            "question": "質問文",
            "context": "質問の背景",
            "priority": "HIGH/MEDIUM/LOW",
            "reason_for_user_input": "ユーザー入力が必要な理由",
            "expertId": "専門家ID"
          }
        ],
        "auto_answered_questions": [
          {
            "id": "Q-002",
            "question": "質問文",
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
  }`;
  
      // AIプロバイダーに送信
      const response = await processWithAI(prompt, {
        provider,
        model,
        temperature,
        maxTokens
      });
      
      // JSON応答をパース
      return parseAIResponse(response);
    } catch (error) {
      console.error('まとめAI処理エラー:', error);
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
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('JSONパースエラー:', error);
      console.log('パース対象文字列:', response);
      // エラーが発生してもレスポンスをそのまま返す
      return { rawResponse: response };
    }
  };
  
  export {
    getSettings,
    processWithAI,
    processWithExpertAIs,
    processWithSummarizerAI
  };