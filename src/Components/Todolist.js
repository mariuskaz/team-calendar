import Todo from './Todo'

export default function Todolist({ title, items, color, url, toggle, sync }) {
    
    const todolist = items.map( todo => {
        return <Todo key={todo.id} 
                todo={todo} 
                color={color} 
                sync={sync}
                toggle={()=>toggle(todo.id)}
                open={()=>window.open(`${url}/app/task/${todo.id}`)}
                browse={()=>window.open(`${url}/app/project/${todo.project.id}`)} />
    })

    return (
        <>
            <div className='section'>
                {title} <span>{items.length}</span>
            </div>
            <div className='line'/>
            <div>{todolist}</div>
        </>
    )
}
