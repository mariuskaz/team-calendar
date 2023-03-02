import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function useTodoist() {
    const [synced, setSynced] = useState(false)
    const [token] = useState(() => localStorage['todoist.token'])
    const [status] = useState("Loading")
    const [tasks, setTasks] = useState(() => {
        if (localStorage['todoist.tasks']) 
             return JSON.parse(localStorage['todoist.tasks'])
        return []
    })
    const [userName, setUserName] = useState()
    const [avatar, setAvatar] = useState()
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
                    resource_types: ["user","items","projects"]
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
                        if (!localStorage["todoist.token"]) 
                            localStorage.setItem("todoist.token", token)
            
                        let  projects = {}
                        data.projects.forEach( project => projects[project.id] = project.name )
            
                        const items = data.items
                            .filter(item => item.responsible_uid === data.user.id || item.project_id === data.user.inbox_project_id)
                            .map(task => { return { id:task.id, checked:task.priority === 2, content:task.content, due:task.due, priority:task.priority, project: { id:task.project_id, name:projects[task.project_id] } }})
                            .sort((a, b) => a.due && b.due && a.due.date > b.due.date ? 1 : -1)
            
                        setTasks(items)
                        setUserName(data.user.full_name || "unknown")
                        setAvatar(data.user.avatar_medium || "avatar.png")

                        localStorage.setItem("todoist.tasks", JSON.stringify(items))

                        console.log('items:', items.length)
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


    return { url, synced, status, tasks, userName, avatar, sync, toggle, push }

}