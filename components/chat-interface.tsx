'use client'

import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  agentData?: any
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんにちは！Spec AIです。複数のAIエージェントがチームでお答えします。何でもお聞きください！',
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // 実際のAPI呼び出し
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const aiResponse: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date().toISOString(),
          agentData: data.data.agentData
        }
        
        setMessages(prev => [...prev, aiResponse])
      } else {
        // エラー時の対応
        const errorResponse: Message = {
          role: 'assistant',
          content: `申し訳ございません。エラーが発生しました: ${data.error || '不明なエラー'}`,
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, errorResponse])
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      
      // 通信エラー時の対応
      const errorResponse: Message = {
        role: 'assistant',
        content: 'ネットワークエラーが発生しました。サーバーに接続できません。しばらく時間をおいてからもう一度お試しください。',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Spec AI チャット</h2>
          <p className="text-blue-100">AIエージェント群があなたをサポートします</p>
          <div className="mt-2 text-sm text-blue-200">
            🔍 情報収集 📊 分析 🔮 予測 ✍️ 回答生成 🔧 自動修復
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="h-96 overflow-y-auto p-6 chat-container bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-6 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-3xl p-4 rounded-2xl message-bubble ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-white text-gray-800 rounded-bl-md shadow-md border'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {/* エージェントデータの表示 */}
                {msg.agentData && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">
                      AIエージェント群の処理データ:
                    </div>
                    {msg.agentData.sources && (
                      <div className="text-xs text-gray-600">
                        📊 データソース: {msg.agentData.sources.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="text-left mb-6">
              <div className="inline-block bg-white p-4 rounded-2xl rounded-bl-md shadow-md border">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <div className="text-gray-600">
                    <div className="text-sm font-medium">AIエージェント群が協議中...</div>
                    <div className="text-xs text-gray-500 mt-1">
                      🔍 データ収集 → 📊 分析 → 🔮 予測 → ✍️ 回答生成
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="border-t bg-white p-6">
          {/* クイック質問ボタン */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              '今日の天気は？',
              '東京の情報教えて',
              '交通状況はどう？',
              'おすすめの場所は？'
            ].map((quickQ, idx) => (
              <button
                key={idx}
                onClick={() => setInput(quickQ)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                disabled={loading}
              >
                {quickQ}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="何でもお聞きください... (Enterで送信、Shift+Enterで改行)"
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '送信中...' : '送信'}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Powered by Qwen AI + 日本政府公式データ + AIエージェント群
          </div>
        </div>
      </div>
    </div>
  )
}