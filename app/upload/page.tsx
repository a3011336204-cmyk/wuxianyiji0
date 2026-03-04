'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [citiesFile, setCitiesFile] = useState<File | null>(null)
  const [salariesFile, setSalariesFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUploadCities = async () => {
    if (!citiesFile) {
      setMessage('请先选择 Cities 文件')
      return
    }

    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', citiesFile)

    try {
      const response = await fetch('/api/upload-cities', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✓ Cities 数据上传成功！')
        setCitiesFile(null)
      } else {
        setMessage(`✗ 上传失败: ${data.error}`)
      }
    } catch (error) {
      setMessage('✗ 上传失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSalaries = async () => {
    if (!salariesFile) {
      setMessage('请先选择 Salaries 文件')
      return
    }

    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', salariesFile)

    try {
      const response = await fetch('/api/upload-salaries', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✓ Salaries 数据上传成功！')
        setSalariesFile(null)
      } else {
        setMessage(`✗ 上传失败: ${data.error}`)
      }
    } catch (error) {
      setMessage('✗ 上传失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✓ 计算完成！共处理 ${data.count} 条记录`)
      } else {
        setMessage(`✗ 计算失败: ${data.error}`)
      }
    } catch (error) {
      setMessage('✗ 计算失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回主页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">数据上传与计算</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">1. 上传 Cities 数据</h2>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setCitiesFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleUploadCities}
                  disabled={loading || !citiesFile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '上传中...' : '上传'}
                </button>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">2. 上传 Salaries 数据</h2>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSalariesFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleUploadSalaries}
                  disabled={loading || !salariesFile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '上传中...' : '上传'}
                </button>
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">3. 执行计算</h2>
              <p className="text-gray-600 mb-4">
                确保已上传 Cities 和 Salaries 数据后，点击下方按钮执行计算
              </p>
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? '计算中...' : '执行计算并存储结果'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
