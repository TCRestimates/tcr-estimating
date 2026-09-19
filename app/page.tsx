'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-white mb-6">TCR Estimating Platform</h1>
        <p className="text-xl text-blue-100 mb-8">
          Professional proposal and estimation management for construction companies
        </p>

        <div className="space-y-4">
          <Link
            href="/projects"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition shadow-lg"
          >
            Get Started →
          </Link>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">📹 Walkthroughs</h3>
              <p className="text-blue-100">Record and process property walkthroughs</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">📊 Estimates</h3>
              <p className="text-blue-100">Create detailed cost estimates with markup</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg text-white">
              <h3 className="text-lg font-semibold mb-2">📄 Proposals</h3>
              <p className="text-blue-100">Generate and send professional PDFs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
