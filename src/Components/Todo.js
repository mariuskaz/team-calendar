export default function Todo({ todo, color, open, browse, toggle, sync }) {
    const text = todo.content.split("](")[0].replace("[", "")

    const time =
        todo.due && todo.due.date.indexOf("T") > 0
            ? new Date(todo.due.date).toLocaleTimeString().substring(0, 5)
            : ""

    const due = todo.due
        ? `${new Date(todo.due.date).toLocaleDateString()} ${time}`
        : "not scheduled"

    const project = todo.project.name

    const colors = [
        "black",
        "lightgray",
        "#246fe0",
        "orange",
        "crimson",
    ]

    const style = {
        padding: "7px 4px",
        fontSize: "0.8em",
        textAlign: "left",
        overflow: "hidden",
        borderBottom: "1px solid gainsboro",
        userSelect: "none",
    }

    const checkStyle = {
        color: colors[todo.priority],
        cursor: "pointer",
        margin: "-2px 10px 0px 0px",
        verticalAlign: "top",
    }

    const todoStyle = {
        display: "inline-block",
        width: "calc(100% - 31px)",
    }

    const textStyle = {
        color: todo.checked ? "gray" : "black",
        cursor: "pointer",
        textDecoration: todo.checked ? "line-through" : "none",
    }

    const projectStyle = {
        float: "right",
        color: "gray",
        cursor: "pointer",
        display: "inline-block",
        textOverflow: "ellipsis",
        textAlign: "right",
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: "184px",
    }

    async function update() {
        const token = localStorage["token"] || ""
        const priority = todo.priority !== 2 ? 2 : 1
        const uuid = crypto.randomUUID()

        const commands = [
            {
                type: "item_update",
                uuid,
                args: {
                    id: todo.id,
                    priority,
                },
            },
        ]

        toggle()

        try {
            const response = await fetch("https://api.todoist.com/api/v1/sync", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
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
            console.error("Todoist priority update error:", err.message)
            sync()
        }
    }

    function Checkmark() {
        if (todo.checked) {
            return (
                <i className="material-icons" style={checkStyle} onClick={update}>
                    check_circle
                </i>
            )
        }

        return (
            <i className="material-icons" style={checkStyle} onClick={update}>
                radio_button_unchecked
            </i>
        )
    }

    function Content() {
        return (
            <div style={todoStyle}>
                <span onClick={open} style={textStyle}>
                    {text}
                </span>
                <br />
                <small style={{ color }}>{due}</small>
                <span onClick={browse} style={projectStyle}>
                    {project}
                </span>
            </div>
        )
    }

    function drag(event) {
        event.dataTransfer.setData("Text", todo.id)
    }

    return (
        <div
            id={todo.id}
            style={style}
            draggable="true"
            onDragStart={drag}
        >
            <Checkmark />
            <Content />
        </div>
    )
}