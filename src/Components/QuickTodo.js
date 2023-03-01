import { useState, useRef, memo } from 'react'

function QuickTodo({ due, sync }) {
  const [ active, setActive] = useState(false)
  const input = useRef()

  function handleInput(event) {
    if (event.key === "Enter") {
      pushTask()
    } else if (event.key === "Escape") {
      setActive(false)
    } 
  }

  function pushTask() {
    let task = { content: input.current.value, due_string: due || "" },
    token = localStorage["todoist.token"] || "none",
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

    setActive(false)
  }

  function InputBox() {
    if (active) return (
      <div>
        <textarea rows="4"
          className ="input-box" 
          placeholder="Type task description" 
          onKeyDownCapture={(e) => handleInput(e)} 
          onBlur={() => setActive(false)}
          ref={input} autoFocus/>
        <div className="button button-dark-theme" 
          onMouseDown={pushTask}>Save</div>
        <div className="button">Cancel</div>
      </div>
    )
    return <p className ="inline-button" onClick={()=>setActive(true)}><i className="material-icons">add</i>Add task</p>
  }

  return <InputBox/>

}

export default memo(QuickTodo)