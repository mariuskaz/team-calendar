import Todo from './Todo'
import { Dictionary } from './Dictionary'
import ProgressBar from './ProgressBar'

const lang = navigator.language.substring(0,2)
const translate = Dictionary[lang] || Dictionary['en']

export default function DailyList({ date, items, url, toggle, update, sync, advanced }) {
    const day = new Date(date).getDate()
    const weekday = new Date(date).toLocaleString("default", { weekday: 'long' })
    const options = { year:'numeric', month:'numeric', day:'numeric' }
    const color = new Date(date).toLocaleString("default", options) < new Date().toLocaleString("default", options) ? 'crimson' : 'green'
    const today = new Date(date).toDateString() === new Date().toDateString()
    
    const todolist = items
        .sort((a, b) => b.priority - a.priority)
        .map( todo => {
        return <Todo key={todo.id} 
                todo={todo} 
                color={color} 
                sync={sync}
                toggle={()=>toggle(todo.id)}
                open={()=>window.open(`${url}/app/task/${todo.id}`)}
                browse={()=>window.open(`${url}/app/project/${todo.project.id}`)} />
    })

    function drop(event) {
        const id = event.dataTransfer.getData("Text"),
        year = date.getFullYear(),
        month = "0" + (date.getMonth() + 1),
        d = "0" + date.getDate(),
        due = year + "-" + month.slice(-2) + "-" + d.slice(-2),

        data = {
            due_date: due
        },

        headers = {
            'Authorization': 'Bearer ' + localStorage["token"] || "",
            'Content-Type': 'application/json'
        }

        update(id, due)

        fetch('https://api.todoist.com/rest/v2/tasks/' + id, { 
                method: 'POST',
                headers : headers,
                body: JSON.stringify(data)
        })

        .then(res => {
            sync()
        })

        //event.preventDefault();
    }

    function Day() {
        return (
            <div className='calendar-bold'>{day}</div>
        )
    }

    function Weekday() {
        return <div className='calendar-normal'>{weekday}{items.length > 0 && <Todos/>}</div>
    }

    function Todos() {
        return <span className='calendar-label'>{items.length}</span>
    }

    function TodayStatus() {
        if (advanced) {
            const title = translate['today']
            const max = items.length
            const value = items.filter(item => item.checked === true).length
            return  (
                <div className='today-section'>
                    <ProgressBar title={title} value={value} max={max} />
                </div>
            )
        }
    }

    function Line() {
        return <div className='line' style={{ marginTop:'10px' }} />
    }

    return (
        <div 
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => drop(event)}>
            {today && <TodayStatus />}
            <Day />
            <Weekday />
            <Line />
            {todolist}
        </div>
    )
}
