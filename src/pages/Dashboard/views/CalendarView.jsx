import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'

const CalendarView = () => {
  const { tasks, setSelectedTask } = useWorkspace()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i)

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200 py-2.5 text-xs font-semibold text-slate-600">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {blanksArray.map((b) => (
            <div key={`blank-${b}`} className="min-h-[100px] bg-slate-50/50 p-2" />
          ))}

          {daysArray.map((day) => {
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayTasks = tasks.filter((t) => t.dueDate === formattedDate)
            const isToday =
              new Date().toISOString().split('T')[0] === formattedDate

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[100px] p-2 space-y-1.5 transition-colors ${
                  isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]'
                        : 'text-slate-600'
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">{dayTasks.length}</span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-1 px-1.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] text-slate-800 truncate cursor-pointer transition-colors"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
