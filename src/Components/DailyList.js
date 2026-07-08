import Todo from './Todo'
import { Dictionary } from './Dictionary'
import ProgressBar from './ProgressBar'

const lang = navigator.language.substring(0, 2)
const translate = Dictionary[lang] || Dictionary['en']

export default function DailyList({ date, items, url, toggle, update, sync, advanced }) {
    const day = new Date(date).getDate()
    const weekday = new Date(date).toLocaleString("default", { weekday: 'long' })
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' }

    const color =
        new Date(date).toLocaleString("default", options) <
        new Date().toLocaleString("default", options)
            ? 'crimson'
            : 'green'

    const today = new Date(date).toDateString() === new Date().toDateString()

    const todolist = [...items]
        .sort((a, b) => b.priority - a.priority)
        .map((todo) => {
            return (
                <Todo
                    key={todo.id}
                    todo={todo}
                    color={color}
                    sync={sync}
                    toggle={() => toggle(todo.id)}
                    open={() => window.open(`${url}/app/task/${todo.id}`)}
                    browse={() => window.open(`${url}/app/project/${todo.project.id}`)}
                />
            )
        })

    async function drop(event) {
        event.preventDefault()

        const id = event.dataTransfer.getData("Text")
        const year = date.getFullYear()
        const month = "0" + (date.getMonth() + 1)
        const d = "0" + date.getDate()
        const due = `${year}-${month.slice(-2)}-${d.slice(-2)}`

        update(id, due)

        const uuid = crypto.randomUUID()

        const commands = [
            {
                type: "item_update",
                uuid,
                args: {
                    id,
                    due: {
                        date: due,
                    },
                },
            },
        ]

        try {
            const response = await fetch("https://api.todoist.com/api/v1/sync", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage["token"] || ""}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ commands }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.error || "Todoist Sync API request failed")
            }

            const status = data.sync_status?.[uuid]

            if (status !== "ok") {
                console.error("Todoist item_update failed:", status)
                return
            }

            sync()
        } catch (err) {
            console.error("Todoist drop update error:", err.message)
            sync()
        }
    }

    function Day() {
        return (
            <div className='calendar-bold'>{day}</div>
        )
    }

    function Weekday() {
        return (
            <div className='calendar-normal'>
                {weekday}
                {items.length > 0 && <Todos />}
            </div>
        )
    }

    function Todos() {
        return <span className='calendar-label'>{items.length}</span>
    }

    function TodayStatus() {
        if (advanced) {
            const title = translate['today']
            const max = items.length
            const value = items.filter((item) => item.checked === true).length

            return (
                <div className='today-section'>
                    <ProgressBar title={title} value={value} max={max} />
                </div>
            )
        }

        return null
    }

    function Line() {
        return <div className='line' style={{ marginTop: '10px' }} />
    }

    return (
        <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={drop}
        >
            {today && <TodayStatus />}
            <Day />
            <Weekday />
            <Line />
            {todolist}
        </div>
    )
}