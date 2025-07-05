'use client'

import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
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
    setInput('')
    setLoading(true)

    // 模擬的なAIエージェント群の応答
    setTimeout(() => {
      const agentResponse: Message = {
        role: 'assistant',
        content: `AIエージェント群が協議した結果：\n\n🔍 情報収集エージェント: データを収集しました\n📊 分析エージェント: パターンを分析しました\n🔮 予測エージェント: 傾向を予測しました\n✍️ 回答エージェント: 「${input}」について総合的にお答えします。\n\n現在はデモモードです。AIエージェント群システムを開発中です！`,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, agentResponse])
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Spec AI チャット</h2>
          <p className="text-blue-100">AIエージェント群があなたをサポートします</p>
        </div>

        {/* メッセージエリア */}
        <div className="h-96 overflow-y-auto p-6 chat-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-6 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-3xl p-4 rounded-2xl message-bubble ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-md' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
                <div className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString('ja-JP')}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="text-left mb-6">
              <div className="inline-block bg-gray-100 p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-gray-600">AIエージェント群が協議中...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力エリア */}
        <div className="border-t p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="何でもお聞きください..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}