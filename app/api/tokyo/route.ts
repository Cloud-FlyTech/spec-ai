import { NextRequest, NextResponse } from 'next/server';

// 東京都オープンデータAPI設定
const TOKYO_API_BASE = 'https://service.api.metro.tokyo.lg.jp/api';

// よく使われるデータセットのAPI ID
const DATASETS = {
  // 人口統計
  population: 't000001d0000000001-population-data-0',
  // 施設情報
  facilities: 't132047d0000000004-44947822b3c13ba51b59e3278e2d018c-0',
  // 観光スポット
  tourism: 't132047d0000000005-tourism-spots-data-0',
  // 交通情報
  transport: 't000001d0000000020-transport-info-0'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') || 'facilities';
    const limit = searchParams.get('limit') || '20';
    
    // データセットID取得
    const apiId = DATASETS[dataType as keyof typeof DATASETS] || DATASETS.facilities;
    
    // 東京都APIエンドポイント構築
    const apiUrl = `${TOKYO_API_BASE}/${apiId}/json?limit=${limit}`;
    
    // リクエストボディ（東京都APIの仕様）
    const requestBody = {
      column: [], // 全カラム取得
      searchCondition: {
        conditionRelationship: "and",
        dateAndSearch: []
      }
    };
    
    // 東京都APIにPOSTリクエスト
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`東京都API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // データ整形
    const result = {
      dataType,
      totalCount: data.total || 0,
      items: data.hits || [],
      source: '東京都オープンデータ',
      lastUpdate: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: result,
      availableTypes: Object.keys(DATASETS),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Tokyo API Error:', error);
    
    // フォールバック：サンプルデータ
    const fallbackData = {
      dataType: 'sample',
      totalCount: 3,
      items: [
        {
          name: '東京駅',
          address: '東京都千代田区丸の内1丁目',
          type: '交通施設',
          description: '東京の中央駅'
        },
        {
          name: '東京都庁',
          address: '東京都新宿区西新宿2-8-1',
          type: '行政施設',
          description: '東京都の本庁舎'
        },
        {
          name: '上野動物園',
          address: '東京都台東区上野公園9-83',
          type: '観光施設',
          description: '日本最古の動物園'
        }
      ],
      source: 'サンプルデータ（東京都API接続エラー時）',
      lastUpdate: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      note: '東京都APIに接続できないため、サンプルデータを表示しています',
      error: error instanceof Error ? error.message : '不明なエラー'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, limit, searchQuery } = await request.json();
    
    // POSTパラメータをクエリパラメータに変換してGETメソッドを呼び出し
    const url = new URL(request.url);
    if (type) url.searchParams.set('type', type);
    if (limit) url.searchParams.set('limit', limit.toString());
    if (searchQuery) url.searchParams.set('query', searchQuery);
    
    const getRequest = new NextRequest(url.toString(), {
      method: 'GET'
    });
    
    return GET(getRequest);
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request format'
    }, { status: 400 });
  }
}