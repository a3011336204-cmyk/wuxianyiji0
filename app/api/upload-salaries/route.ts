import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理上传请求')
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 })
    }

    console.log('文件已接收:', file.name)
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log('Excel 解析完成，数据行数:', data.length)

    const salaries = data.map((row: any) => ({
      employee_id: String(row.employee_id),
      employee_name: row.employee_name,
      month: String(row.month),
      salary_amount: row.salary_amount,
    }))

    console.log('准备插入 Supabase，数据条数:', salaries.length)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    const { error } = await supabase.from('salaries').insert(salaries)

    if (error) {
      console.error('Supabase 插入错误:', error)
      return NextResponse.json({
        error: error.message,
        details: JSON.stringify(error)
      }, { status: 500 })
    }

    console.log('插入成功')
    return NextResponse.json({ success: true, count: salaries.length })
  } catch (error) {
    console.error('上传错误详情:', error)
    return NextResponse.json({
      error: '上传失败',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
