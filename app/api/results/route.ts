import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .order('year', { ascending: false })
      .order('employee_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ results: results || [] })
  } catch (error) {
    console.error('Fetch results error:', error)
    return NextResponse.json({ error: '获取结果失败' }, { status: 500 })
  }
}
