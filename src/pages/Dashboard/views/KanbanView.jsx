import React, { useState } from 'react'
import { Plus, ArrowRight, ArrowLeft, Trash2, Calendar, CheckSquare, GripVertical, Lock } from 'lucide-react'
import { Avatar } from 'antd'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'

const KanbanView = () => {
  const {
    tasks,
    activeProject,
    createTask,
    moveTaskStatus,
    deleteTask,
    setSelectedTask,
    addColumn,
    canEdit,
    canManageWorkspace,
    canCustomizeColumns,
    isViewer,
    triggerAccessDenied,
  } = useWorkspace()

  const [addingCol, setAddingCol] = useState(null)
  const [quickTitle, setQuickTitle] = useState('')

  const [isAddingNewColumn, setIsAddingNewColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const columns = activeProject?.columns || ['To Do', 'In Progress', 'Done']

  const handleQuickAdd = (col) => {
    if (!quickTitle.trim()) {
      setAddingCol(null)
      return
    }
    createTask({ title: quickTitle.trim(), status: col })
    setQuickTitle('')
    setAddingCol(null)
  }

  const handleAddNewColumn = (e) => {
    e.preventDefault()
    if (!newColumnName.trim()) {
      setIsAddingNewColumn(false)
      return
    }
    addColumn(newColumnName.trim())
    setNewColumnName('')
    setIsAddingNewColumn(false)
  }

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {columns.map((col, idx) => {
        const colTasks = tasks.filter((t) => t.status === col)
        const prevCol = idx > 0 ? columns[idx - 1] : null
        const nextCol = idx < columns.length - 1 ? columns[idx + 1] : null

        return (
          <div
            key={col}
            onDragOver={(e) => {
              if (canEdit) e.preventDefault()
            }}
            onDrop={(e) => {
              e.preventDefault()
              if (!canEdit) {
                triggerAccessDenied('Move Task Status', 'Viewers have read-only access and cannot move or update task status.', ['member', 'admin', 'owner'])
                return
              }
              const taskId = e.dataTransfer.getData('taskId')
              if (taskId) moveTaskStatus(taskId, col)
            }}
            className="flex flex-col rounded-2xl bg-slate-100/75 border border-slate-200/80 p-4 w-80 shrink-0 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-mono font-medium">
                  {colTasks.length}
                </span>
              </div>
              {canEdit ? (
                <button
                  onClick={() => setAddingCol(col)}
                  className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Add task to column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => triggerAccessDenied('Create Task', 'Viewers have read-only access and cannot add tasks.', ['member', 'admin', 'owner'])}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Viewer: Read-only access"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            {addingCol === col && (
              <div className="mb-3 p-3 rounded-xl bg-white border border-slate-300 space-y-2 shadow-xs">
                <input
                  type="text"
                  autoFocus
                  placeholder="What needs to be done?"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickAdd(col)
                    if (e.key === 'Escape') setAddingCol(null)
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setAddingCol(null)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleQuickAdd(col)}
                    className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Tasks Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
              {colTasks.map((task) => {
                const assignee = MOCK_USERS.find((u) => u.id === task.assigneeId)
                const completedSubs = (task.subtasks || []).filter((s) => s.completed).length
                const totalSubs = (task.subtasks || []).length

                return (
                  <div
                    key={task.id}
                    draggable={canEdit}
                    onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="p-3.5 rounded-xl bg-white hover:bg-white border border-slate-200/90 hover:border-slate-300 cursor-grab active:cursor-grabbing space-y-2.5 transition-all shadow-xs hover:shadow-sm group"
                  >
                    {/* Top Row: Priority & Due Date */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority || 'medium'}
                      </span>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </div>

                    {/* Labels */}
                    {(task.labels || []).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.labels.map((lbl) => (
                          <span
                            key={lbl}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Row: Subtasks, Assignee & Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        {totalSubs > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <CheckSquare className="w-3 h-3 text-slate-400" />
                            <span>
                              {completedSubs}/{totalSubs}
                            </span>
                          </div>
                        )}
                        {assignee && (
                          <Avatar size={18} style={{ backgroundColor: assignee.color }} title={assignee.name} className="text-white font-bold text-[9px]">
                            {assignee.avatar}
                          </Avatar>
                        )}
                      </div>

                      {/* Quick Move Buttons */}
                      {canEdit && (
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevCol && (
                            <button
                              onClick={() => moveTaskStatus(task.id, prevCol)}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                              title={`Move to ${prevCol}`}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextCol && (
                            <button
                              onClick={() => moveTaskStatus(task.id, nextCol)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title={`Move to ${nextCol}`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {colTasks.length === 0 && (
                <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Add Column Button / Form */}
      {canManageWorkspace && (
        <div className="w-72 shrink-0">
          {isAddingNewColumn ? (
            <form onSubmit={handleAddNewColumn} className="p-3 bg-white rounded-2xl border border-slate-300 space-y-2 shadow-xs">
              <input
                type="text"
                autoFocus
                placeholder="Column name (e.g. Review, QA)..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddingNewColumn(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Column
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingNewColumn(true)}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 bg-white/60 hover:bg-white text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-400" />
              <span>Add Column</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default KanbanView
