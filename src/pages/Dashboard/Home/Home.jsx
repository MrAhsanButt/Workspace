import React, { useState, useEffect, useRef } from 'react'
import {
  Layout,
  List,
  Calendar,
  Activity,
  Settings,
  Plus,
  Search,
  RotateCcw,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { Select, Modal, Input, Avatar } from 'antd'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'
import KanbanView from '../views/KanbanView'
import ListView from '../views/ListView'
import CalendarView from '../views/CalendarView'
import ActivityLogView from '../views/ActivityLogView'
import SettingsView from '../views/SettingsView'
import TaskDetailModal from '../modals/TaskDetailModal'

const Home = () => {
  const {
    projects,
    activeProject,
    switchProject,
    createProject,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    filterPreset,
    setFilterPreset,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterAssignee,
    setFilterAssignee,
    sortBy,
    setSortBy,
    rawProjectTasks,
    createTask,
    undo,
    canUndo,
    canEdit,
    activeWorkspace,
    canManageWorkspace,
    allUsers,
  } = useWorkspace()

  const [createProjModalOpen, setCreateProjModalOpen] = useState(false)
  const [newProjName, setNewProjName] = useState('')

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCol, setNewTaskCol] = useState('To Do')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskAssignee, setNewTaskAssignee] = useState(MOCK_USERS[0].id)

  const searchInputRef = useRef(null)

  // Global Keyboard Shortcuts (Cmd+K / C / 1-5 / Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Escape') e.target.blur()
        return
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }

      // Create task shortcut: 'c' or 'n'
      if (e.key === 'c' || e.key === 'n') {
        e.preventDefault()
        if (canEdit) setCreateTaskModalOpen(true)
        return
      }

      // Search shortcut: '/'
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      // View switching: 1 to 5
      if (e.key === '1') setActiveView('kanban')
      if (e.key === '2') setActiveView('list')
      if (e.key === '3') setActiveView('calendar')
      if (e.key === '4') setActiveView('activity')
      if (e.key === '5') setActiveView('settings')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, canEdit, setActiveView])

  const handleCreateProject = (e) => {
    e.preventDefault()
    if (!newProjName.trim()) return
    createProject(newProjName.trim())
    setNewProjName('')
    setCreateProjModalOpen(false)
  }

  const handleCreateTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    createTask({
      title: newTaskTitle.trim(),
      status: newTaskCol,
      priority: newTaskPriority,
      assigneeId: newTaskAssignee,
    })
    setNewTaskTitle('')
    setCreateTaskModalOpen(false)
  }

  const completedCount = rawProjectTasks.filter((t) => t.status === 'Done').length
  const totalCount = rawProjectTasks.length
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Empty state — no workspace yet
  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
          <span className="text-4xl">🗂️</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Workspace Yet</h2>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          You don't have any workspaces. Click <strong>Create Workspace</strong> in the top navbar to get started — then add projects and tasks.
        </p>
        <button
          onClick={() => {
            // Programmatically trigger the Navbar's workspace button
            const btn = document.querySelector('[data-create-workspace]')
            if (btn) btn.click()
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Your First Workspace
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Project Tabs & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          {projects.map((proj) => {
            const isActive = activeProject?.id === proj.id
            return (
              <button
                key={proj.id}
                onClick={() => switchProject(proj.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{proj.icon || '📁'}</span>
                <span>{proj.name}</span>
              </button>
            )
          })}

          {canEdit && (
            <button
              onClick={() => setCreateProjModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-500 hover:text-slate-800 border border-dashed border-slate-300 hover:border-slate-400 text-xs font-medium transition-colors cursor-pointer"
              title="Add new project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Project</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Workspace Members Stack */}
          <div className="flex items-center gap-1.5 pr-2 sm:border-r border-slate-200">
            <div className="flex -space-x-1.5 overflow-hidden">
              {(activeWorkspace?.members || []).slice(0, 4).map((m) => {
                const u = (allUsers || MOCK_USERS).find((user) => user.id === m.userId)
                if (!u) return null
                return (
                  <Avatar
                    key={m.userId}
                    size={22}
                    style={{ backgroundColor: u.color }}
                    className="text-[9px] text-white font-bold border-2 border-white ring-1 ring-slate-100"
                    title={`${u.name} (${m.role})`}
                  >
                    {u.avatar}
                  </Avatar>
                )
              })}
            </div>
            {canManageWorkspace && (
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer shadow-xs transition-colors"
                title="Manage & Add Members in Workspace Settings"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">+ Member</span>
              </button>
            )}
          </div>

          {/* Undo Button */}
          {canUndo && (
            <button
              onClick={undo}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs cursor-pointer"
              title="Undo last action (Ctrl+Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task <span className="opacity-60 text-[10px] ml-1">(C)</span></span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs & Progress Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 border border-slate-200 rounded-xl max-w-fit overflow-x-auto">
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'kanban'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-slate-500" />
            <span>Board</span>
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5 text-slate-500" />
            <span>List</span>
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'calendar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'activity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Activity</span>
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </button>
        </div>

        {/* Progress Metric */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Progress:</span>
            <span className="font-semibold text-slate-900">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-slate-400">{percentComplete}%</span>
        </div>
      </div>

      {/* Filter Presets & Search Toolbar (Only on Board and List views) */}
      {(activeView === 'kanban' || activeView === 'list') && (
        <div className="space-y-2">
          {/* Quick Filter Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Presets:
            </span>
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'my_tasks', label: 'My Tasks' },
              { id: 'urgent', label: 'Urgent & High' },
              { id: 'due_soon', label: 'Due in 3 Days' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPreset(p.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  filterPreset === p.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search & Custom Filters */}
          <div className="flex flex-wrap items-center gap-2.5 bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks... (Press / to focus)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Status Filter (Only relevant in List view) */}
            {activeView === 'list' && (
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                className="w-28 text-xs"
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'To Do', value: 'To Do' },
                  { label: 'In Progress', value: 'In Progress' },
                  { label: 'Done', value: 'Done' },
                ]}
              />
            )}

            {/* Priority Filter */}
            <Select
              value={filterPriority}
              onChange={setFilterPriority}
              className="w-28 text-xs"
              options={[
                { label: 'All Priority', value: 'all' },
                { label: 'Urgent', value: 'urgent' },
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' },
              ]}
            />

            {/* Assignee Filter */}
            <Select
              value={filterAssignee}
              onChange={setFilterAssignee}
              className="w-32 text-xs"
              options={[
                { label: 'All Assignees', value: 'all' },
                ...MOCK_USERS.map((u) => ({ label: u.name, value: u.id })),
              ]}
            />

            {/* Sort By */}
            <Select
              value={sortBy}
              onChange={setSortBy}
              className="w-32 text-xs"
              options={[
                { label: 'Due Date', value: 'dueDate' },
                { label: 'Priority', value: 'priority' },
                { label: 'Title', value: 'title' },
                { label: 'Created', value: 'created' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Render Active View */}
      <div className="pt-1">
        {activeView === 'kanban' && <KanbanView />}
        {activeView === 'list' && <ListView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'activity' && <ActivityLogView />}
        {activeView === 'settings' && <SettingsView />}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal />

      {/* Create Project Modal */}
      <Modal
        open={createProjModalOpen}
        onCancel={() => setCreateProjModalOpen(false)}
        footer={null}
        title={<span className="text-slate-900 font-bold text-sm">New Project</span>}
        centered
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <form onSubmit={handleCreateProject} className="mt-3 space-y-3 text-xs">
          <Input
            autoFocus
            placeholder="Project name (e.g. Web Client, Brand Redesign)..."
            value={newProjName}
            onChange={(e) => setNewProjName(e.target.value)}
            className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg!"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateProjModalOpen(false)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        open={createTaskModalOpen}
        onCancel={() => setCreateTaskModalOpen(false)}
        footer={null}
        title={<span className="text-slate-900 font-bold text-sm">Create New Task</span>}
        centered
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <form onSubmit={handleCreateTask} className="mt-3 space-y-3 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Task Title</label>
            <Input
              autoFocus
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg!"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-slate-600 font-medium block mb-1">Status</label>
              <Select
                value={newTaskCol}
                onChange={setNewTaskCol}
                className="w-full"
                options={(activeProject?.columns || ['To Do', 'In Progress', 'Done']).map((c) => ({
                  label: c,
                  value: c,
                }))}
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Priority</label>
              <Select
                value={newTaskPriority}
                onChange={setNewTaskPriority}
                className="w-full"
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                  { label: 'Urgent', value: 'urgent' },
                ]}
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Assignee</label>
              <Select
                value={newTaskAssignee}
                onChange={setNewTaskAssignee}
                className="w-full"
                options={MOCK_USERS.map((u) => ({ label: u.name, value: u.id }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(false)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Home