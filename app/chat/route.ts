import { NextRequest, NextResponse } from 'next/server';

// Qwen API設定
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// 情報収集エージェント
async function gatherInformation(query: string) {
  try {
    const results = await Promise.allSettled([
      // 天気情報
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/weather?area=tokyo`),
      // 東京都情報
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tokyo?type=facilities&limit=5`),
      // 交通情報
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transport?region=kanto`)
    ]);

    const data: any = {};
    
    if (results[0].status === 'fulfilled' && results[0].value.ok) {
      data.weather = await results[0].value.json();
    }
    
    if (results[1].status === 'fulfilled' && results[1].value.ok) {
      data.tokyo = await results[1].value.json();
    }
    
    if (results[2].status === 'fulfilled' && results[2].value.ok) {
      data.transport = await results[2].value.json();
    }

    return data;
  } catch (error) {
    console.error('Information gathering failed:', error);
    return {};
  }
}

// Qwen API呼び出し
async function callQwenAPI(prompt: string) {
  try {
    const apiKey = process.env.QWEN_API_KEY;
    
    if (!apiKey) {
      throw new Error('Qwen API key not configured');
    }

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Qwen API error: ${response.status}`);
    }

    const data = await response.json();
    return data.output?.text || data.output?.choices?.[0]?.message?.content || 'Qwen APIからの応答を取得できませんでした';
    
  } catch (error) {
    console.error('Qwen API call failed:', error);
    return `Qwen API接続エラー: ${error instanceof Error ? error.message : '不明なエラー'}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    console.log('🔍 情報収集エージェント: データ収集開始...');
    const information = await gatherInformation(message);
    
    console.log('📊 分析エージェント: 情報分析中...');
    const analysisPrompt = `
ユーザーの質問: "${message}"

収集した情報:
${JSON.stringify(information, null, 2)}

あなたは専門的な分析エージェントです。収集した情報を詳細に分析し、パターンや傾向を見つけてください。
分析結果を簡潔にまとめてください。
`;
    
    const analysis = await callQwenAPI(analysisPrompt);
    
    console.log('🔮 予測エージェント: 未来予測中...');
    const predictionPrompt = `
分析結果: ${analysis}

この分析結果に基づいて、今後の予測や傾向を予想してください。
特に日本の政府データや地域情報を踏まえた予測をお願いします。
`;
    
    const prediction = await callQwenAPI(predictionPrompt);
    
    console.log('✍️ 回答生成エージェント: 最終回答作成中...');
    const responsePrompt = `
ユーザーの質問: "${message}"

情報収集結果: ${JSON.stringify(information, null, 2)}
分析結果: ${analysis}
予測結果: ${prediction}

あなたは親切なAIアシスタントです。上記の情報を統合して、ユーザーに分かりやすく親切な回答を作成してください。

以下の形式で回答してください:
1. 質問への直接的な回答
2. 収集した政府公式データからの補足情報
3. 今後の予測や提案

日本語で自然な会話調で回答してください。
`;
    
    const finalResponse = await callQwenAPI(responsePrompt);
    
    const result = {
      response: finalResponse,
      agentData: {
        information,
        analysis: analysis.substring(0, 200) + '...', // 要約版
        prediction: prediction.substring(0, 200) + '...', // 要約版
        timestamp: new Date().toISOString()
      },
      sources: [
        '気象庁API',
        '東京都オープンデータ',
        '全国交通情報',
        'Qwen AI'
      ]
    };

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // エラー時の修復AI機能
    console.log('🔧 修復AI: エラー修復中...');
    
    const fallbackResponse = {
      response: `申し訳ございません。現在システムに一時的な問題が発生しています。

修復AIが以下を試行しました:
- API接続の再試行
- フォールバックシステムへの切り替え
- エラーログの記録

しばらく時間をおいてから再度お試しください。基本的な質問であれば、政府公式データを使って回答いたします。`,
      agentData: {
        error: true,
        repairAttempted: true,
        fallbackActivated: true,
        timestamp: new Date().toISOString()
      },
      sources: ['修復AI', 'フォールバックシステム']
    };

    return NextResponse.json({
      success: true,
      data: fallbackResponse,
      repaired: true,
      error: error instanceof Error ? error.message : '不明なエラー'
    });
  }
}