import '../Styles/Sidebar.css'
import { NavLink, Link } from "react-router-dom"
import { useRef, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from "react-router-dom"

export default function Sidebar({ toggle, todoist }) {
  const [ hidden, setHidden ] = useState(false)
  const [searchParams] = useSearchParams()
  const sidebar = useRef()

  const location = useLocation()
  const url = location.pathname
  const userId = searchParams.get('user') || 'none'

  const small = window.innerWidth < 800
  const portrait = window.innerWidth < window.innerHeight
  const className = hidden ? 'sidebar hidden' : 'sidebar'

  useEffect(() => {
    if (small || portrait) setHidden(true)
  }, [small, portrait]);

  useEffect(() => {
    if (toggle > 0) setHidden(b => !b)
  }, [toggle]);

  function handleSidebar() {
    if (small || portrait) setHidden(true)
  }

  function User({ id, name }) {
    const link = `${url}?user=${id}`
    const currentUser = userId === 'none' && id === todoist.user.id
    const active = userId === id || currentUser  ? 'active' : ''

    return (
      <Link className={active} to={link}>
        <p><i className="material-icons-outlined">person</i>{name}</p>
      </Link>
    )
  }
  
  return (
    <div className={className} ref={sidebar} onClick={handleSidebar} >
      <div className='sidebar-section'>Calendar</div>
      <NavLink to="/today"><p><i className="material-icons-outlined">event</i>Today</p></NavLink>
      <NavLink to="/calendar"><p><i className="material-icons-outlined">calendar_month</i>Calendar</p></NavLink>
      <NavLink to="/unscheduled"><p><i className="material-icons-outlined">inbox</i>Not scheduled</p></NavLink>
      <div className='sidebar-section' />
      <div className='sidebar-section'>My Team</div>
      {todoist.team.slice(0, 8).map(user => <User key={user.id} id={user.id} name={user.full_name} />)}
    </div>
  )
}
