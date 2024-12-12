export default function Todo({ todo, color, open, browse, toggle, sync }) {

    const text = todo.content.split("](")[0].replace("[",""),

    time = todo.due && todo.due.date.indexOf("T") > 0 ? 
        new Date(todo.due.date).toLocaleTimeString().substring(0,5) : "",

    due = todo.due ? new Date(todo.due.date).toLocaleDateString() + " " + time : "not sheduled",

    project = todo.project.name,
    
    colors = [
        "black", "lightgray", "#246fe0", "orange", "crimson"
    ],
    
    style = { 
        padding:'7px 4px', 
        fontSize:'0.8em', 
        textAlign:'left', 
        overflow:'hidden', 
        borderBottom:'1px solid gainsboro' ,
        userSelect:'none'
    },

    checkStyle= {
        color:colors[todo.priority], 
        cursor:'pointer',
        margin:'-2px 10px 0px 0px',
        verticalAlign:'top',
    },

    todoStyle =  { 
        display:'inline-block', 
        width: 'calc(100% - 31px)', 
    },

    textStyle = {
        color: todo.checked ? "gray" : 'black',
        cursor:'pointer',
        textDecoration: todo.checked ? 'line-through' : 'none'
    },

    projectStyle = {
        float:'right', 
        color:'gray', 
        cursor:'pointer',
        display:'inline-block',
        textOverflow: 'ellipsis',
        textAlign:'right',
        overflow:'hidden',
        whiteSpace:'nowrap',
        width:'184px',
    }

    function update() {

        let token = localStorage["token"] || "",
        headers = {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        
        data = {
            priority: todo.priority !== 2 ? 2 : 1
        }

        toggle()

        fetch('https://api.todoist.com/rest/v2/tasks/' + todo.id, { 
                method: 'POST',
                headers : headers,
                body: JSON.stringify(data)
        })

        .then(response => {
            sync()
        })
    }

    function Checkmark() {
        /* if (todo.priority === 4) 
            return <i className="material-icons" style={checkStyle} onClick={update}>cancel</i> */
        
        if (todo.checked) 
            return <i className="material-icons" style={checkStyle} onClick={update}>check_circle</i>
        
        return <i className="material-icons" style={checkStyle} onClick={update}>radio_button_unchecked</i>
    }

    function Content() {
        return (
            <div style={todoStyle}>
                <span onClick={open} style={textStyle}>{text}</span><br/>
                <small style={{color}}>{due}</small>
                <span onClick={browse} style={projectStyle}>{project}</span>
            </div>
        )
    }

    function drag(event) {
        event.dataTransfer.setData("Text", todo.id);
      }

    return (
        <div id={todo.id} style={style} draggable="true" onDragStart={(event) => drag(event)}>
            <Checkmark/><Content/>
        </div>
    )
}