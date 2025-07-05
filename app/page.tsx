import ChatInterface from '@/components/chat-interface'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">
            Spec AI
          </h1>
          <p className="text-xl text-gray-600">
            世界初のAIエージェント群チャットボット
          </p>
          <p className="text-lg text-gray-500 mt-2">
            日本政府公式データ × 完全無料
          </p>
        </div>
        
        {/* チャットインターフェース */}
        <ChatInterface />
        
        {/* フッター */}
        <div className="text-center mt-8 text-gray-500">
          <p>© 2025 Spec AI - Powered by AI Agent Swarm Technology</p>
        </div>
      </div>
    </main>
  )
}