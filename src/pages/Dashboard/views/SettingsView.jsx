import React, { useState } from 'react'
import { Settings, Users, Download, Upload, Trash2, AlertTriangle, UserPlus, UserMinus, Plus } from 'lucide-react'
import { Avatar, Select, Modal, Input } from 'antd'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'

const SettingsView = () => {
  const {
    activeWorkspace,
    renameWorkspace,
    deleteWorkspace,
    updateMemberRole,
    addMemberToWorkspace,
    removeMemberFromWorkspace,
    allUsers,
    exportWorkspaceJSON,
    importWorkspaceJSON,
    resetAllData,
    canManageWorkspace,
    isOwner,
    activeUser,
  } = useWorkspace()

  const [wsName, setWsName] = useState(activeWorkspace?.name || '')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  // Add Member Modal State
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const [addMode, setAddMode] = useState('existing') // 'existing' or 'new'
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('member')

  const teamUsersList = allUsers || MOCK_USERS
  const currentMemberIds = (activeWorkspace?.members || []).map((m) => m.userId)
  const availableTeamUsers = teamUsersList.filter((u) => !currentMemberIds.includes(u.id))

  const handleSaveName = (e) => {
    e.preventDefault()
    if (!wsName.trim()) return
    renameWorkspace(activeWorkspace.id, wsName.trim())
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      importWorkspaceJSON(event.target.result)
    }
    reader.readAsText(file)
  }

  const handleAddMember = (e) => {
    e.preventDefault()
    if (addMode === 'existing') {
      if (!selectedUserId) {
        return window.toast ? window.toast('Please select a team member', 'warning') : null
      }
      addMemberToWorkspace(activeWorkspace.id, {
        userId: selectedUserId,
        role: newMemberRole,
      })
    } else {
      if (!newMemberName.trim() && !newMemberEmail.trim()) {
        return window.toast ? window.toast('Please enter a name or email address', 'warning') : null
      }
      addMemberToWorkspace(activeWorkspace.id, {
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
      })
    }
    setSelectedUserId('')
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('member')
    setAddMemberModalOpen(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Workspace General Settings */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Workspace General</h2>
        </div>

        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label className="text-xs text-slate-600 font-semibold block mb-1.5">
              Workspace Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                disabled={!canManageWorkspace}
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                className="flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white disabled:opacity-75"
              />
              {canManageWorkspace && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Team Members & Roles */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">Members & Role Permissions</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              {(activeWorkspace?.members || []).length} members
            </span>
            {canManageWorkspace && (
              <button
                type="button"
                onClick={() => {
                  setAddMode(availableTeamUsers.length > 0 ? 'existing' : 'new')
                  setSelectedUserId(availableTeamUsers[0]?.id || '')
                  setAddMemberModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {(activeWorkspace?.members || []).map((m) => {
            const user = teamUsersList.find((u) => u.id === m.userId) || {
              name: 'Unknown User',
              email: 'user@workspace.io',
              avatar: 'U',
              color: '#64748b',
            }
            const isOwnerRole = m.role === 'owner'

            return (
              <div key={m.userId} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar size={32} style={{ backgroundColor: user.color }} className="text-white font-bold text-xs flex-shrink-0">
                    {user.avatar}
                  </Avatar>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {m.userId === activeUser.id && (
                        <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-1 rounded border border-emerald-100">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-none">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={m.role}
                    disabled={!canManageWorkspace || isOwnerRole}
                    onChange={(val) => updateMemberRole(m.userId, val)}
                    className="w-28 text-xs"
                    options={[
                      { label: 'Owner', value: 'owner' },
                      { label: 'Admin', value: 'admin' },
                      { label: 'Member', value: 'member' },
                      { label: 'Viewer', value: 'viewer' },
                    ]}
                  />

                  {canManageWorkspace && !isOwnerRole && (
                    <button
                      type="button"
                      onClick={() => removeMemberFromWorkspace(activeWorkspace.id, m.userId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={`Remove ${user.name} from workspace`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Add Member to {activeWorkspace?.name}</span>
          </div>
        }
        open={addMemberModalOpen}
        onCancel={() => setAddMemberModalOpen(false)}
        footer={null}
        centered
        width="min(480px, 95vw)"
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <form onSubmit={handleAddMember} className="mt-3 space-y-4 text-xs">
          {/* Tabs for Select Existing vs Invite New */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAddMode('existing')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                addMode === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Select Team Member ({availableTeamUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setAddMode('new')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                addMode === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Invite New User
            </button>
          </div>

          {addMode === 'existing' ? (
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                Choose Member
              </label>
              {availableTeamUsers.length > 0 ? (
                <Select
                  value={selectedUserId}
                  onChange={(val) => setSelectedUserId(val)}
                  className="w-full text-xs"
                  options={availableTeamUsers.map((u) => ({
                    value: u.id,
                    label: (
                      <div className="flex items-center gap-2 py-0.5">
                        <Avatar size={20} style={{ backgroundColor: u.color }} className="text-[10px] text-white font-bold">
                          {u.avatar}
                        </Avatar>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                        <span className="text-[10px] text-slate-400">({u.email})</span>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs">
                  All current team members are already in this workspace. Switch to <strong>Invite New User</strong> to add someone new.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. David Miller"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-slate-50! border-slate-200! rounded-lg! text-xs!"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="e.g. david@workspace.io"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="bg-slate-50! border-slate-200! rounded-lg! text-xs!"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-600 font-semibold block mb-1">
              Workspace Role
            </label>
            <Select
              value={newMemberRole}
              onChange={(val) => setNewMemberRole(val)}
              className="w-full text-xs"
              options={[
                { label: 'Member (Can view, create & update tasks)', value: 'member' },
                { label: 'Admin (Full access to manage workspace & projects)', value: 'admin' },
                { label: 'Viewer (Read-only access)', value: 'viewer' },
              ]}
            />
          </div>

          {isOwner && (
            <p className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 p-2 rounded-lg">
              🔔 As workspace Owner, adding this member will notify team members and ring the bell on all connected screens.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddMemberModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addMode === 'existing' && availableTeamUsers.length === 0}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Backup & Persistence */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Download className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Data Management & Backup</h2>
        </div>

        <p className="text-xs text-slate-500">
          Export full workspace state as a JSON file, or restore from a previous backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={exportWorkspaceJSON}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export JSON
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" /> Import JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold border border-slate-200"
          >
            Reset Default Data
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-rose-800">Danger Zone</h2>
          </div>
          <p className="text-xs text-rose-700">
            Deleting this workspace will permanently erase all associated projects and tasks.
          </p>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-4 h-4" /> Delete Workspace
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onOk={() => {
          deleteWorkspace(activeWorkspace.id)
          setDeleteConfirmOpen(false)
        }}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        title={<span className="text-slate-900 font-bold text-sm">Confirm Workspace Deletion</span>}
        centered
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <p className="text-xs text-slate-600 pt-2">
          Are you sure you want to delete <strong className="text-slate-900">{activeWorkspace?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        open={resetConfirmOpen}
        onCancel={() => setResetConfirmOpen(false)}
        onOk={() => {
          resetAllData()
          setResetConfirmOpen(false)
        }}
        okText="Reset Data"
        title={<span className="text-slate-900 font-bold text-sm">Reset All Data</span>}
        centered
        styles={{ content: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' } }}
      >
        <p className="text-xs text-slate-600 pt-2">
          This will restore all default workspaces, projects, tasks, and members. Any unsaved changes will be lost.
        </p>
      </Modal>
    </div>
  )
}

export default SettingsView
