import { useOutletContext } from "react-router-dom"
import DailyList from './DailyList'
import QuickTodo from './QuickTodo'

export default function Calendar() {
    const [todoist, week, setWeek, showToday] = useOutletContext()
    const day = new Date().getDay()
    const start = week - day + 1
    const range = week + 7 - day + 1

    const startDay = new Date()
    startDay.setDate(startDay.getDate() + week - day + 1)

    const year = startDay.getFullYear()
    const month = startDay.toLocaleString("default", { month: 'long' })

    let calendar = []
    for (let d = start; d < range; d++) {
      let startDate = new Date().setHours(d * 24, 0, 0),
      endDate = new Date().setHours((d + 1) * 24, 0, 0),
      date = new Date(startDate),
      today = d === 0 ? true : false,
      color = d < 0 ? 'red' : 'green',
      
      tasks = todoist.tasks
        .filter( item => item.due && new Date(item.due.date) >= startDate && new Date(item.due.date) < endDate )
        .reverse(),

      due = new Date(startDate).toLocaleString("default", {
        year:'numeric', month:'2-digit', day:'2-digit'
      }),

      key = `cal${due}`
      calendar.push({ key, date, tasks, due, today, color })

    }

    function CalendarHeader() {
      return (
        <div className='header calendar'>
          <div className='calendar-toolbox'>
            <i className="material-icons icon-button" onClick={() => setWeek(w => w - 7)}>chevron_left</i>
            <i className="material-icons icon-button" onClick={() => setWeek(w => w + 7)}>chevron_right</i>
            <div className="text-button" onClick={showToday}>Today</div>
          </div>
          {year} {month} 
        </div>
      )
    }

    return (
      <div className='content'>
        <CalendarHeader />
        {
          calendar.map(item => {
            return (
              <div key={item.key}>
                <DailyList 
                  date={item.date} 
                  items={item.tasks} 
                  advanced={true} 
                  url={todoist.url}
                  update={(id, date)=>todoist.update(id, date)}
                  toggle={(todo)=>todoist.toggle(todo)} 
                  sync={todoist.sync} />
                <QuickTodo 
                  due={item.due} 
                  push={(task, date) => todoist.push(task, date)} />
                <div className='space' />
              </div>
            )
          })
        }
      </div>
    )
}