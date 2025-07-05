export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
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
        
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <h2 className="text-2xl font-semibold mb-4">開発中...</h2>
            <p className="text-gray-600">
              AIエージェント群システムを構築中です
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}