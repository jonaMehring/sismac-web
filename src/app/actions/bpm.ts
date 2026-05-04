'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createTaskSchema, updateTaskSchema, addCommentSchema, createProcessSchema } from '@/lib/validations/bpm'
import type { TaskStatus } from '@/lib/types'

export async function createTask(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createTaskSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('tasks')
    .insert({ ...parsed.data, creado_por: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/bpm/tareas')
  return data
}

export async function updateTask(id: string, formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = updateTaskSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error } = await supabase
    .from('tasks')
    .update(parsed.data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/bpm/tareas')
  revalidatePath(`/bpm/tareas/${id}`)
}

export async function changeTaskStatus(id: string, estado: TaskStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const updateData: Record<string, unknown> = { estado }
  if (estado === 'completada') {
    updateData.completada_en = new Date().toISOString()
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/bpm/tareas')
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/bpm/tareas')
}

export async function addTaskComment(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = addCommentSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('task_comments')
    .insert({ ...parsed.data, autor_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/bpm/tareas/${parsed.data.task_id}`)
  return data
}

export async function createProcess(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createProcessSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('processes')
    .insert({ ...parsed.data, creado_por: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/bpm/procesos')
  return data
}

export async function createTemplate(formData: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const parsed = createTemplateSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const { error, data } = await supabase
    .from('process_templates')
    .insert({ ...parsed.data, creado_por: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/bpm/plantillas')
  return data
}

export async function reorderTasks(tasks: { id: string; orden: number }[]) {
  const supabase = await createClient()
  const updates = tasks.map(t =>
    supabase.from('tasks').update({ orden: t.orden }).eq('id', t.id)
  )
  await Promise.all(updates)
  revalidatePath('/bpm/tareas')
}
