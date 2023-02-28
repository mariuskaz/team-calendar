import '../Styles/Navbar.css'
import '../Styles/Dots.css'
import { useNavigate } from "react-router-dom"

export default function Navbar({ toggleSidebar, todoist }) {
  const navigate = useNavigate()
  return (
    <div className='navbar'>
        <i className='material-icons-sharp app-menu-icon' onClick={toggleSidebar}>menu</i>
        {!todoist.synced && <div className='dot-pulse'/>}
        <div className='right'>
          {todoist.synced && <div className='small'>Last sync<br/><b>{ new Date().toLocaleTimeString() }</b></div>}
          {todoist.avatar && <img className='avatar' alt='avatar' src={todoist.avatar} onClick={()=>navigate('/connect')} />}
        </div>
      </div>
  )
}
