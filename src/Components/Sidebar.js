import '../Styles/Sidebar.css'
import { Link } from "react-router-dom"
import { useRef, useEffect, useState } from 'react'

export default function Sidebar({ toggle, todoist }) {
  const [ hidden, setHidden ] = useState(false)
  const sidebar = useRef()

  const small = window.innerWidth < 800
  const portrait = window.innerWidth < window.innerHeight
  const className = hidden ? 'sidebar hidden' : 'sidebar'

  useEffect(() => {
    if (small || portrait) setHidden(true)
    if (toggle > 0) setHidden(b => !b)
  }, [toggle, small, portrait]);

  function handleSidebar() {
    if (small || portrait) setHidden(true)
  }
  
  return (
    <div className={className} ref={sidebar} onClick={handleSidebar} >
      <div className='sidebar-section'>Calendar</div>
      <Link to="/today"><p><i className="material-icons">event</i>Today</p></Link>
      <Link to="/calendar"><p><i className="material-icons">calendar_month</i>Calendar</p></Link>
      <Link to="/unscheduled"><p><i className="material-icons">inbox</i>Not scheduled</p></Link>
      <div className='sidebar-section' />
      <div className='sidebar-section'>My Team</div>
      <Link to="/calendar"><p><i className="material-icons">account_circle</i>{todoist.userName}</p></Link>
    </div>
  )
}
