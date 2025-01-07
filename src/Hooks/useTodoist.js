import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function useTodoist() {
  const [synced, setSynced] = useState(false);
  const [token] = useState(() => localStorage["token"]);
  const [syncToken, setSyncToken] = useState("*");

  const [items, setItems] = useState(() => JSON.parse(localStorage["items"] || "[]"));
  const [users, setUsers] = useState(() => JSON.parse(localStorage["users"] || "[]"));

  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState({});
  const [project, setProject] = useState(() => localStorage["project"]);

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("uid") || users[0]?.id;

  const navigate = useNavigate();
  const url = "https://app.todoist.com";

  const sync = () => setSynced(false);

  const toggle = (todoId) => {
    setItems((todos) =>
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, checked: !todo.checked } : todo
      )
    );
  };

  const update = (id, date) => {
    setItems((todos) =>
      todos.map((todo) => (todo.id === id ? { ...todo, due: { date } } : todo))
    );
  };

  const push = (content, due) => {
    const task = {
      content: content || "New task",
      due_string: due || "",
      project_id: project,
      assignee_id: user.id,
    };

    fetch("https://api.todoist.com/rest/v2/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    }).then(() => sync());
  };

  const checkout = (userId) => {
    setUsers((users) =>
      users.map((user) =>
        user.id === userId ? { ...user, checked: !user.checked } : user
      )
    );
  };

  const setup = (projectId) => setProject(projectId);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTodoist = async () => {
      if (!token) {
        navigate("/connect");
        setSynced(true);
        return;
      }
      console.log("syncing...")
      const syncUrl = "https://api.todoist.com/sync/v9/sync";
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const params = {
        sync_token: syncToken,
        resource_types: ["user", "items", "projects", "collaborators"],
      };

      try {
        const response = await fetch(syncUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(params),
          signal,
        });

        const data = await response.json();

        if (syncToken === "*") {
          handleInitialSync(data);
        } else {
          handleIncrementalSync(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Connection error:", err.message);
        }
      }
    };

    const handleInitialSync = (data) => {
      setUser({
        id: data.user.id,
        name: data.user.full_name,
        mail: data.user.email,
        avatar: data.user.avatar_medium,
        inboxId: data.user.inbox_project_id,
      });

      const _projects = Object.fromEntries(
        data.projects.map((project) => [project.id, project.name])
      );
      setProjects(_projects);

      const todos = formatTodos(data.items, _projects, data.user);
      const _users = formatCollaborators(data.collaborators, data.user, users);

      setUsers(_users);
      setItems(todos);
      setSyncToken(data.sync_token);
      
      console.log('items', items.length)
    };

    const handleIncrementalSync = (data) => {
      const todos = formatTodos(data.items, projects, user);

      const updatedItems = new Map(items.map((item) => [item.id, item]));
      todos.forEach((todo) => updatedItems.set(todo.id, todo));

      setItems([...updatedItems.values()]);
      setSynced(true);

      console.log('items', items.length)
    };

    const formatTodos = (items, projects, user) => {
      return items
        .map((task) => ({
          id: task.id,
          checked: task.priority === 2,
          content: task.content,
          due: task.due,
          priority: task.priority,
          responsibleId:
            task.project_id === user.inboxId ? user.id : task.responsible_uid,
          project: {
            id: task.project_id,
            name: projects[task.project_id],
          },
        }))
        .sort((a, b) => b.priority - a.priority);
    };

    const formatCollaborators = (collaborators, user, existingUsers) => {
      const otherUsers = collaborators.filter((u) => u.id !== user.id);
      
      return [
        {
          id: user.id,
          name: user.full_name,
          mail: user.email,
          avatar: user.avatar_medium,
          checked: true,
        },
        ...otherUsers.sort((a, b) => a.full_name > b.full_name ? 1 : -1).map((collaborator) => ({
          id: collaborator.id,
          name: collaborator.full_name,
          mail: collaborator.email,
          avatar:
            collaborator.avatar_medium ||
            `https://avatars.doist.com?fullName=${collaborator.full_name}&email=${collaborator.email}`,
          checked: existingUsers.some((u) => u.id === collaborator.id && u.checked),
        })),
      ] //.sort((a, b) => a.name.localeCompare(b.name));
    };

    if (!synced) fetchTodoist();

    return () => controller.abort();
  }, [synced, token, syncToken, items, projects, user, users, navigate]);

  useEffect(() => {
    setTasks(
      items
        .filter((item) => item.responsibleId === userId)
        .sort((a, b) => (a.due?.date > b.due?.date ? 1 : -1))
    );
  }, [userId, items]);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users.filter((user) => user.checked)));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("project", project);
  }, [project]);

  return { url, synced, user, tasks, users, projects, project, sync, toggle, update, push, checkout, setup };
}
