'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Result {
  id: number
  employee_name: string
  year: string
  avg_salary: number
  contribution_base: number
  company_fee: number
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results')
      const data = await response.json()

      if (response.ok) {
        setResults(data.results)
      } else {
        setError(data.error || '获取数据失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回主页
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">计算结果查询</h1>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">暂无计算结果</p>
              <Link href="/upload" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                前往上传数据
              </Link>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">员工姓名</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">年份</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">年度月平均工资</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">缴费基数</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">公司缴纳金额</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">{result.employee_name}</td>
                      <td className="border border-gray-300 px-4 py-3">{result.year}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">¥{result.avg_salary.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">¥{result.contribution_base.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-green-600">¥{result.company_fee.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                共 {results.length} 条记录
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
