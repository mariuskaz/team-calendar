import { useState, useRef, memo } from 'react'

function QuickTodo({ due, push }) {
  const [ active, setActive ] = useState(false)
  const [ value, setValue ] = useState("")
  const [ position, setPosition ] = useState(0)
  const input = useRef()

  function handleInput(event) {
    if (event.key === "Enter") {
      pushTask()
    } else if (event.key === "Escape") {
      setActive(false)
    } else {
      setValue(event.target.value)
      setPosition(event.target.selectionStart)
    }
  }

  function pushTask() {
    const todo = input.current.value
    push(todo, due)
    setActive(false)
    setValue("")
  }

  function InputBox() {
    if (active || value.length > 0) return (
      <div>
        <textarea 
          rows="4"
          className ="input-box" 
          onKeyDownCapture={(e) => handleInput(e)} 
          onChange={(e) => handleInput(e)} 
          onBlur={() => setActive(false)}
          onFocus={(e) => e.target.selectionStart = position}
          value={value}
          ref={input} autoFocus/>

        <div 
          className="button button-dark-theme" 
          onMouseDown={pushTask}>Save</div>

        <div 
          className="button" 
          onMouseDown={() => setValue("")}>Cancel</div>

      </div>
    )

    return  (
      <div 
        className ="inline-button black"
        onClick={()=>setActive(true)}>
          <i className="material-icons black">add</i>
          <span>Add task</span>
      </div>
    )
  }

  return <InputBox/>

}

export default memo(QuickTodo)