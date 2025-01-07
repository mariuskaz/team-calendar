import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function useTodoist() {
    const [synced, setSynced] = useState(false)
    const [token] = useState(() => localStorage['token'])
    const [syncToken, setSyncToken] = useState('*')

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
    const [projects, setProjects] = useState({})
    const [project, setProject] = useState(() => localStorage['project'])

    const [searchParams] = useSearchParams()
    const userId = searchParams.get('uid') || users[0]?.id

    const navigate = useNavigate()
    const url = 'https://app.todoist.com'

    function sync() {
        setSynced(false)
    }

    function toggle(todoId) {
        setItems(todos => todos.map(todo => todo.id === todoId ? {...todo, checked:!todo.checked} : todo))
    }

    function update(id, date) {
        setItems(todos => todos.map(todo => todo.id === id ? {...todo, due: { date }} : todo))
    }

    function push(content, due) {
        const task = { 
            content: content || "New task", 
            due_string: due || "", 
            project_id: project, 
            assignee_id: user.id 
        },
        headers = {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    
        fetch('https://api.todoist.com/rest/v2/tasks', { 
            method: 'POST',
            headers : headers,
            body: JSON.stringify(task)
        })
        .then(response => {
            sync()
        })
    }

    function checkout(userId) {
        setUsers(users => users.map(user => user.id === userId ? {...user, checked:!user.checked} : user))
    }

    function setup(projectId) {
        setProject(projectId)
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
                    sync_token: syncToken,
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

                        if (syncToken === '*') {
                            setUser({
                                id: data.user.id, 
                                name: data.user.full_name, 
                                mail: data.user.email,
                                avatar: data.user.avatar_medium,
                                inboxId: data.user.inbox_project_id
                            })
                
                            let _projects = {}
                            data.projects.forEach( project => _projects[project.id] = project.name )
                            setProjects(_projects)

                            const todos = data.items.map(task => { 
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
                                        name: _projects[task.project_id] 
                                    } 
                                }
                            })
    
                            todos.sort((a, b) => b.priority - a.priority)
    
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
                            setItems(todos)
                            setSyncToken(data.sync_token)
                            
                        } else {
                            const todos = data.items.map(task => { 
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
    
                            todos.sort((a, b) => b.priority - a.priority)
                            const map = new Map();
                            items.forEach(item => {
                                map.set(item.id, item);
                            });

                            todos.forEach(todo => {
                                map.set(todo.id, todo);
                            });

                            setItems(Array.from(map.values()))
                            setSynced(true)
                        }

                        console.log('items:', items.length)
                        
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
    }, [synced, token, syncToken, items, users, navigate])

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

    useEffect(()=> {
        localStorage.setItem("project", project)
    }, [project])
    
    return { url, synced, user, tasks, users, projects, project, sync, toggle, update, push, checkout, setup }

}