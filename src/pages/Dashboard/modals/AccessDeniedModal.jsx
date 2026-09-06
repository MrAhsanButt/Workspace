import React from 'react'
import { Modal } from 'antd'
import { ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react'
import { useWorkspace, ROLE_CONFIG } from '@/context/WorkspaceContext'

const AccessDeniedModal = () => {
  const {
    accessDeniedModal,
    closeAccessDenied,
    activeRole,
    simulateRole,
    activeWorkspace,
  } = useWorkspace()

  if (!accessDeniedModal?.open) return null

  const currentRoleConfig = ROLE_CONFIG[activeRole] || ROLE_CONFIG.viewer
  const requiredRoles = accessDeniedModal.requiredRoles || ['admin', 'owner']

  return (
    <Modal
      open={accessDeniedModal.open}
      onCancel={closeAccessDenied}
      footer={null}
      centered
      width="min(500px, 95vw)"
      styles={{
        content: {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #fee2e2',
          boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 8px 10px -6px rgba(239, 68, 68, 0.1)',
        },
      }}
    >
      <div className="space-y-4">
        {/* Top Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Permission Required
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Access Denied: {accessDeniedModal.actionTitle || 'Restricted Action'}
            </h3>
          </div>
        </div>

        {/* Message */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          {accessDeniedModal.message || 'You do not have the required permissions to perform this action in this workspace.'}
        </div>

        {/* Role Comparison Pill Box */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Current Role</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="text-sm">{currentRoleConfig.icon}</span>
              <span>{currentRoleConfig.label}</span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              in {activeWorkspace?.name || 'Workspace'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-500 block">Required Role</span>
            <div className="flex flex-wrap gap-1 items-center font-bold text-rose-900">
              {requiredRoles.length > 0 ? (
                requiredRoles.map((r) => {
                  const cfg = ROLE_CONFIG[r]
                  return (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-rose-200 text-[11px] text-rose-700 shadow-2xs"
                    >
                      <span>{cfg?.icon}</span>
                      <span>{cfg?.label || r}</span>
                    </span>
                  )
                })
              ) : (
                <span className="text-rose-700 text-[11px]">Restricted</span>
              )}
            </div>
            <span className="text-[10px] text-rose-400 block">or higher privilege</span>
          </div>
        </div>

        {/* Test Simulator Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Role (Instant Switch):</span>
            </span>
            <span className="text-[10px] text-slate-400">Click to test action</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { role: 'owner', label: 'Owner', icon: '👑' },
              { role: 'admin', label: 'Admin', icon: '🛡️' },
              { role: 'member', label: 'Member', icon: '💼' },
              { role: 'viewer', label: 'Viewer', icon: '👁️' },
            ].map(({ role, label, icon }) => {
              const isCurrent = activeRole === role
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => simulateRole(role)}
                  className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  {isCurrent && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={closeAccessDenied}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default AccessDeniedModal
