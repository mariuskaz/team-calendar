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
  const [project, setProject] = useState(() => localStorage["project"] || "");

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

  const push = async (content, due) => {
    const uuid = crypto.randomUUID();
    const tempId = crypto.randomUUID();

    const projectId =
      project && project !== "undefined"
        ? project
        : user.inbox_project_id;

    if (!projectId) {
      console.error("Cannot add task: no project selected");
      return;
    }

    const args = {
      content: content || "New task",
      project_id: projectId,
    };

    if (user.id) {
      args.responsible_uid = user.id;
    }

    if (due) {
      args.due = { string: due };
    }

    const commands = [
      {
        type: "item_add",
        temp_id: tempId,
        uuid,
        args,
      },
    ];

    try {
      const response = await fetch("https://api.todoist.com/api/v1/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commands }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Todoist Sync API request failed");
      }

      const status = data.sync_status?.[uuid];

      if (status !== "ok") {
        console.error("Todoist command failed:", status);
        return;
      }

      const realId = data.temp_id_mapping?.[tempId] || tempId;

      const fallbackTodo = {
        id: realId,
        v2_id: null,
        checked: false,
        content: args.content,
        due: due
          ? {
              date: due,
              string: due,
            }
          : null,
        priority: 1,
        responsibleId: args.responsible_uid || user.id,
        project: {
          id: args.project_id,
          name: projects[args.project_id] || "Inbox",
        },
      };

      setItems((prevItems) => {
        const exists = prevItems.some((item) => item.id === realId);

        if (exists) {
          return prevItems;
        }

        return [...prevItems, fallbackTodo];
      });

      setSynced(false);
    } catch (err) {
      console.error("Todoist push error:", err.message);
    }
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

      const syncUrl = "https://api.todoist.com/api/v1/sync";
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
        syncToken === "*" ? handleInitialSync(data) : handleIncrementalSync(data);
  

      } catch (err) {
        if (err.name !== "AbortError")
          console.error("Connection error:", err.message);
      }
    };

    const handleInitialSync = (data) => {
      setUser({
        id: data.user.id,
        name: data.user.full_name,
        mail: data.user.email,
        avatar: data.user.avatar_medium,
        inbox_project_id: data.user.inbox_project_id,
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
      setSynced(true);
    };

    const handleIncrementalSync = (data) => {
      const todos = formatTodos(data.items, projects, user);

      const updatedItems = new Map(items.map((item) => [item.id, item]));
      todos.forEach((todo) => updatedItems.set(todo.id, todo));

      setItems([...updatedItems.values()]);
      if (data.sync_token) setSyncToken(data.sync_token);
      setSynced(true);
    };

    const formatTodos = (items, projects, user) => {
      return items
        .map((task) => ({
          id: task.id,
          v2_id: task.v2_id,
          checked: task.priority === 2,
          content: task.content,
          due: task.due,
          priority: task.priority,
          responsibleId: task.project_id === user.inbox_project_id ? user.id : task.responsible_uid,
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
      ]
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
    if (project.length > 0) localStorage.setItem("project", project);
  }, [project]);

  return { url, synced, user, tasks, users, projects, project, sync, toggle, update, push, checkout, setup };
}
