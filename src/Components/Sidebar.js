import '../Styles/Sidebar.css'
import { NavLink, Link } from "react-router-dom"
import { useRef, useEffect, useState } from 'react'
import { useLocation, useSearchParams, useNavigate } from "react-router-dom"

export default function Sidebar({ toggle, todoist }) {
  const [ hidden, setHidden ] = useState(false)
  const [ searchParams ] = useSearchParams()
  const sidebar = useRef()
  const navigate = useNavigate()

  const location = useLocation()
  const url = location.pathname
  const userId = searchParams.get('uid')
  const searchText = searchParams.get('search')

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
    if (document.activeElement.type !== 'search' && (small || portrait)) setHidden(true)
  }

  function User({ id, name }) {
    const params = searchText ? `search=${searchText}&uid=${id}` : `uid=${id}`
    const link = `${url}?${params}`
    const currentUser = userId === null && id === todoist.users[0]?.id
    const active = userId === id || currentUser  ? 'active' : ''

    return (
      <Link className={active} to={link}>
        <p className='sidebar-item'><i className="material-icons-outlined">person</i>{name}</p>
      </Link>
    )
  }

  const today = userId !== null ? `/today?uid=${userId}` : '/today'
  const calendar = userId !== null ? `/calendar?uid=${userId}` : '/calendar'
  const unscheduled = userId !== null ? `/unscheduled?uid=${userId}` : '/unscheduled'

  function search(event) {
    if (event.key === "Enter") {
      event.target.blur()
      let uid = searchParams.get('uid'),
      params = 'search=' + encodeURI(event.target.value)
      if (uid !== null) params += '&uid=' + uid 
      navigate(`/results?${params}`)
      event.target.value = ""
      handleSidebar()
    }
  }
  
  return (
    <div className={className} ref={sidebar} onClick={handleSidebar} >
      <input className='search-box' type='search' placeholder='search' onKeyDown={search} />
      <div className='sidebar-section'>Calendar</div>
      <NavLink to={today}><p className='sidebar-item'><i className="material-icons-outlined">event</i>Today</p></NavLink>
      <NavLink to={calendar}><p className='sidebar-item'><i className="material-icons-outlined">calendar_month</i>Calendar</p></NavLink>
      <NavLink to={unscheduled}><p className='sidebar-item'><i className="material-icons-outlined">inbox</i>Not scheduled</p></NavLink>
      <div className='sidebar-section' />
      <div className='sidebar-section'>My Team</div>
      {todoist.users.filter(user => user.checked).map(user => <User key={user.id} id={user.id} name={user.name} />)}
    </div>
  )
}
