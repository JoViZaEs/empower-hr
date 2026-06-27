import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Genera notificaciones in-app dirigidas al EMPLEADO (employee_id en notifications).
// Casos:
//   - Pendientes de firmar (signatures.status = 'pending')
//   - Cursos próximos a vencer
//   - Exámenes médicos próximos a vencer
//   - Evaluaciones pendientes
//   - Cambios de estado en incapacidades del empleado
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(url, serviceKey)

    const today = new Date()
    const isoToday = today.toISOString().split('T')[0]
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30)
    const iso30 = in30.toISOString().split('T')[0]

    const created: any[] = []

    const pushIfNew = async (n: {
      tenant_id: string; employee_id: string; type: string;
      title: string; message: string; link?: string;
    }) => {
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('employee_id', n.employee_id)
        .eq('type', n.type)
        .eq('title', n.title)
        .gte('created_at', yesterday.toISOString())
        .limit(1)
      if (existing && existing.length > 0) return
      await supabase.from('notifications').insert({ ...n, read: false })
      created.push(n)
    }

    // 1. Firmas pendientes
    const { data: pendingSigs } = await supabase
      .from('signatures')
      .select('id, employee_id, tenant_id, document_type, document_name')
      .eq('status', 'pending')
    for (const s of pendingSigs ?? []) {
      if (!s.employee_id) continue
      await pushIfNew({
        tenant_id: s.tenant_id, employee_id: s.employee_id, type: 'pendiente_firma',
        title: 'Tienes documentos por firmar',
        message: `Documento: ${s.document_name ?? s.document_type}`,
        link: '/Funcionarios/firmar',
      })
    }

    // 2. Cursos por vencer (30 días)
    const { data: courses } = await supabase
      .from('courses')
      .select('id, employee_id, tenant_id, course_name, expiry_date')
      .lte('expiry_date', iso30).gte('expiry_date', isoToday)
    for (const c of courses ?? []) {
      if (!c.employee_id) continue
      await pushIfNew({
        tenant_id: c.tenant_id, employee_id: c.employee_id, type: 'curso_vencer',
        title: 'Curso próximo a vencer',
        message: `"${c.course_name}" vence el ${c.expiry_date}`,
        link: '/Funcionarios/cursos',
      })
    }

    // 3. Exámenes por vencer (30 días)
    const { data: exams } = await supabase
      .from('exams')
      .select('id, employee_id, tenant_id, exam_type, expiry_date')
      .lte('expiry_date', iso30).gte('expiry_date', isoToday)
    for (const e of exams ?? []) {
      if (!e.employee_id) continue
      await pushIfNew({
        tenant_id: e.tenant_id, employee_id: e.employee_id, type: 'examen_vencer',
        title: 'Examen médico próximo a vencer',
        message: `"${e.exam_type}" vence el ${e.expiry_date}`,
        link: '/Funcionarios/examenes',
      })
    }

    // 4. Evaluaciones pendientes (autoevaluación)
    const { data: evals } = await supabase
      .from('evaluations')
      .select('id, employee_id, tenant_id, status')
      .in('status', ['pendiente', 'en_progreso'])
    for (const ev of evals ?? []) {
      if (!ev.employee_id) continue
      await pushIfNew({
        tenant_id: ev.tenant_id, employee_id: ev.employee_id, type: 'evaluacion_pendiente',
        title: 'Evaluación pendiente',
        message: 'Tienes una evaluación por completar',
        link: '/Funcionarios/evaluaciones',
      })
    }

    // 5. Incapacidades con cambio de estado reciente (24h)
    const last24h = new Date(today); last24h.setDate(last24h.getDate() - 1)
    const { data: incs } = await supabase
      .from('incapacidades')
      .select('id, employee_id, tenant_id, estado, tipo, updated_at')
      .gte('updated_at', last24h.toISOString())
      .in('estado', ['aprobada', 'rechazada', 'transcrita_nomina'])
    for (const i of incs ?? []) {
      await pushIfNew({
        tenant_id: i.tenant_id, employee_id: i.employee_id, type: `incapacidad_${i.estado}`,
        title: 'Actualización de incapacidad',
        message: `Tu incapacidad (${i.tipo.replace(/_/g, ' ')}) ahora está: ${i.estado.replace(/_/g, ' ')}`,
        link: '/Funcionarios/incapacidades',
      })
    }

    return new Response(
      JSON.stringify({ success: true, created: created.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('generate-employee-notifications error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
