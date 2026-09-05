import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Laptop, Plus, Check, ChevronDown, LogOut, Bell, Menu, X, Volume2, Megaphone, UserPlus, Users } from 'lucide-react'
import { Dropdown, Avatar, Modal, Input, Tooltip, Select } from 'antd'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

const emptyAccount = { fullName: '', email: '', password: '', role: 'member' }

const Navbar = () => {
  const { isAuth, user, handleLogout, savedAccounts, switchAccount, saveAccountToList } = useAuth()
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, activeUser, switchMockUser, notifications, markAllNotificationsRead, playBellSound, triggerNotification, broadcastOwnerMessage, isOwner } = useWorkspace()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [newWsName, setNewWsName] = useState('')
  const [ownerBroadcastModalOpen, setOwnerBroadcastModalOpen] = useState(false)
  const [ownerBroadcastText, setOwnerBroadcastText] = useState('')
  const [addAccountOpen, setAddAccountOpen] = useState(false)
  const [newAccount, setNewAccount] = useState(emptyAccount)
  const [addAccountLoading, setAddAccountLoading] = useState(false)

  const handleAddAccountChange = (e) =>
    setNewAccount((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleAddAccount = (e) => {
    e.preventDefault()
    const { fullName, email, password, role } = newAccount
    if (fullName.trim().length < 2) return window.toast('Enter a full name (min 2 chars)', 'error')
    if (!email.includes('@')) return window.toast('Enter a valid email address', 'error')
    if (password.length < 4) return window.toast('Password must be at least 4 characters', 'error')

    setAddAccountLoading(true)
    const users = JSON.parse(localStorage.getItem('users')) || []
    if (users.some((u) => u.email === email)) {
      setAddAccountLoading(false)
      return window.toast('This email is already registered', 'error')
    }
    const account = { fullName: fullName.trim(), email, password, role }
    users.push(account)
    localStorage.setItem('users', JSON.stringify(users))
    saveAccountToList(account)
    window.toast(`Account created! You can now switch to ${fullName.trim()}.`, 'success')
    setNewAccount(emptyAccount)
    setAddAccountOpen(false)
    setAddAccountLoading(false)
  }

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!ownerBroadcastText.trim()) return
    broadcastOwnerMessage(ownerBroadcastText.trim())
    setOwnerBroadcastText('')
    setOwnerBroadcastModalOpen(false)
  }

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const unreadNotifs = (notifications || []).filter((n) => !n.read).length

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    createWorkspace(newWsName.trim())
    setNewWsName('')
    setModalOpen(false)
  }

  // Workspaces dropdown
  const workspaceItems = [
    ...(workspaces || []).map((ws) => ({
      key: ws.id,
      label: (
        <div
          onClick={() => switchWorkspace(ws.id)}
          className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-100 cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2">
            <span>{ws.emoji || '📁'}</span>
            <span
              className={
                activeWorkspace?.id === ws.id ? 'text-blue-600 font-bold' : 'text-slate-700'
              }
            >
              {ws.name}
            </span>
          </div>
          {activeWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
        </div>
      ),
    })),
    { type: 'divider' },
    {
      key: 'new_ws',
      label: (
        <div
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 text-blue-600 font-semibold text-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace</span>
        </div>
      ),
    },
  ]

  // User dropdown — shows real logged-in account + all saved accounts + Add New Account
  const currentUser = user?.email ? user : activeUser
  const accountColor = currentUser?.color || '#3b82f6'
  const accountAvatar = currentUser?.avatar || (currentUser?.fullName || currentUser?.name || 'U')[0]?.toUpperCase()

  const userItems = [
    // Current account header
    {
      key: 'user_info',
      label: (
        <div className="px-2 py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Avatar size={30} style={{ backgroundColor: accountColor }} className="font-bold text-xs text-white flex-shrink-0">
              {accountAvatar}
            </Avatar>
            <div>
              <div className="font-bold text-slate-900 text-xs">{currentUser?.fullName || currentUser?.name}</div>
              <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[9px] uppercase font-bold border border-blue-200">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    // Saved accounts switcher
    ...(savedAccounts && savedAccounts.length > 1
      ? [
          {
            key: 'accounts_header',
            label: <span className="text-[10px] text-slate-400 uppercase font-bold px-2 flex items-center gap-1"><Users className="w-3 h-3" /> Switch Account:</span>,
            disabled: true,
          },
          ...savedAccounts.map((acc, i) => ({
            key: `acc-${i}`,
            label: (
              <div
                onClick={() => switchAccount(acc)}
                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <Avatar size={18} style={{ backgroundColor: acc.color || '#64748b' }} className="font-bold text-[9px] text-white flex-shrink-0">
                    {(acc.fullName || acc.name || 'U')[0]?.toUpperCase()}
                  </Avatar>
                  <div>
                    <span className={`font-semibold ${
                      (currentUser?.email === acc.email) ? 'text-blue-600' : 'text-slate-700'
                    }`}>
                      {acc.fullName || acc.name}
                    </span>
                    <span className="ml-1.5 text-[10px] text-slate-400">({acc.role})</span>
                  </div>
                </div>
                {currentUser?.email === acc.email && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
            ),
          })),
          { type: 'divider' },
        ]
      : [{ type: 'divider' }]
    ),
    // Add New Account
    {
      key: 'add_account',
      label: (
        <div
          onClick={() => setAddAccountOpen(true)}
          className="flex items-center gap-2 px-2 py-1 text-blue-600 font-semibold text-xs cursor-pointer hover:bg-blue-50 rounded-lg"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Account</span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'workspace_link',
      label: (
        <Link
          to="/workspace"
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 px-2 py-1 text-xs font-semibold"
        >
          <Laptop className="w-3.5 h-3.5 text-blue-600" /> Go to Workspace
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <div
          onClick={handleLogout}
          className="flex items-center gap-2 text-rose-600 hover:text-rose-700 px-2 py-1 text-xs font-semibold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </div>
      ),
    },
  ]

  // Notifications dropdown menu
  const notificationItems = [
    <div key="notif-header" className="flex items-center justify-between pb-2 border-b border-slate-100 px-1 min-w-[260px]">
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-slate-900 text-xs">Notifications</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            playBellSound()
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-semibold border border-blue-200 cursor-pointer"
          title="Play bell sound (bell.wav)"
        >
          <Volume2 className="w-3 h-3" />
          <span>Test Bell</span>
        </button>
      </div>

      {unreadNotifs > 0 && (
        <button
          onClick={markAllNotificationsRead}
          className="text-[10px] text-blue-600 hover:underline cursor-pointer font-medium"
        >
          Mark read
        </button>
      )}
    </div>,
    ...(notifications || []).map((notif) => (
      <div
        key={notif.id}
        className={`py-2 px-1 border-b border-slate-100 text-xs ${
          !notif.read ? 'bg-blue-50/40 rounded-lg' : ''
        }`}
      >
        <div className="font-semibold text-slate-800 text-[11px] flex items-center justify-between">
          <span>{notif.title}</span>
          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
        </div>
        <div className="text-slate-500 text-[11px] mt-0.5">{notif.desc}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{notif.time}</div>
      </div>
    )),
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center text-slate-900">
          {/* Logo & Workspace Switcher */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Laptop className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-900">
                Our<span className="text-blue-600">Space</span>
              </span>
            </Link>

            {isAuth && (
              workspaces && workspaces.length > 0 ? (
                <Dropdown menu={{ items: workspaceItems }} trigger={['click']}>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold cursor-pointer text-slate-800"
                  >
                    <span>{activeWorkspace?.emoji || '📁'}</span>
                    <span className="text-slate-800 max-w-[140px] truncate">{activeWorkspace?.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </Dropdown>
              ) : (
                <button
                  type="button"
                  data-create-workspace="true"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold cursor-pointer text-blue-700 animate-pulse"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              )
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isAuth ? (
              <>
                {/* Offline/Online Status */}
                <Tooltip title={isOnline ? 'Online' : 'Offline'}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </Tooltip>

                {/* Owner Broadcast Button */}
                {isOwner && (
                  <Tooltip title="Owner Broadcast (Rings bell for all users)">
                    <button
                      type="button"
                      onClick={() => setOwnerBroadcastModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                    >
                      <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden md:inline">Broadcast</span>
                    </button>
                  </Tooltip>
                )}

                {/* Notifications Bell */}
                <Dropdown
                  dropdownRender={() => (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg">
                      {notificationItems}
                    </div>
                  )}
                  trigger={['click']}
                >
                  <button
                    type="button"
                    className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    title="Notifications"
                  >
                    <Bell
                      className={`w-3.5 h-3.5 ${
                        unreadNotifs > 0 ? 'text-blue-600 animate-bell-shake' : ''
                      }`}
                    />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white font-bold text-[8px] flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>
                </Dropdown>

                {/* User Dropdown */}
                <Dropdown menu={{ items: userItems }} trigger={['click']}>
                  <button
                    type="button"
                    className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 cursor-pointer"
                  >
                    <div className="flex flex-col items-start pr-1 text-left">
                      <span className="text-xs font-semibold text-slate-800">{currentUser?.fullName || currentUser?.name}</span>
                      <span className="text-[9px] text-blue-600 uppercase font-mono font-bold leading-none">
                        {currentUser?.role}
                      </span>
                    </div>
                    <Avatar size={24} style={{ backgroundColor: accountColor }} className="font-bold text-xs text-white">
                      {accountAvatar}
                    </Avatar>
                  </button>
                </Dropdown>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login" className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium">
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-1.5 text-slate-700">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 p-4 space-y-3 text-xs text-slate-900 shadow-lg">
            {isAuth ? (
              <>
                {/* Mobile: Account Info */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Avatar size={24} style={{ backgroundColor: accountColor }} className="font-bold text-xs text-white flex-shrink-0">
                    {accountAvatar}
                  </Avatar>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{currentUser?.fullName || currentUser?.name}</div>
                    <div className="text-[10px] text-slate-500">{currentUser?.email}</div>
                  </div>
                </div>
                <span className="text-[10px] text-blue-600 uppercase font-mono font-bold">
                  {currentUser?.role}
                </span>
              </div>

              {/* Mobile: Switch Account */}
              {savedAccounts && savedAccounts.length > 1 && (
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Users className="w-3 h-3" /> Switch Account:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {savedAccounts.map((acc, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          switchAccount(acc)
                          setMobileOpen(false)
                        }}
                        className={`p-1.5 rounded-lg border text-left text-xs ${
                          currentUser?.email === acc.email
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold truncate">{acc.fullName || acc.name}</div>
                        <div className="text-[10px] text-slate-400">{acc.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile: Add New Account */}
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setAddAccountOpen(true) }}
                className="flex items-center gap-2 py-2 px-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 text-blue-600 font-semibold text-xs w-full cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add New Account
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-rose-600 font-semibold border-t border-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="p-2 text-center bg-slate-100 rounded-lg">
                  Login
                </Link>
                <Link to="/auth/register" onClick={() => setMobileOpen(false)} className="p-2 text-center bg-blue-600 text-white font-semibold rounded-lg">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* New Workspace Modal */}
      <Modal
        title={<span className="text-slate-900 font-bold text-sm">New Workspace</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <form onSubmit={handleCreate} className="mt-3 space-y-3 text-xs">
          <Input
            autoFocus
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            placeholder="Workspace name (e.g. Marketing, Mobile Client)..."
            className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg!"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 rounded text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Owner Broadcast Announcement Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Megaphone className="w-4 h-4 text-amber-600" />
            <span>Owner Announcement (Broadcast to All)</span>
          </div>
        }
        open={ownerBroadcastModalOpen}
        onCancel={() => setOwnerBroadcastModalOpen(false)}
        footer={null}
        centered
        width={480}
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <form onSubmit={handleSendBroadcast} className="mt-3 space-y-3 text-xs">
          <p className="text-xs text-slate-500">
            As the workspace <strong>Owner</strong> ({activeUser?.name}), sending this message will immediately ring the notification bell (<code>bell.wav</code>) on <strong>all team members' screens</strong>.
          </p>
          <Input.TextArea
            rows={3}
            value={ownerBroadcastText}
            onChange={(e) => setOwnerBroadcastText(e.target.value)}
            placeholder="Type your message to the entire team (e.g. 'All-hands sync in 10 minutes')..."
            className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg!"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOwnerBroadcastModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 shadow-xs cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Broadcast to All (Ring Bell)</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Account Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Add New Account</span>
          </div>
        }
        open={addAccountOpen}
        onCancel={() => { setAddAccountOpen(false); setNewAccount(emptyAccount) }}
        footer={null}
        centered
        width={420}
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <p className="text-xs text-slate-500 mb-4">
          Create a new account and switch to it from the user menu.
        </p>
        <form onSubmit={handleAddAccount} className="space-y-3">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
            <Input
              name="fullName"
              value={newAccount.fullName}
              onChange={handleAddAccountChange}
              placeholder="e.g. Jane Smith"
              autoFocus
              className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg! text-xs!"
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
            <Input
              name="email"
              type="email"
              value={newAccount.email}
              onChange={handleAddAccountChange}
              placeholder="jane@example.com"
              className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg! text-xs!"
            />
          </div>
          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <Input.Password
              name="password"
              value={newAccount.password}
              onChange={handleAddAccountChange}
              placeholder="Min 4 characters"
              className="bg-slate-50! border-slate-200! text-slate-900! rounded-lg! text-xs!"
            />
          </div>
          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <Select
              value={newAccount.role}
              onChange={(val) => setNewAccount((prev) => ({ ...prev, role: val }))}
              options={ROLE_OPTIONS}
              className="w-full"
              size="middle"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setAddAccountOpen(false); setNewAccount(emptyAccount) }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addAccountLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs cursor-pointer text-xs disabled:opacity-60"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Navbar
