import { NextRequest, NextResponse } from 'next/server';

// 気象庁API - 地域コード
const AREA_CODES = {
  tokyo: '130000',
  osaka: '270000',
  aichi: '230000',
  fukuoka: '400000',
  hokkaido: '016000'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area') || 'tokyo';
    
    // 地域コード取得
    const areaCode = AREA_CODES[area as keyof typeof AREA_CODES] || AREA_CODES.tokyo;
    
    // 気象庁APIから天気予報を取得
    const forecastUrl = `https://www.jma.go.jp/bosai/forecast/data/forecast/${areaCode}.json`;
    const overviewUrl = `https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${areaCode}.json`;
    
    // 並列でデータ取得
    const [forecastResponse, overviewResponse] = await Promise.all([
      fetch(forecastUrl),
      fetch(overviewUrl)
    ]);
    
    if (!forecastResponse.ok || !overviewResponse.ok) {
      throw new Error('気象庁APIからのデータ取得に失敗しました');
    }
    
    const forecastData = await forecastResponse.json();
    const overviewData = await overviewResponse.json();
    
    // データを整形
    const weather = {
      area: forecastData[0]?.timeSeries[0]?.areas[0]?.area?.name || '不明',
      publishTime: overviewData.reportDatetime || '',
      overview: overviewData.text || '',
      forecast: {
        today: {
          date: forecastData[0]?.timeSeries[0]?.timeDefines[0] || '',
          weather: forecastData[0]?.timeSeries[0]?.areas[0]?.weathers[0] || '',
          weatherCode: forecastData[0]?.timeSeries[0]?.areas[0]?.weatherCodes[0] || ''
        },
        tomorrow: {
          date: forecastData[0]?.timeSeries[0]?.timeDefines[1] || '',
          weather: forecastData[0]?.timeSeries[0]?.areas[0]?.weathers[1] || '',
          weatherCode: forecastData[0]?.timeSeries[0]?.areas[0]?.weatherCodes[1] || ''
        }
      },
      temperature: {
        today: {
          max: forecastData[0]?.timeSeries[2]?.areas[0]?.temps[0] || '',
          min: forecastData[0]?.timeSeries[2]?.areas[0]?.temps[1] || ''
        }
      }
    };
    
    return NextResponse.json({
      success: true,
      data: weather,
      source: '気象庁',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Weather API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Weather data could not be retrieved',
      message: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { area } = await request.json();
    
    // GETメソッドと同じ処理をPOSTでも対応
    const url = new URL(request.url);
    if (area) {
      url.searchParams.set('area', area);
    }
    
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