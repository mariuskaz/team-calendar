import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function useTodoist() {
    const [synced, setSynced] = useState(false)
    const [token] = useState(() => localStorage['todoist.token'])
    const [status] = useState("Loading")

    const [items, setItems] = useState(() => {
        if (localStorage['todoist.items']) 
             return JSON.parse(localStorage['todoist.items'])
        return []
    })

    const [tasks, setTasks] = useState([])
    const [user, setUser] = useState({})
    const [team, setTeam] = useState([])

    const [searchParams] = useSearchParams()
    const userId = searchParams.get('user') || user.id || localStorage["todoist.id"]

    const navigate = useNavigate()
    const url = 'https://todoist.com'

    function sync() {
        setSynced(false)
    }

    function toggle(todoId) {
        setTasks(todos => todos.map(todo => todo.id === todoId ? {...todo, checked:!todo.checked} : todo))
    }

    function push(todo="task", due="") {
        // TODO: push task to Todoist
    }

    useEffect( () => {
        const controller = new AbortController()
        const signal = controller.signal
    
        const fetchTodoist = () => {

            if (token === undefined) {
                navigate('/connect')
                setSynced(true)

            } else {

                const url = "https://api.todoist.com/sync/v9/sync",
                headers = {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
        
                params = {
                    sync_token: '*',
                    resource_types: ["user","items","projects","collaborators"]
                }
        
                console.log("syncing...")
        
                fetch(url, { 
                    method: 'POST',
                    headers : headers,
                    body: JSON.stringify(params),
                    signal
                })
            
                .then(res => {
                    res.json().then(data => {
                        if (!localStorage["todoist.token"]) {
                            localStorage.setItem("todoist.token", token)
                            localStorage.setItem("todoist.id", data.user.id)
                        }
            
                        let  projects = {}
                        data.projects.forEach( project => projects[project.id] = project.name )

                        const todos = data.items
                            .map(task => { 
                                return { 
                                    id: task.id, 
                                    checked: task.priority === 2, 
                                    content: task.content, 
                                    due: task.due, 
                                    priority: task.priority,
                                    responsibleId: task.project_id === data.user.inbox_project_id ? 
                                        data.user.id : task.responsible_uid,
                                    project: { 
                                        id: task.project_id, 
                                        name: projects[task.project_id] 
                                    } 
                                }
                            })
                            .sort((a, b) => a.due && b.due && a.due.date > b.due.date ? 1 : -1)
            
                        setUser({
                            id: data.user.id, 
                            name: data.user.full_name, 
                            avatar: data.user.avatar_medium,
                            inboxId: data.user.inbox_project_id
                        })

                        setItems(todos)
                        localStorage.setItem("todoist.items", JSON.stringify(todos))
                        console.log('items:', todos.length)

                        setTeam(data.collaborators)
                        setSynced(true)

                    })
                })
        
                .catch(err => {
                    if (err.name !== "AbortError")
                        console.error("Connection error: " + err.message)
                })

            }
        } 
        
        if (!synced) fetchTodoist()
      
        return () => controller.abort()
    }, [synced, token, navigate])

    useEffect(() => {
        setTasks(items.filter(item => item.responsibleId === userId))
    }, [userId, items])
    
    return { url, user, synced, status, tasks, team, sync, toggle, push }

}