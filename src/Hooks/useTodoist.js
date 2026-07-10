import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const TODOIST_URL = "https://app.todoist.com";
const TODOIST_SYNC_URL = "https://api.todoist.com/api/v1/sync";
const RESOURCE_TYPES = ["user", "items", "projects", "collaborators"];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage[key] || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function formatTodos(items = [], projects = {}, user = {}) {
  return items
    .map((task) => ({
      id: task.id,
      checked: task.priority === 2,
      content: task.content,
      due: task.due,
      priority: task.priority,
      responsibleId:
        task.project_id === user.inbox_project_id ? user.id : task.responsible_uid,
      project: {
        id: task.project_id,
        name: projects[task.project_id],
      },
    }))
    .sort((a, b) => b.priority - a.priority);
}

function formatCollaborators(collaborators = [], user = {}, existingUsers = []) {
  const checkedUserIds = new Set(
    existingUsers.filter((existingUser) => existingUser.checked).map(({ id }) => id)
  );

  const otherUsers = collaborators
    .filter((collaborator) => collaborator.id !== user.id)
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .map((collaborator) => ({
      id: collaborator.id,
      name: collaborator.full_name,
      mail: collaborator.email,
      avatar:
        collaborator.avatar_medium ||
        `https://avatars.doist.com?fullName=${collaborator.full_name}&email=${collaborator.email}`,
      checked: checkedUserIds.has(collaborator.id),
    }));

  return [
    {
      id: user.id,
      name: user.full_name,
      mail: user.email,
      avatar: user.avatar_medium,
      checked: true,
    },
    ...otherUsers,
  ];
}

function sortByDueDate(a, b) {
  if (!a.due?.date) return 1;
  if (!b.due?.date) return -1;
  return a.due.date > b.due.date ? 1 : -1;
}

export default function useTodoist() {
  const [synced, setSynced] = useState(false);
  const [token] = useState(() => localStorage["token"] || "");
  const syncToken = useRef("*");
  const latest = useRef({});

  const [items, setItems] = useState(() => readJson("items", []));
  const [users, setUsers] = useState(() => readJson("users", []));
  const [user, setUser] = useState({});
  const [projects, setProjects] = useState({});
  const [project, setProject] = useState(() => localStorage["project"] || "");
  const [syncRequest, setSyncRequest] = useState(0);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("uid") || users[0]?.id;

  useEffect(() => {
    latest.current = { items, projects, user, users };
  }, [items, projects, user, users]);

  const tasks = useMemo(
    () =>
      items
        .filter((item) => item.responsibleId === userId)
        .sort(sortByDueDate),
    [items, userId]
  );

  const sync = useCallback(() => {
    setSynced(false);
    setSyncRequest((request) => request + 1);
  }, []);

  const toggle = useCallback((todoId) => {
    setItems((todos) =>
      todos.map((todo) =>
        todo.id === todoId ? { ...todo, checked: !todo.checked } : todo
      )
    );
  }, []);

  const update = useCallback((id, date) => {
    setItems((todos) =>
      todos.map((todo) => (todo.id === id ? { ...todo, due: { date } } : todo))
    );
  }, []);

  const push = useCallback(
    async (content, due) => {
      const uuid = crypto.randomUUID();
      const tempId = crypto.randomUUID();

      const args = {
        content: content || "New task",
        project_id: project || undefined,
        responsible_uid: user.id || undefined,
      };

      if (due) {
        args.due = { string: due };
      }

      try {
        const response = await fetch(TODOIST_SYNC_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commands: [
              {
                type: "item_add",
                temp_id: tempId,
                uuid,
                args,
              },
            ],
          }),
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

        setItems((prevItems) =>
          prevItems.some((item) => item.id === realId)
            ? prevItems
            : [...prevItems, fallbackTodo]
        );
        sync();
      } catch (err) {
        console.error("Todoist push error:", err.message);
      }
    },
    [project, projects, sync, token, user]
  );

  const checkout = useCallback((userId) => {
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === userId
          ? { ...currentUser, checked: !currentUser.checked }
          : currentUser
      )
    );
  }, []);

  const setup = useCallback((projectId) => setProject(projectId), []);

  const fetchTodoist = useCallback(
    async (signal) => {
      if (!token) {
        navigate("/connect");
        setSynced(true);
        return;
      }

      const requestedSyncToken = syncToken.current;

      try {
        const response = await fetch(TODOIST_SYNC_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sync_token: requestedSyncToken,
            resource_types: RESOURCE_TYPES,
          }),
          signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Todoist Sync API request failed");
        }

        const current = latest.current;
        const mergedProjects =
          data.projects?.length > 0
            ? {
                ...current.projects,
                ...Object.fromEntries(
                  data.projects.map((todoistProject) => [
                    todoistProject.id,
                    todoistProject.name,
                  ])
                ),
              }
            : current.projects || {};

        if (requestedSyncToken === "*") {
          const initialUser = {
            id: data.user.id,
            name: data.user.full_name,
            mail: data.user.email,
            avatar: data.user.avatar_medium,
            inbox_project_id: data.user.inbox_project_id,
          };

          setUser(initialUser);
          setProjects(mergedProjects);
          setUsers(formatCollaborators(data.collaborators, data.user, current.users));
          setItems(formatTodos(data.items, mergedProjects, initialUser));
        } else {
          if (data.projects?.length > 0) {
            setProjects(mergedProjects);
          }

          if (data.items?.length > 0) {
            setItems((prevItems) => {
              const updatedItems = new Map(prevItems.map((item) => [item.id, item]));

              formatTodos(data.items, mergedProjects, current.user).forEach((todo) => {
                updatedItems.set(todo.id, todo);
              });

              return [...updatedItems.values()];
            });
          }
        }

        if (data.sync_token) {
          syncToken.current = data.sync_token;
        }

        setSynced(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Connection error:", err.message);
          setSynced(true);
        }
      }
    },
    [navigate, token]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchTodoist(controller.signal);

    return () => controller.abort();
  }, [fetchTodoist, syncRequest]);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      "users",
      JSON.stringify(users.filter((currentUser) => currentUser.checked))
    );
  }, [users]);

  useEffect(() => {
    if (project.length > 0) localStorage.setItem("project", project);
  }, [project]);

  return {
    url: TODOIST_URL,
    synced,
    user,
    tasks,
    users,
    projects,
    project,
    sync,
    toggle,
    update,
    push,
    checkout,
    setup,
  };
}
