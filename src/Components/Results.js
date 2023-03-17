import { useOutletContext, useSearchParams } from "react-router-dom"
import Header from "./Header"
import Todolist from "./Todolist"

export default function Results() {
    const [todoist] = useOutletContext()
    const [searchParams] = useSearchParams()
    const searchText = searchParams.get('search')
    
    const title = `Results for "${searchText}"`
    const results = todoist.tasks.filter( item => item.content.toLowerCase().includes(searchText?.toLowerCase()) )

    return (
        <div className='content'>
            <Header 
            title={title} />

            <Todolist 
            title={'Items found'} 
            items={results} 
            color={'green'} 
            url={todoist.url}
            toggle={(todo)=>todoist.toggle(todo)} 
            sync={todoist.sync} />

        </div>
    )
}
