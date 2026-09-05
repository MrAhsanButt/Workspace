import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import bellSound from '@/assets/bell.wav'

export const WorkspaceContext = createContext()

export const MOCK_USERS = [
  { id: 'user-1', name: 'Alex Morgan', email: 'alex@workspace.io', role: 'owner', avatar: 'AM', color: '#2563eb' },
  { id: 'user-2', name: 'Sarah Chen', email: 'sarah@workspace.io', role: 'admin', avatar: 'SC', color: '#9333ea' },
  { id: 'user-3', name: 'Mike Ross', email: 'mike@workspace.io', role: 'member', avatar: 'MR', color: '#059669' },
  { id: 'user-4', name: 'Emma Watson', email: 'emma@workspace.io', role: 'viewer', avatar: 'EW', color: '#64748b' },
]

const INITIAL_DATA = {
  workspaces: [],
  activeWorkspaceId: null,
  projects: [],
  activeProjectId: null,
  activeView: 'kanban',
  tasks: [],
  activityLog: [],
  notifications: [],
  users: MOCK_USERS,
}

const STORAGE_KEY = 'capstone_workspace_v3'

export const WorkspaceProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return INITIAL_DATA
  })

  const [history, setHistory] = useState([])

  const [activeUser, setActiveUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('user'))
      const email = saved?.user?.email || saved?.email
      return MOCK_USERS.find((u) => u.email === email) || MOCK_USERS[0]
    } catch {
      return MOCK_USERS[0]
    }
  })

  const activeUserRef = useRef(activeUser)
  useEffect(() => {
    activeUserRef.current = activeUser
  }, [activeUser])

  // Audio Player for bell.wav
  const playBellSound = () => {
    try {
      const audio = new Audio(bellSound)
      audio.volume = 0.8
      audio.currentTime = 0
      audio.play().catch((err) => {
        // Modern browsers require user interaction with the page before audio playback
        console.log('Audio playback info:', err.message)
      })
    } catch (e) {
      console.error('Failed to play bell sound:', e)
    }
  }

  // Cross-Tab Broadcast Channel setup
  const CHANNEL_NAME = 'ourspace_collab_channel'

  const postBroadcast = (payload) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME)
        channel.postMessage(payload)
        channel.close()
      }
    } catch (e) {
      console.warn('BroadcastChannel post error:', e)
    }
  }

  // Broadcast Channel listener for real-time notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return

    let channel
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = (event) => {
        const data = event.data
        if (!data || !data.type) return

        // 1. TARGETED COMMENT:
        // "when owner or other comment to someone the bell ring on that user web"
        if (data.type === 'COMMENT_TO_USER') {
          // Silently sync task list so other tabs have the comment rendered
          if (data.updatedTasks) {
            setData((prev) => ({ ...prev, tasks: data.updatedTasks }))
          }

          // Check if this tab is the targeted recipient
          if (activeUserRef.current?.id === data.recipientId) {
            playBellSound()
            const notif = {
              id: `n-${Date.now()}`,
              title: `💬 ${data.senderName} commented to you`,
              desc: `On "${data.taskTitle}": ${data.commentText}`,
              time: 'Just now',
              read: false,
            }
            setData((prev) => ({
              ...prev,
              notifications: [notif, ...(prev.notifications || [])],
            }))
            if (window.toast) {
              window.toast(`🔔 ${data.senderName} commented on your task: "${data.taskTitle}"`, 'info')
            }
          }
        }

        // 2. OWNER MESSAGE OR WORKSPACE CHANGE:
        // "when owner change or message any thing the bell ring on all"
        else if (data.type === 'OWNER_BROADCAST') {
          playBellSound()
          const notif = {
            id: `n-${Date.now()}`,
            title: data.actionType === 'change'
              ? `⚡ Workspace Changed by Owner`
              : `📢 Owner Announcement (${data.senderName})`,
            desc: data.message,
            time: 'Just now',
            read: false,
          }
          setData((prev) => {
            const next = {
              ...prev,
              notifications: [notif, ...(prev.notifications || [])],
            }
            if (data.updatedWorkspaces) {
              next.workspaces = data.updatedWorkspaces
            }
            return next
          })
          if (window.toast) {
            window.toast(`🔔 ${data.actionType === 'change' ? 'Owner Update: ' : 'Owner Message: '} ${data.message}`, 'info')
          }
        }

        // 3. SILENT DATA SYNC:
        // "but on changin the progress or add products or task bell should not ring"
        else if (data.type === 'SILENT_SYNC') {
          if (data.updatedTasks) {
            setData((prev) => ({ ...prev, tasks: data.updatedTasks }))
          }
          if (data.updatedProjects) {
            setData((prev) => ({ ...prev, projects: data.updatedProjects }))
          }
          if (data.updatedWorkspaces) {
            setData((prev) => ({ ...prev, workspaces: data.updatedWorkspaces }))
          }
        }
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e)
    }

    return () => {
      if (channel) channel.close()
    }
  }, [])

  // Trigger Notification helper
  const triggerNotification = ({ title, desc }) => {
    const newNotif = {
      id: `n-${Date.now()}`,
      title: title || 'New Notification',
      desc: desc || 'You have an update in your workspace',
      time: 'Just now',
      read: false,
    }
    setData((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])],
    }))
    playBellSound()
  }

  // Filtering, Searching & Sorting State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPreset, setFilterPreset] = useState('all') // 'all', 'my_tasks', 'urgent', 'due_soon'
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate') // dueDate, priority, title, created
  const [selectedTask, setSelectedTask] = useState(null)

  // Permissions
  const canEdit = activeUser.role !== 'viewer'
  const canManageWorkspace = activeUser.role === 'owner' || activeUser.role === 'admin'
  const isOwner = activeUser.role === 'owner'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Commit with history for Undo
  const commitData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      setHistory((h) => [...h.slice(-20), prev])
      return next
    })
  }

  const undo = () => {
    if (history.length === 0) {
      return window.toast?.('Nothing to undo', 'info')
    }
    const previous = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setData(previous)
    window.toast?.('Action undone', 'info')
  }

  const logActivity = (action, target) => {
    const newLog = {
      id: `act-${Date.now()}`,
      userId: activeUser.id,
      action,
      target,
      timestamp: 'Just now',
    }
    setData((prev) => ({
      ...prev,
      activityLog: [newLog, ...prev.activityLog.slice(0, 49)],
    }))
  }

  // Active Workspace & Projects
  const activeWorkspace =
    data.workspaces.find((w) => w.id === data.activeWorkspaceId) || data.workspaces[0]

  const workspaceProjects = data.projects.filter((p) => p.workspaceId === activeWorkspace?.id)

  const activeProject =
    workspaceProjects.find((p) => p.id === data.activeProjectId) || workspaceProjects[0] || data.projects[0]

  // Filtered Tasks for Active Project
  const rawProjectTasks = data.tasks.filter((t) => t.projectId === activeProject?.id)

  const filteredTasks = rawProjectTasks.filter((task) => {
    // Preset Filters
    if (filterPreset === 'my_tasks' && task.assigneeId !== activeUser.id) return false
    if (filterPreset === 'urgent' && task.priority !== 'urgent' && task.priority !== 'high') return false
    if (filterPreset === 'due_soon') {
      const today = new Date().toISOString().split('T')[0]
      const in3Days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
      if (!task.dueDate || task.dueDate < today || task.dueDate > in3Days) return false
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = task.title.toLowerCase().includes(q)
      const matchDesc = task.description?.toLowerCase().includes(q)
      const matchLabel = task.labels?.some((l) => l.toLowerCase().includes(q))
      if (!matchTitle && !matchDesc && !matchLabel) return false
    }

    // Status filter (ignored in Kanban view to avoid breaking board columns)
    if (data.activeView !== 'kanban' && filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (filterAssignee !== 'all' && task.assigneeId !== filterAssignee) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'dueDate') return (a.dueDate || '').localeCompare(b.dueDate || '')
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    if (sortBy === 'priority') {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
    }
    return (b.createdAt || '').localeCompare(a.createdAt || '')
  })

  // User Switching
  const switchMockUser = (user) => {
    setActiveUser(user)
    localStorage.setItem('user', JSON.stringify({ user }))
    if (window.toast) window.toast(`Switched to ${user.name} (${user.role.toUpperCase()})`, 'info')
  }

  // Workspace Operations
  const switchWorkspace = (wsId) => {
    const firstProject = data.projects.find((p) => p.workspaceId === wsId)
    setData((prev) => ({
      ...prev,
      activeWorkspaceId: wsId,
      activeProjectId: firstProject?.id || prev.activeProjectId,
    }))
  }

  const createWorkspace = (name, emoji = '📁') => {
    if (!name.trim()) return
    const newWs = {
      id: `ws-${Date.now()}`,
      name: name.trim(),
      emoji,
      members: [{ userId: activeUser.id, role: 'owner' }],
    }
    const defaultProj = {
      id: `proj-${Date.now()}`,
      workspaceId: newWs.id,
      name: 'General',
      icon: '📂',
      description: 'Default project',
      columns: ['To Do', 'In Progress', 'Done'],
    }
    commitData((prev) => ({
      ...prev,
      workspaces: [...prev.workspaces, newWs],
      projects: [...prev.projects, defaultProj],
      activeWorkspaceId: newWs.id,
      activeProjectId: defaultProj.id,
    }))
    logActivity('Created workspace', name)
    if (window.toast) window.toast('Workspace created', 'success')
  }

  const renameWorkspace = (wsId, newName) => {
    if (!canManageWorkspace) return window.toast('Admin permission required', 'error')
    const trimmed = newName.trim()
    if (!trimmed) return
    const updatedWorkspaces = data.workspaces.map((w) => (w.id === wsId ? { ...w, name: trimmed } : w))
    commitData((prev) => ({
      ...prev,
      workspaces: updatedWorkspaces,
    }))
    logActivity('Renamed workspace', trimmed)

    // "when owner change or message any thing the bell ring on all"
    if (activeUser.role === 'owner') {
      playBellSound()
      const notif = {
        id: `n-${Date.now()}`,
        title: `⚡ Workspace Changed by Owner`,
        desc: `Owner ${activeUser.name} renamed workspace to "${trimmed}"`,
        time: 'Just now',
        read: false,
      }
      setData((prev) => ({
        ...prev,
        notifications: [notif, ...(prev.notifications || [])],
      }))
      if (window.toast) window.toast(`🔔 Workspace renamed to "${trimmed}" (Bell rung on all screens)`, 'info')

      postBroadcast({
        type: 'OWNER_BROADCAST',
        senderId: activeUser.id,
        senderName: activeUser.name,
        actionType: 'change',
        message: `Owner ${activeUser.name} renamed workspace to "${trimmed}"`,
        updatedWorkspaces,
      })
    } else {
      if (window.toast) window.toast('Workspace renamed', 'success')
    }
  }

  const deleteWorkspace = (wsId) => {
    if (!isOwner) return window.toast('Only owners can delete workspaces', 'error')
    if (data.workspaces.length <= 1) return window.toast('Cannot delete the last workspace', 'warning')
    const remaining = data.workspaces.filter((w) => w.id !== wsId)
    commitData((prev) => ({
      ...prev,
      workspaces: remaining,
      activeWorkspaceId: remaining[0].id,
      projects: prev.projects.filter((p) => p.workspaceId !== wsId),
      tasks: prev.tasks.filter((t) => t.workspaceId !== wsId),
    }))
    if (window.toast) window.toast('Workspace deleted', 'info')
  }

  const updateMemberRole = (userId, newRole) => {
    if (!canManageWorkspace) return window.toast('Admin permission required', 'error')
    const targetUser = MOCK_USERS.find((u) => u.id === userId)
    const updatedWorkspaces = data.workspaces.map((w) => {
      if (w.id !== data.activeWorkspaceId) return w
      const members = w.members.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      return { ...w, members }
    })
    commitData((prev) => ({
      ...prev,
      workspaces: updatedWorkspaces,
    }))
    logActivity('Updated role', `${targetUser?.name || userId} → ${newRole}`)

    // "when owner change or message any thing the bell ring on all"
    if (activeUser.role === 'owner') {
      playBellSound()
      const notif = {
        id: `n-${Date.now()}`,
        title: `⚡ Role Updated by Owner`,
        desc: `Owner changed ${targetUser?.name || 'user'}'s role to ${newRole.toUpperCase()}`,
        time: 'Just now',
        read: false,
      }
      setData((prev) => ({
        ...prev,
        notifications: [notif, ...(prev.notifications || [])],
      }))
      if (window.toast) window.toast(`🔔 Owner updated member role (Bell rung on all screens)`, 'info')

      postBroadcast({
        type: 'OWNER_BROADCAST',
        senderId: activeUser.id,
        senderName: activeUser.name,
        actionType: 'change',
        message: `Owner changed ${targetUser?.name || 'user'}'s role to ${newRole.toUpperCase()}`,
        updatedWorkspaces,
      })
    } else {
      if (window.toast) window.toast('Member role updated', 'success')
    }
  }

  // Add Member to Workspace
  const addMemberToWorkspace = (workspaceId, { userId, email, name, role = 'member' }) => {
    if (!canManageWorkspace) return window.toast?.('Admin permission required to add members', 'error')

    const wsId = workspaceId || data.activeWorkspaceId
    const targetWs = data.workspaces.find((w) => w.id === wsId)
    if (!targetWs) return

    let memberUserId = userId
    let memberName = name
    let newUsersList = data.users || MOCK_USERS

    if (!memberUserId) {
      const cleanEmail = email?.trim()
      const cleanName = name?.trim()
      if (!cleanName && !cleanEmail) return window.toast?.('Please provide a name or email', 'warning')

      const existing = newUsersList.find(
        (u) =>
          (cleanEmail && u.email.toLowerCase() === cleanEmail.toLowerCase()) ||
          (cleanName && u.name.toLowerCase() === cleanName.toLowerCase())
      )
      if (existing) {
        memberUserId = existing.id
        memberName = existing.name
      } else {
        const colors = ['#2563eb', '#9333ea', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5']
        const randomColor = colors[newUsersList.length % colors.length]
        const fallbackName = cleanName || cleanEmail.split('@')[0]
        const initials = fallbackName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        const newUser = {
          id: `user-${Date.now()}`,
          name: fallbackName,
          email: cleanEmail || `${fallbackName.toLowerCase().replace(/\s+/g, '.')}@workspace.io`,
          role,
          avatar: initials || 'U',
          color: randomColor,
        }
        memberUserId = newUser.id
        memberName = newUser.name
        newUsersList = [...newUsersList, newUser]
      }
    } else {
      const found = newUsersList.find((u) => u.id === memberUserId)
      memberName = found?.name || 'Member'
    }

    const alreadyMember = targetWs.members.some((m) => m.userId === memberUserId)
    if (alreadyMember) {
      return window.toast?.(`${memberName} is already a member of this workspace`, 'warning')
    }

    const updatedWorkspaces = data.workspaces.map((w) => {
      if (w.id !== wsId) return w
      return {
        ...w,
        members: [...w.members, { userId: memberUserId, role }],
      }
    })

    commitData((prev) => ({
      ...prev,
      users: newUsersList,
      workspaces: updatedWorkspaces,
    }))

    logActivity('Added member', `${memberName} (${role.toUpperCase()}) → ${targetWs.name}`)

    // "when owner change or message any thing the bell ring on all"
    if (activeUser.role === 'owner') {
      playBellSound()
      const notif = {
        id: `n-${Date.now()}`,
        title: `⚡ Member Added by Owner`,
        desc: `Owner ${activeUser.name} added ${memberName} (${role.toUpperCase()}) to ${targetWs.name}`,
        time: 'Just now',
        read: false,
      }
      setData((prev) => ({
        ...prev,
        notifications: [notif, ...(prev.notifications || [])],
      }))
      if (window.toast) {
        window.toast(`🔔 Added ${memberName} to ${targetWs.name} (Bell rung on all screens)`, 'success')
      }

      postBroadcast({
        type: 'OWNER_BROADCAST',
        senderId: activeUser.id,
        senderName: activeUser.name,
        actionType: 'change',
        message: `Owner added ${memberName} (${role.toUpperCase()}) to ${targetWs.name}`,
        updatedWorkspaces,
      })
    } else {
      if (window.toast) window.toast(`Added ${memberName} to ${targetWs.name}`, 'success')
    }
  }

  // Remove Member from Workspace
  const removeMemberFromWorkspace = (workspaceId, userId) => {
    if (!canManageWorkspace) return window.toast?.('Admin permission required', 'error')

    const wsId = workspaceId || data.activeWorkspaceId
    const targetWs = data.workspaces.find((w) => w.id === wsId)
    if (!targetWs) return

    const memberRecord = targetWs.members.find((m) => m.userId === userId)
    if (memberRecord?.role === 'owner') {
      return window.toast?.('Cannot remove the workspace Owner', 'error')
    }

    const targetUser = (data.users || MOCK_USERS).find((u) => u.id === userId)
    const updatedMembers = targetWs.members.filter((m) => m.userId !== userId)

    const updatedWorkspaces = data.workspaces.map((w) => {
      if (w.id !== wsId) return w
      return { ...w, members: updatedMembers }
    })

    commitData((prev) => ({
      ...prev,
      workspaces: updatedWorkspaces,
    }))

    logActivity('Removed member', `${targetUser?.name || 'User'} from ${targetWs.name}`)

    // "when owner change or message any thing the bell ring on all"
    if (activeUser.role === 'owner') {
      playBellSound()
      const notif = {
        id: `n-${Date.now()}`,
        title: `⚡ Member Removed by Owner`,
        desc: `Owner ${activeUser.name} removed ${targetUser?.name || 'member'} from ${targetWs.name}`,
        time: 'Just now',
        read: false,
      }
      setData((prev) => ({
        ...prev,
        notifications: [notif, ...(prev.notifications || [])],
      }))
      if (window.toast) {
        window.toast(`🔔 Removed ${targetUser?.name || 'member'} from workspace (Bell rung on all)`, 'info')
      }

      postBroadcast({
        type: 'OWNER_BROADCAST',
        senderId: activeUser.id,
        senderName: activeUser.name,
        actionType: 'change',
        message: `Owner removed ${targetUser?.name || 'member'} from ${targetWs.name}`,
        updatedWorkspaces,
      })
    } else {
      if (window.toast) window.toast('Member removed from workspace', 'info')
    }
  }

  // Owner Broadcast Message Function
  // "when owner change or message any thing the bell ring on all"
  const broadcastOwnerMessage = (messageText) => {
    if (!messageText || !messageText.trim()) return
    if (activeUser.role !== 'owner') {
      if (window.toast) window.toast('Only the workspace Owner can broadcast messages to all', 'error')
      return
    }

    const text = messageText.trim()

    // 1. Ring bell on this web session
    playBellSound()

    // 2. Add in-app notification locally
    const notif = {
      id: `n-${Date.now()}`,
      title: `📢 Owner Announcement (${activeUser.name})`,
      desc: text,
      time: 'Just now',
      read: false,
    }
    setData((prev) => ({
      ...prev,
      notifications: [notif, ...(prev.notifications || [])],
    }))
    logActivity('Owner announcement', text)
    if (window.toast) window.toast(`📢 Broadcast sent to all users (Bell rung on all screens)`, 'success')

    // 3. Broadcast to all other open tabs/windows
    postBroadcast({
      type: 'OWNER_BROADCAST',
      senderId: activeUser.id,
      senderName: activeUser.name,
      actionType: 'message',
      message: text,
    })
  }

  // Project Operations
  const switchProject = (projId) => {
    setData((prev) => ({ ...prev, activeProjectId: projId }))
  }

  const createProject = (name, icon = '📂', description = '') => {
    if (!canEdit) return window.toast('Viewers cannot create projects', 'error')
    const newProj = {
      id: `proj-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      name,
      icon,
      description,
      columns: ['To Do', 'In Progress', 'Done'],
    }
    commitData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProj],
      activeProjectId: newProj.id,
    }))
    logActivity('Created project', name)
    if (window.toast) window.toast('Project created', 'success')
  }

  const deleteProject = (projId) => {
    if (!canManageWorkspace) return window.toast('Admin required', 'error')
    if (workspaceProjects.length <= 1) return window.toast('Cannot delete last project', 'warning')
    const remaining = data.projects.filter((p) => p.id !== projId)
    const nextProj = remaining.find((p) => p.workspaceId === activeWorkspace.id)
    commitData((prev) => ({
      ...prev,
      projects: remaining,
      activeProjectId: nextProj?.id || remaining[0]?.id,
      tasks: prev.tasks.filter((t) => t.projectId !== projId),
    }))
    if (window.toast) window.toast('Project deleted', 'info')
  }

  const addColumn = (colName) => {
    if (!canManageWorkspace) return window.toast('Admin required to add columns', 'error')
    if (!colName.trim()) return
    const currentCols = activeProject.columns || ['To Do', 'In Progress', 'Done']
    if (currentCols.includes(colName.trim())) return window.toast('Column already exists', 'warning')
    const updated = [...currentCols, colName.trim()]
    commitData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === activeProject.id ? { ...p, columns: updated } : p)),
    }))
    if (window.toast) window.toast(`Added column "${colName.trim()}"`, 'success')
  }

  // Task Operations
  const createTask = (taskData) => {
    if (!canEdit) return window.toast('Viewers cannot create tasks', 'error')
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: activeProject.id,
      workspaceId: activeWorkspace.id,
      title: taskData.title || 'Untitled Task',
      description: taskData.description || '',
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      assigneeId: taskData.assigneeId || activeUser.id,
      labels: taskData.labels || ['General'],
      subtasks: taskData.subtasks || [],
      attachments: [],
      comments: [],
      createdAt: new Date().toISOString(),
    }
    const updatedTasksList = [newTask, ...data.tasks]
    commitData((prev) => ({
      ...prev,
      tasks: updatedTasksList,
    }))
    logActivity('Created task', newTask.title)
    if (window.toast) window.toast('Task created', 'success')
    postBroadcast({ type: 'SILENT_SYNC', updatedTasks: updatedTasksList })
    return newTask
  }

  const updateTask = (taskId, updates) => {
    if (!canEdit) return window.toast('Viewers cannot edit tasks', 'error')
    const updatedTasksList = data.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    commitData((prev) => ({
      ...prev,
      tasks: updatedTasksList,
    }))
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, ...updates }))
    }
    postBroadcast({ type: 'SILENT_SYNC', updatedTasks: updatedTasksList })
  }

  const moveTaskStatus = (taskId, newStatus) => {
    if (!canEdit) return window.toast('Viewers cannot move tasks', 'error')
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return
    const updatedTasksList = data.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    commitData((prev) => ({
      ...prev,
      tasks: updatedTasksList,
    }))
    logActivity('Status changed', `${task.title} → ${newStatus}`)
    postBroadcast({ type: 'SILENT_SYNC', updatedTasks: updatedTasksList })
  }

  const deleteTask = (taskId) => {
    if (!canEdit) return window.toast('Viewers cannot delete tasks', 'error')
    commitData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))
    if (selectedTask?.id === taskId) setSelectedTask(null)
    if (window.toast) window.toast('Task deleted — Use Undo to restore', 'info')
  }

  const duplicateTask = (taskId) => {
    if (!canEdit) return
    const original = data.tasks.find((t) => t.id === taskId)
    if (!original) return
    const copy = {
      ...original,
      id: `task-${Date.now()}`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
    }
    commitData((prev) => ({
      ...prev,
      tasks: [copy, ...prev.tasks],
    }))
    if (window.toast) window.toast('Task duplicated', 'success')
  }

  // Subtask Operations
  const addSubtask = (taskId, title) => {
    if (!canEdit || !title.trim()) return
    const newSub = { id: `sub-${Date.now()}`, title: title.trim(), completed: false }
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) return
    updateTask(taskId, { subtasks: [...(task.subtasks || []), newSub] })
  }

  const toggleSubtask = (taskId, subId) => {
    if (!canEdit) return
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) return
    const updated = (task.subtasks || []).map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    )
    updateTask(taskId, { subtasks: updated })
  }

  const deleteSubtask = (taskId, subId) => {
    if (!canEdit) return
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) return
    updateTask(taskId, { subtasks: (task.subtasks || []).filter((s) => s.id !== subId) })
  }

  const convertSubtaskToTask = (taskId, subId) => {
    if (!canEdit) return
    const task = data.tasks.find((t) => t.id === taskId)
    const sub = task?.subtasks?.find((s) => s.id === subId)
    if (!sub) return
    deleteSubtask(taskId, subId)
    createTask({ title: sub.title, status: task.status, priority: task.priority })
  }

  // Comments: targeted bell ringing
  // "when owner or other comment to someone the bell ring on that user web"
  const addComment = (taskId, text, recipientId) => {
    if (!text || !text.trim()) return
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) return

    // Target recipient: explicitly selected recipientId OR task assignee OR active user
    const targetRecipientId = recipientId || task.assigneeId || activeUser.id
    const targetUser = MOCK_USERS.find((u) => u.id === targetRecipientId) || activeUser

    const newComment = {
      id: `c-${Date.now()}`,
      userId: activeUser.id,
      recipientId: targetRecipientId,
      text: text.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updatedComments = [...(task.comments || []), newComment]
    const updatedTasks = data.tasks.map((t) =>
      t.id === taskId ? { ...t, comments: updatedComments } : t
    )

    commitData((prev) => ({
      ...prev,
      tasks: updatedTasks,
    }))

    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, comments: updatedComments }))
    }

    logActivity('Commented on', `${task.title} (to ${targetUser.name})`)

    // Ring bell ONLY on that target user's web:
    if (activeUser.id === targetRecipientId) {
      // The current web session is the targeted user (e.g. self-test or replying to assigned task)
      playBellSound()
      const notif = {
        id: `n-${Date.now()}`,
        title: `💬 New comment from ${activeUser.name}`,
        desc: `On "${task.title}": ${text.trim()}`,
        time: 'Just now',
        read: false,
      }
      setData((prev) => ({
        ...prev,
        notifications: [notif, ...(prev.notifications || [])],
      }))
      if (window.toast) window.toast(`🔔 Bell rung for comment to ${targetUser.name}`, 'info')
    } else {
      // Sender is NOT the recipient: sender's web does NOT ring bell!
      if (window.toast) {
        window.toast(`Comment sent to ${targetUser.name} (🔔 Bell will ring on their screen)`, 'success')
      }
    }

    // Broadcast across tabs so the targeted recipient's tab rings the bell!
    postBroadcast({
      type: 'COMMENT_TO_USER',
      senderId: activeUser.id,
      senderName: activeUser.name,
      recipientId: targetRecipientId,
      recipientName: targetUser.name,
      taskId: task.id,
      taskTitle: task.title,
      commentText: text.trim(),
      updatedTasks,
    })
  }

  const deleteComment = (taskId, commentId) => {
    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) return
    updateTask(taskId, { comments: (task.comments || []).filter((c) => c.id !== commentId) })
  }

  // Bulk Actions
  const bulkUpdateStatus = (taskIds, newStatus) => {
    if (!canEdit) return
    commitData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (taskIds.includes(t.id) ? { ...t, status: newStatus } : t)),
    }))
    if (window.toast) window.toast(`Updated ${taskIds.length} tasks to ${newStatus}`, 'success')
  }

  const bulkDelete = (taskIds) => {
    if (!canEdit) return
    commitData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => !taskIds.includes(t.id)),
    }))
    if (window.toast) window.toast(`Deleted ${taskIds.length} tasks`, 'info')
  }

  // Notifications
  const markAllNotificationsRead = () => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }))
    if (window.toast) window.toast('Notifications marked as read', 'info')
  }


  const exportWorkspaceJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `workspace-backup-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    if (window.toast) window.toast('Workspace backup downloaded', 'success')
  }

  const importWorkspaceJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      if (!parsed.workspaces || !parsed.tasks) {
        return window.toast('Invalid workspace file format', 'error')
      }
      setData(parsed)
      if (window.toast) window.toast('Workspace imported successfully', 'success')
    } catch {
      if (window.toast) window.toast('Failed to parse JSON file', 'error')
    }
  }

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setData(INITIAL_DATA)
    if (window.toast) window.toast('Reset to default workspace data', 'info')
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: data.workspaces,
        activeWorkspace,
        switchWorkspace,
        createWorkspace,
        renameWorkspace,
        deleteWorkspace,
        updateMemberRole,
        addMemberToWorkspace,
        removeMemberFromWorkspace,
        allUsers: data.users || MOCK_USERS,

        projects: workspaceProjects,
        allProjects: data.projects,
        activeProject,
        switchProject,
        createProject,
        deleteProject,
        addColumn,

        tasks: filteredTasks,
        allTasks: data.tasks,
        rawProjectTasks,
        createTask,
        updateTask,
        moveTaskStatus,
        deleteTask,
        duplicateTask,

        addSubtask,
        toggleSubtask,
        deleteSubtask,
        convertSubtaskToTask,

        addComment,
        deleteComment,

        bulkUpdateStatus,
        bulkDelete,

        broadcastOwnerMessage,
        activityLog: data.activityLog,
        notifications: data.notifications,
        markAllNotificationsRead,
        triggerNotification,
        playBellSound,

        activeView: data.activeView,
        setActiveView: (view) => setData((prev) => ({ ...prev, activeView: view })),

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

        selectedTask,
        setSelectedTask,

        activeUser,
        switchMockUser,
        canEdit,
        canManageWorkspace,
        isOwner,

        undo,
        canUndo: history.length > 0,

        exportWorkspaceJSON,
        importWorkspaceJSON,
        resetAllData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => useContext(WorkspaceContext)
