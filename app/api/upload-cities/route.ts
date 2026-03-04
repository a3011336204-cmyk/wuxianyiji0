import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理城市数据上传请求')
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

    const cities = data.map((row: any) => ({
      city_name: row['city_namte '] || row['city_name'] || row['city_namte'],
      year: String(row.year),
      base_min: row.base_min,
      base_max: row.base_max,
      rate: row.rate,
    }))

    console.log('准备插入 Supabase，数据条数:', cities.length)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    const { error } = await supabase.from('cities').insert(cities)

    if (error) {
      console.error('Supabase 插入错误:', error)
      return NextResponse.json({
        error: error.message,
        details: JSON.stringify(error)
      }, { status: 500 })
    }

    console.log('插入成功')
    return NextResponse.json({ success: true, count: cities.length })
  } catch (error) {
    console.error('上传错误详情:', error)
    return NextResponse.json({
      error: '上传失败',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
