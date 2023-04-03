import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function useTodoist() {
    const [synced, setSynced] = useState(false)
    const [token] = useState(() => localStorage['token'])

    const [items, setItems] = useState(() => {
        if (localStorage['items']) 
             return JSON.parse(localStorage['items'])
        return []
    })

    const [users, setUsers] = useState(() => {
        if (localStorage['users']) 
             return JSON.parse(localStorage['users'])
        return []
    })

    const [tasks, setTasks] = useState([])
    const [user, setUser] = useState({})
    const [projects, setProjects] = useState([])

    const [searchParams] = useSearchParams()
    const userId = searchParams.get('uid') || users[0]?.id

    const navigate = useNavigate()
    const url = 'https://todoist.com'

    function sync() {
        setSynced(false)
    }

    function toggle(todoId) {
        setItems(todos => todos.map(todo => todo.id === todoId ? {...todo, checked:!todo.checked} : todo))
    }

    function push(todo="task", due="") {
        // TODO: push task to Todoist
    }

    function checkout(userId) {
        setUsers(users => users.map(user => user.id === userId ? {...user, checked:!user.checked} : user))
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

                        setUser({
                            id: data.user.id, 
                            name: data.user.full_name, 
                            mail: data.user.email,
                            avatar: data.user.avatar_medium,
                            inboxId: data.user.inbox_project_id
                        })
            
                        let projects = {}
                        data.projects.forEach( project => projects[project.id] = project.name )
                        setProjects(Object.keys(projects).map( key => { 
                            return { id: key, name: projects[key] }
                        }))

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

                        setItems(todos)
                        console.log('items:', todos.length)

                        let _users = []
                        data.collaborators.forEach(user => {
                            if (user.id !== data.user.id) {
                                const avatar = 
                                    encodeURI('https://avatars.doist.com?fullName=' + user.full_name + '&email=' + user.email)
                                    
                                _users.push({
                                    id: user.id, 
                                    name: user.full_name, 
                                    mail: user.email,
                                    avatar: user.avatar_medium || avatar,
                                    checked: users.some(us => us.id === user.id && us.checked )
                                })
                            }
                        })

                        _users.sort((a, b) => a.name > b.name ? 1 : -1)
                        _users.unshift({ 
                            id: data.user.id, 
                            name: data.user.full_name, 
                            mail: data.user.email, 
                            avatar: data.user.avatar_medium,
                            checked: true
                        })

                        setUsers(_users)
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
    }, [synced, token, users, navigate])

    useEffect(() => {
        setTasks(items
            .filter(item => item.responsibleId === userId)
            .sort((a, b) => a.due && b.due && a.due.date > b.due.date ? 1 : -1)
        )
    }, [userId, items])

    useEffect(()=> {
        localStorage.setItem("items", JSON.stringify(items))
    }, [items])
    
    useEffect(()=> {
        localStorage.setItem("users", JSON.stringify(users.filter(user => user.checked)))
    }, [users])
    
    return { url, synced, user, tasks, users, projects, sync, toggle, push, checkout }

}