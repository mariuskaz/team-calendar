import '../Styles/Sidebar.css'
import { Link } from "react-router-dom"
import { useRef, useEffect, useState } from 'react'

export default function Sidebar({ toggle }) {
  const [ hidden, setHidden ] = useState(false)
  const sidebar = useRef()

  const small = window.innerWidth < 400 ? true : false
  const className = hidden ? 'sidebar hidden' : 'sidebar'

  useEffect(() => {
    if (small) setHidden(true)
    if (toggle > 0) setHidden(b => !b)
  }, [toggle, small]);

  function handleSidebar() {
    if (small && !hidden) setHidden(true)
  }
  
  return (
    <div className={className} ref={sidebar} onClick={handleSidebar} >
      <div className='sidebar-section'>Calendar</div>
      <Link to="/today"><p><i className="material-icons">event</i>Today</p></Link>
      <Link to="/calendar"><p><i className="material-icons">calendar_month</i>Calendar</p></Link>
      <Link to="/unscheduled"><p><i className="material-icons">inbox</i>Not scheduled</p></Link>
      <div className='sidebar-section' />
      <div className='sidebar-section'>My Team</div>
      <Link to="/calendar"><p><i className="material-icons">account_circle</i>Person</p></Link>
    </div>
  )
}
