import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // 1. 获取所有工资数据
    const { data: salaries, error: salariesError } = await supabase
      .from('salaries')
      .select('*')

    if (salariesError) {
      return NextResponse.json({ error: salariesError.message }, { status: 500 })
    }

    if (!salaries || salaries.length === 0) {
      return NextResponse.json({ error: '没有工资数据' }, { status: 400 })
    }

    // 2. 按员工姓名和年份分组，计算年度月平均工资
    const employeeYearMap = new Map<string, { name: string; year: string; salaries: number[] }>()

    salaries.forEach((salary: any) => {
      const year = String(Math.floor(parseInt(salary.month) / 100))
      const key = `${salary.employee_name}_${year}`

      if (!employeeYearMap.has(key)) {
        employeeYearMap.set(key, {
          name: salary.employee_name,
          year: year,
          salaries: [],
        })
      }

      employeeYearMap.get(key)!.salaries.push(salary.salary_amount)
    })

    // 3. 获取佛山的社保标准（按年份）
    const years = Array.from(new Set(Array.from(employeeYearMap.values()).map(e => e.year)))
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .eq('city_name', '佛山')
      .in('year', years)

    if (citiesError) {
      return NextResponse.json({ error: citiesError.message }, { status: 500 })
    }

    if (!cities || cities.length === 0) {
      return NextResponse.json({ error: '未找到佛山的社保标准数据' }, { status: 400 })
    }

    // 创建年份到城市标准的映射
    const cityStandardMap = new Map<string, any>()
    cities.forEach((city: any) => {
      cityStandardMap.set(city.year, city)
    })

    // 4. 计算每位员工的结果
    const results = []

    for (const [, employeeData] of employeeYearMap) {
      const avgSalary = employeeData.salaries.reduce((a, b) => a + b, 0) / employeeData.salaries.length

      const cityStandard = cityStandardMap.get(employeeData.year)
      if (!cityStandard) {
        console.warn(`未找到 ${employeeData.year} 年的佛山社保标准`)
        continue
      }

      // 确定缴费基数
      let contributionBase = avgSalary
      if (avgSalary < cityStandard.base_min) {
        contributionBase = cityStandard.base_min
      } else if (avgSalary > cityStandard.base_max) {
        contributionBase = cityStandard.base_max
      }

      // 计算公司应缴金额
      const companyFee = contributionBase * cityStandard.rate

      results.push({
        employee_name: employeeData.name,
        year: employeeData.year,
        avg_salary: avgSalary,
        contribution_base: contributionBase,
        company_fee: companyFee,
      })
    }

    // 5. 清空 results 表
    const { error: deleteError } = await supabase
      .from('results')
      .delete()
      .neq('id', 0)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // 6. 插入新结果
    const { error: insertError } = await supabase
      .from('results')
      .insert(results)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: results.length })
  } catch (error) {
    console.error('Calculate error:', error)
    return NextResponse.json({
      error: '计算失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
