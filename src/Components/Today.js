import React from 'react'
import { useOutletContext, useSearchParams } from "react-router-dom"
import Header from './Header'
import Todolist from './Todolist'
import DailyList from './DailyList'
import QuickTodo from './QuickTodo'

export default function Today() {
  const [todoist] = useOutletContext()
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user') || todoist.user.id

  const today = new Date().setHours(0, 0, 0)
  const tommorow = new Date().setHours(24, 0, 0)

  const tasks = todoist.tasks
    .filter(item => item.responsibleId === userId || 
      ( userId === todoist.user.id && item.project.id === todoist.user.inboxId) )

  const overdueTasks = tasks
    .filter( item => !item.checked && item.due && new Date(item.due.date) < today )
    .sort((a, b) => a.due && b.due && a.due.date > b.due.date ? 1 : -1)
  
  const todayTasks = tasks
    .filter( item => item.due && new Date(item.due.date) >= today && new Date(item.due.date) < tommorow )
    .reverse()

  return (
    <div className='content'>

      <Header 
        title={'Today'} 
        label={new Date().toLocaleDateString()} />

      {overdueTasks.length > 0 && 
        <Todolist 
          title={'Overdue'} 
          color={'red'} 
          items={overdueTasks}
          url={todoist.url}
          toggle={(todo)=>todoist.toggle(todo)} 
          sync={todoist.sync} />
      }

      {overdueTasks.length === 0 && 
        <div className='space'/>}

      <DailyList 
        date={today} 
        items={todayTasks}
        url={todoist.url}
        toggle={(todo)=>todoist.toggle(todo)} 
        sync={todoist.sync} />

      <QuickTodo 
        due={'today'} 
        sync={todoist.sync} />

    </div>
  )
}
