import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Tag,
  CheckSquare,
  Plus,
  Trash2,
  Copy,
  MessageSquare,
  Send,
  CornerDownRight,
  Paperclip,
  FileText,
  Bell,
} from 'lucide-react'
import { Modal, Select, Avatar } from 'antd'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'

const TaskDetailModal = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    deleteTask,
    duplicateTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    convertSubtaskToTask,
    addComment,
    deleteComment,
    canEdit,
    activeUser,
    activeProject,
  } = useWorkspace()

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [newCommentText, setNewCommentText] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [commentRecipientId, setCommentRecipientId] = useState(
    selectedTask?.assigneeId || MOCK_USERS[0].id
  )

  useEffect(() => {
    if (selectedTask?.assigneeId) {
      setCommentRecipientId(selectedTask.assigneeId)
    }
  }, [selectedTask?.id, selectedTask?.assigneeId])

  if (!selectedTask) return null

  const columns = activeProject?.columns || ['To Do', 'In Progress', 'Done']

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    addSubtask(selectedTask.id, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newCommentText.trim()) return
    addComment(selectedTask.id, newCommentText.trim(), commentRecipientId)
    setNewCommentText('')
  }

  const handleAddLabel = (e) => {
    if (e.key === 'Enter' && newLabel.trim()) {
      e.preventDefault()
      const current = selectedTask.labels || []
      if (!current.includes(newLabel.trim())) {
        updateTask(selectedTask.id, { labels: [...current, newLabel.trim()] })
      }
      setNewLabel('')
    }
  }

  const handleRemoveLabel = (labelToRemove) => {
    const updated = (selectedTask.labels || []).filter((l) => l !== labelToRemove)
    updateTask(selectedTask.id, { labels: updated })
  }

  const handleAttachFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const newAttach = {
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
    }
    const current = selectedTask.attachments || []
    updateTask(selectedTask.id, { attachments: [...current, newAttach] })
    if (window.toast) window.toast('File attached', 'success')
  }

  const handleRemoveAttachment = (attachName) => {
    const updated = (selectedTask.attachments || []).filter((a) => a.name !== attachName)
    updateTask(selectedTask.id, { attachments: updated })
  }

  const completedSubtasks = (selectedTask.subtasks || []).filter((s) => s.completed).length
  const totalSubtasks = (selectedTask.subtasks || []).length
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <Modal
      open={!!selectedTask}
      onCancel={() => setSelectedTask(null)}
      footer={null}
      width="min(680px, 95vw)"
      centered
      closeIcon={<X className="w-5 h-5 text-slate-400 hover:text-slate-700" />}
      styles={{
        content: {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          color: '#0f172a',
          padding: '16px',
        },
      }}
    >
      <div className="space-y-5 pt-1 text-slate-800">
        {/* Title & Metadata */}
        <div className="space-y-3">
          <input
            type="text"
            value={selectedTask.title}
            disabled={!canEdit}
            onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
            className="w-full bg-transparent text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none pb-1 transition-colors disabled:opacity-75"
            placeholder="Task title..."
          />
          <div className="flex flex-wrap items-center gap-2 pt-0.5 max-w-full">
            {/* Status */}
            <Select
              value={selectedTask.status}
              disabled={!canEdit}
              onChange={(val) => updateTask(selectedTask.id, { status: val })}
              className="w-32 text-xs"
              options={columns.map((c) => ({ label: c, value: c }))}
            />

            {/* Priority */}
            <Select
              value={selectedTask.priority || 'medium'}
              disabled={!canEdit}
              onChange={(val) => updateTask(selectedTask.id, { priority: val })}
              className="w-32 text-xs"
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Urgent', value: 'urgent' },
              ]}
            />

            {/* Assignee */}
            <Select
              value={selectedTask.assigneeId}
              disabled={!canEdit}
              onChange={(val) => updateTask(selectedTask.id, { assigneeId: val })}
              className="w-40 text-xs"
              options={MOCK_USERS.map((u) => ({
                label: (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
                    <span>{u.name}</span>
                  </div>
                ),
                value: u.id,
              }))}
            />

            {/* Due Date */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                disabled={!canEdit}
                value={selectedTask.dueDate || ''}
                onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value })}
                className="bg-transparent text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Labels</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {(selectedTask.labels || []).map((lbl) => (
              <span
                key={lbl}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700"
              >
                <span>{lbl}</span>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveLabel(lbl)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {canEdit && (
              <input
                type="text"
                placeholder="+ Add label (Enter)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleAddLabel}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500"
              />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Description</label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={selectedTask.description || ''}
            onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
            placeholder="Add detailed task description..."
            className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white resize-none disabled:opacity-75"
          />
        </div>

        {/* Subtasks Checklist */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Subtasks</span>
              <span className="text-xs text-slate-500">
                ({completedSubtasks}/{totalSubtasks})
              </span>
            </div>
            {totalSubtasks > 0 && (
              <span className="text-xs font-mono font-semibold text-blue-600">{progressPercent}%</span>
            )}
          </div>

          {/* Progress bar */}
          {totalSubtasks > 0 && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Subtask list */}
          <div className="space-y-1.5">
            {(selectedTask.subtasks || []).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 group"
              >
                <label className="flex items-center gap-2.5 cursor-pointer text-xs flex-1 truncate">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={sub.completed}
                    onChange={() => toggleSubtask(selectedTask.id, sub.id)}
                    className="accent-blue-600 rounded cursor-pointer w-4 h-4"
                  />
                  <span
                    className={
                      sub.completed ? 'line-through text-slate-400 truncate' : 'text-slate-800 truncate'
                    }
                  >
                    {sub.title}
                  </span>
                </label>

                {canEdit && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => convertSubtaskToTask(selectedTask.id, sub.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="Convert to full task"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSubtask(selectedTask.id, sub.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Subtask */}
          {canEdit && (
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          )}
        </div>

        {/* Attachments Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Attachments ({(selectedTask.attachments || []).length})</span>
            </div>
            {canEdit && (
              <label className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-1">
                <Plus className="w-3 h-3" /> Attach File
                <input type="file" onChange={handleAttachFile} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(selectedTask.attachments || []).map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{att.name || att}</span>
                {att.size && <span className="text-[10px] text-slate-400">({att.size})</span>}
                {canEdit && (
                  <button
                    onClick={() => handleRemoveAttachment(att.name || att)}
                    className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {(selectedTask.attachments || []).length === 0 && (
              <div className="text-xs text-slate-400 py-1">No attachments.</div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">Comments</span>
            <span className="text-xs text-slate-500">({(selectedTask.comments || []).length})</span>
          </div>

          {/* Comment list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {(selectedTask.comments || []).map((comm) => {
              const author = MOCK_USERS.find((u) => u.id === comm.userId) || {
                name: 'User',
                avatar: 'U',
                color: '#888',
              }
              const recipient = MOCK_USERS.find((u) => u.id === comm.recipientId)
              const isMine = comm.userId === activeUser.id
              return (
                <div
                  key={comm.id}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Avatar size={18} style={{ backgroundColor: author.color }} className="text-white font-bold text-[9px]">
                        {author.avatar}
                      </Avatar>
                      <span className="font-semibold text-slate-800">{author.name}</span>
                      {recipient && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                          to @{recipient.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{comm.createdAt}</span>
                    </div>
                    {isMine && canEdit && (
                      <button
                        onClick={() => deleteComment(selectedTask.id, comm.id)}
                        className="text-slate-400 hover:text-rose-600 text-[11px] cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 pl-6">{comm.text}</p>
                </div>
              )
            })}
            {(selectedTask.comments || []).length === 0 && (
              <div className="text-xs text-slate-400 py-1">No comments yet.</div>
            )}
          </div>

          {/* Add comment with recipient selector & bell indicator */}
          {canEdit && (
            <form onSubmit={handleAddComment} className="space-y-2 pt-1">
              <div className="flex flex-wrap items-start justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Comment to:</span>
                  <Select
                    size="small"
                    value={commentRecipientId}
                    onChange={(val) => setCommentRecipientId(val)}
                    className="min-w-[120px] max-w-full"
                    options={MOCK_USERS.map((u) => ({
                      value: u.id,
                      label: (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
                          <span>{u.name}</span>
                          {u.id === selectedTask.assigneeId && (
                            <span className="text-[10px] text-blue-600 font-mono">(Assignee)</span>
                          )}
                          {u.id === activeUser.id && (
                            <span className="text-[10px] text-emerald-600 font-mono">(You)</span>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </div>

                <div className="text-[11px] text-blue-600 flex items-center gap-1">
                  <Bell className="w-3 h-3 text-blue-600" />
                  <span>
                    Bell rings on{' '}
                    <strong>
                      {commentRecipientId === activeUser.id
                        ? 'your web'
                        : (MOCK_USERS.find((u) => u.id === commentRecipientId)?.name || 'member') + "'s web"}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Write a comment to ${
                    MOCK_USERS.find((u) => u.id === commentRecipientId)?.name || 'member'
                  }...`}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>

              {commentRecipientId !== activeUser.id && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>Targeted notification for {MOCK_USERS.find((u) => u.id === commentRecipientId)?.name}:</span>
                  <button
                    type="button"
                    onClick={() => setCommentRecipientId(activeUser.id)}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Select yourself to test bell ring
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => duplicateTask(selectedTask.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate
              </button>
            )}
            {canEdit && (
              <button
                type="button"
                onClick={() => deleteTask(selectedTask.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSelectedTask(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskDetailModal
