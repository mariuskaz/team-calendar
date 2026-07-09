import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function useTodoist() {
  const [synced, setSynced] = useState(false);
  const [token] = useState(() => localStorage.getItem("token") || "");
  const [syncToken, setSyncToken] = useState("*");

  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem("items") || "[]")
  );

  const [users, setUsers] = useState(() =>
    JSON.parse(localStorage.getItem("users") || "[]")
  );

  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState({});
  const [project, setProject] = useState(() => {
    const savedProject = localStorage.getItem("project");
    return savedProject && savedProject !== "undefined" ? savedProject : "";
  });

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
      todos.map((todo) =>
        todo.id === id ? { ...todo, due: { date } } : todo
      )
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
      console.error("Cannot add task: no project selected and inbox project is missing");
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
      args.due = {
        string: due,
      };
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

      if (data.sync_token) {
        setSyncToken(data.sync_token);
      }

      sync();
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

  const setup = (projectId) => {
    if (!projectId || projectId === "undefined") return;
    setProject(projectId);
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const isSameDay = (date1, date2) => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);

      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    const formatTodos = (items, projects, user) => {
      return items
        .filter((task) => !task.is_deleted && !task.checked)
        .map((task) => ({
          id: task.id,
          v2_id: task.v2_id,
          checked: task.priority === 2,
          content: task.content,
          due: task.due,
          priority: task.priority,
          responsibleId:
            task.project_id === user.inbox_project_id
              ? user.id
              : task.responsible_uid || user.id,
          project: {
            id: task.project_id,
            name: projects[task.project_id] || "Inbox",
          },
        }))
        .sort((a, b) => b.priority - a.priority);
    };

    const formatCollaborators = (collaborators = [], user, existingUsers) => {
      const otherUsers = collaborators.filter((u) => u.id !== user.id);

      return [
        {
          id: user.id,
          name: user.full_name,
          mail: user.email,
          avatar: user.avatar_medium,
          checked: true,
        },
        ...otherUsers
          .sort((a, b) => (a.full_name > b.full_name ? 1 : -1))
          .map((collaborator) => ({
            id: collaborator.id,
            name: collaborator.full_name,
            mail: collaborator.email,
            avatar:
              collaborator.avatar_medium ||
              `https://avatars.doist.com?fullName=${collaborator.full_name}&email=${collaborator.email}`,
            checked: existingUsers.some(
              (u) => u.id === collaborator.id && u.checked
            ),
          })),
      ];
    };

    const handleNotes = (notes = []) => {
      notes.forEach((note) => {
        if (isSameDay(note.posted_at, new Date()) && note.content.length > 0) {
          console.log(
            "%cComment " + new Date(note.posted_at).toLocaleString(),
            "font-weight: 900; color: black"
          );
          console.log(note.content);
        }
      });
    };

    const handleInitialSync = (data) => {
      const currentUser = data.user;

      const formattedUser = {
        id: currentUser.id,
        name: currentUser.full_name,
        mail: currentUser.email,
        avatar: currentUser.avatar_medium,
        inbox_project_id: currentUser.inbox_project_id,
      };

      setUser(formattedUser);

      const _projects = Object.fromEntries(
        data.projects.map((project) => [project.id, project.name])
      );

      setProjects(_projects);

      const currentProject =
        project && project !== "undefined"
          ? project
          : currentUser.inbox_project_id;

      if (currentProject) {
        setProject(currentProject);
        localStorage.setItem("project", currentProject);
      }

      const todos = formatTodos(data.items || [], _projects, currentUser);
      const _users = formatCollaborators(
        data.collaborators || [],
        currentUser,
        users
      );

      setUsers(_users);
      setItems(todos);
      setSyncToken(data.sync_token);
      setSynced(true);

      console.log("tasks:", todos.length);

      handleNotes(data.notes);
    };

    const handleIncrementalSync = (data) => {
      const todos = formatTodos(data.items || [], projects, user);

      setItems((currentItems) => {
        const updatedItems = new Map(
          currentItems.map((item) => [item.id, item])
        );

        todos.forEach((todo) => {
          updatedItems.set(todo.id, todo);
        });

        if (data.items) {
          data.items.forEach((item) => {
            if (item.is_deleted || item.checked) {
              updatedItems.delete(item.id);
            }
          });
        }

        return [...updatedItems.values()];
      });

      if (data.projects?.length) {
        setProjects((currentProjects) => ({
          ...currentProjects,
          ...Object.fromEntries(
            data.projects
              .filter((project) => !project.is_deleted)
              .map((project) => [project.id, project.name])
          ),
        }));
      }

      if (data.collaborators?.length && user.id) {
        setUsers((currentUsers) =>
          formatCollaborators(data.collaborators, user, currentUsers)
        );
      }

      if (data.sync_token) {
        setSyncToken(data.sync_token);
      }

      setSynced(true);

      handleNotes(data.notes);
    };

    const fetchTodoist = async () => {
      if (!token) {
        navigate("/connect");
        setSynced(true);
        return;
      }

      console.log("syncing...");

      const syncUrl = "https://api.todoist.com/api/v1/sync";

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const params = {
        sync_token: syncToken,
        resource_types: [
          "user",
          "items",
          "projects",
          "collaborators",
          "notes",
        ],
      };

      try {
        const response = await fetch(syncUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(params),
          signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Todoist sync failed");
        }

        if (syncToken === "*") {
          handleInitialSync(data);
        } else {
          handleIncrementalSync(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Connection error:", err.message);
          setSynced(true);
        }
      }
    };

    if (!synced) {
      fetchTodoist();
    }

    return () => controller.abort();
  }, [synced, token, syncToken, navigate]);

  useEffect(() => {
    setTasks(
      items
        .filter((item) => item.responsibleId === userId)
        .sort((a, b) => {
          if (!a.due?.date && !b.due?.date) return 0;
          if (!a.due?.date) return 1;
          if (!b.due?.date) return -1;
          return a.due.date > b.due.date ? 1 : -1;
        })
    );
  }, [userId, items]);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      "users",
      JSON.stringify(users.filter((user) => user.checked))
    );
  }, [users]);

  useEffect(() => {
    if (project && project !== "undefined") {
      localStorage.setItem("project", project);
    }
  }, [project]);

  return { url, synced, user, tasks, users, projects, project, sync, toggle, update, push, checkout, setup };
}