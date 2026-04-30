'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Plus, GripVertical } from 'lucide-react'
import { TaskStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import { changeTaskStatus } from '@/app/actions/bpm'
import type { Task, TaskStatus } from '@/lib/types'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'pendiente',   label: 'Pendiente',    color: 'bg-slate-100 text-slate-600' },
  { id: 'en_curso',    label: 'En curso',     color: 'bg-blue-100 text-blue-600' },
  { id: 'en_revision', label: 'En revisión',  color: 'bg-yellow-100 text-yellow-600' },
  { id: 'completada',  label: 'Completada',   color: 'bg-green-100 text-green-600' },
  { id: 'demorada',    label: 'Demorada',     color: 'bg-red-100 text-red-600' },
]

export function KanbanView({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const tasksByColumn = useCallback((status: TaskStatus) =>
    tasks.filter(t => t.estado === status),
    [tasks]
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    if (!COLUMNS.find(c => c.id === newStatus)) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.estado === newStatus) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, estado: newStatus } : t))
    setActiveTask(null)

    await changeTaskStatus(taskId, newStatus)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
        {COLUMNS.map(col => {
          const colTasks = tasksByColumn(col.id)
          return (
            <div key={col.id} className="flex flex-col shrink-0 w-72 bg-slate-50 rounded-xl border border-slate-200">
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', col.color)}>
                    {col.label}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{colTasks.length}</span>
                </div>
                <Link
                  href={`/bpm/tareas/nueva?estado=${col.id}`}
                  className="w-6 h-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Cards */}
              <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div
                  id={col.id}
                  className="flex flex-col gap-2 p-3 flex-1 min-h-[200px]"
                >
                  {colTasks.map(task => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      columnId={col.id}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-lg">
                      Arrastrá aquí
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCardPreview task={activeTask} />}
      </DragOverlay>
    </DndContext>
  )
}

function SortableTaskCard({ task, columnId }: { task: Task; columnId: TaskStatus }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task.id, data: { columnId } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const t = task as Task & {
    asignado?: { nombre: string } | null
    cliente?: { nombre: string } | null
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Link href={`/bpm/tareas/${task.id}`} className="block">
        <div className="bg-white rounded-lg border border-slate-200 p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              onClick={e => e.preventDefault()}
              className="mt-0.5 cursor-grab opacity-0 group-hover:opacity-40 active:cursor-grabbing shrink-0"
            >
              <GripVertical className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-2">{task.titulo}</p>
              {t.cliente && (
                <p className="text-xs text-slate-400 mb-2 truncate">{t.cliente.nombre}</p>
              )}
              <div className="flex flex-wrap gap-1 items-center">
                <PriorityBadge priority={task.prioridad} />
                {task.fecha_limite && (
                  <span className="text-xs text-slate-400">
                    {formatDate(task.fecha_limite)}
                  </span>
                )}
              </div>
              {t.asignado && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {t.asignado.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-400 truncate">{t.asignado.nombre}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="bg-white rounded-lg border-2 border-blue-400 p-3 w-72 shadow-xl rotate-2">
      <p className="text-sm font-medium text-slate-800 line-clamp-2">{task.titulo}</p>
      <div className="mt-2">
        <TaskStatusBadge status={task.estado} />
      </div>
    </div>
  )
}
