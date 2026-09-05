import React, { useState } from 'react'
import { Activity, Clock } from 'lucide-react'
import { Avatar, Select } from 'antd'
import { useWorkspace, MOCK_USERS } from '@/context/WorkspaceContext'

const ActivityLogView = () => {
  const { activityLog } = useWorkspace()
  const [filterUser, setFilterUser] = useState('all')

  const filteredLog = activityLog.filter((item) => {
    if (filterUser !== 'all' && item.userId !== filterUser) return false
    return true
  })

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs gap-2">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Activity className="w-4 h-4 text-blue-600" />
          <span>Activity Stream</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filter user:</span>
          <Select
            value={filterUser}
            onChange={setFilterUser}
            className="w-32 sm:w-36"
            options={[
              { label: 'All Users', value: 'all' },
              ...MOCK_USERS.map((u) => ({ label: u.name, value: u.id })),
            ]}
          />
        </div>
      </div>

      {/* Activity Items */}
      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {filteredLog.map((log) => {
          const user = MOCK_USERS.find((u) => u.id === log.userId) || {
            name: 'User',
            avatar: 'U',
            color: '#888',
          }

          return (
            <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
              <Avatar size={24} style={{ backgroundColor: user.color }} className="mt-0.5 text-white font-bold text-xs">
                {user.avatar}
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{user.name}</span>{' '}
                  <span className="text-slate-500">{log.action}</span>{' '}
                  <span className="font-medium text-blue-700">"{log.target}"</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            </div>
          )
        })}

        {filteredLog.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityLogView
