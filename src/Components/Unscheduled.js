import { useOutletContext } from "react-router-dom"
import Header from "./Header"
import Todolist from "./Todolist"
import QuickTodo from "./QuickTodo"

export default function Unscheduled() {
  const [todoist] = useOutletContext()
  const notSheduled = todoist.tasks.filter( item => !item.due )
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
