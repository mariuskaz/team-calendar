import { useOutletContext, useSearchParams } from "react-router-dom"
import Header from "./Header"
import Todolist from "./Todolist"
import QuickTodo from "./QuickTodo"

export default function Unscheduled() {
  const [todoist] = useOutletContext()
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user') || todoist.user.id
  
  const tasks = todoist.tasks
    .filter(item => item.responsibleId === userId || 
    ( userId === todoist.user.id && item.project.id === todoist.user.inboxId) )

  const notSheduled = tasks.filter( item => !item.due )
  
  return (
    <div className='content'>
      <Header 
        title={'Not scheduled'} />

      <Todolist 
        title={'No due date'} 
        items={notSheduled} 
        color={'green'} 
        url={todoist.url}
        toggle={(todo)=>todoist.toggle(todo)} 
        sync={todoist.sync} />

      <QuickTodo 
        sync={todoist.sync} />

    </div>
  )
}
