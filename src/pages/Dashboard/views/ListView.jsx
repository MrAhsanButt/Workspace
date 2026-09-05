import React, { useState } from 'react'
import { CheckSquare, Trash2, CheckCircle2, Calendar } from 'lucide-react'
import { Avatar, Select } from 'antd'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'

const ListView = () => {
  const {
    tasks,
    setSelectedTask,
    bulkUpdateStatus,
    bulkDelete,
    canEdit,
  } = useWorkspace()

  const [selectedIds, setSelectedIds] = useState([])
  const [groupBy, setGroupBy] = useState('none') // 'none', 'status', 'priority', 'assignee'

  const allIds = tasks.map((t) => t.id)
  const isAllSelected = tasks.length > 0 && selectedIds.length === tasks.length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(allIds)
    }
  }

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDone = () => {
    bulkUpdateStatus(selectedIds, 'Done')
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    bulkDelete(selectedIds)
    setSelectedIds([])
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold uppercase">Urgent</span>
      case 'high':
        return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold uppercase">High</span>
      case 'medium':
        return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold uppercase">Medium</span>
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase">Low</span>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">Done</span>
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">In Progress</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">To Do</span>
    }
  }

  // Grouping Logic
  const getGroupedTasks = () => {
    if (groupBy === 'none') return [{ title: null, items: tasks }]

    const groups = {}
    tasks.forEach((task) => {
      let key = 'Other'
      if (groupBy === 'status') key = task.status || 'To Do'
      if (groupBy === 'priority') key = (task.priority || 'medium').toUpperCase()
      if (groupBy === 'assignee') {
        const u = MOCK_USERS.find((user) => user.id === task.assigneeId)
        key = u ? u.name : 'Unassigned'
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(task)
    })

    return Object.keys(groups).map((key) => ({
      title: `${key} (${groups[key].length})`,
      items: groups[key],
    }))
  }

  const taskGroups = getGroupedTasks()

  return (
    <div className="space-y-4">
      {/* Top Controls & Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Group by:</span>
          <Select
            value={groupBy}
            onChange={setGroupBy}
            className="w-36 text-xs"
            options={[
              { label: 'None', value: 'none' },
              { label: 'Status', value: 'status' },
              { label: 'Priority', value: 'priority' },
              { label: 'Assignee', value: 'assignee' },
            ]}
          />
        </div>

        {selectedIds.length > 0 && canEdit && (
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-800 font-semibold">{selectedIds.length} selected</span>
            <button
              onClick={handleBulkDone}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 sm:p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="accent-blue-600 rounded cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="p-3 sm:p-3.5 font-semibold text-slate-900">Title</th>
                <th className="p-3 sm:p-3.5 font-semibold text-slate-900">Status</th>
                <th className="p-3 sm:p-3.5 font-semibold text-slate-900 hidden sm:table-cell">Priority</th>
                <th className="p-3 sm:p-3.5 font-semibold text-slate-900 hidden md:table-cell">Assignee</th>
                <th className="p-3 sm:p-3.5 font-semibold text-slate-900 hidden md:table-cell">Due Date</th>
                <th className="p-3 sm:p-3.5 font-semibold text-slate-900 text-right hidden lg:table-cell">Subtasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {taskGroups.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  {group.title && (
                    <tr className="bg-slate-100/70 text-slate-700 font-bold border-y border-slate-200">
                      <td colSpan={7} className="px-4 py-2 text-xs uppercase tracking-wider">
                        {group.title}
                      </td>
                    </tr>
                  )}

                  {group.items.map((task) => {
                    const isSelected = selectedIds.includes(task.id)
                    const assignee = MOCK_USERS.find((u) => u.id === task.assigneeId)
                    const completedSubs = (task.subtasks || []).filter((s) => s.completed).length
                    const totalSubs = (task.subtasks || []).length

                    return (
                      <tr
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="p-3 sm:p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => toggleSelect(task.id, e)}
                            className="accent-blue-600 rounded cursor-pointer w-4 h-4"
                          />
                        </td>
                        <td className="p-3 sm:p-3.5 font-medium text-slate-900 max-w-[150px] sm:max-w-xs truncate">
                          <div className="space-y-1">
                            <div>{task.title}</div>
                            {(task.labels || []).length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {task.labels.map((lbl) => (
                                  <span
                                    key={lbl}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200 font-medium"
                                  >
                                    {lbl}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 sm:p-3.5">{getStatusBadge(task.status)}</td>
                        <td className="p-3 sm:p-3.5 hidden sm:table-cell">{getPriorityBadge(task.priority)}</td>
                        <td className="p-3 sm:p-3.5 hidden md:table-cell">
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar size={18} style={{ backgroundColor: assignee.color }} className="text-white font-bold text-[9px]">
                                {assignee.avatar}
                              </Avatar>
                              <span className="text-slate-700">{assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-3.5 text-slate-500 hidden md:table-cell">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{task.dueDate}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3 sm:p-3.5 text-right font-mono text-slate-500 hidden lg:table-cell">
                          {totalSubs > 0 ? `${completedSubs}/${totalSubs}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No tasks found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ListView
