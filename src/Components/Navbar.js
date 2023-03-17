import '../Styles/Navbar.css'
import '../Styles/Dots.css'
import { useNavigate } from "react-router-dom"

export default function Navbar({ toggleSidebar, todoist }) {
  const navigate = useNavigate()

  function search(event) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.target.blur()
      navigate('/results?search=' + encodeURI(event.target.value))
      event.target.value = ""
    }
  }

  return (
    <div className='navbar'>
        <i className='menu-icon' onClick={toggleSidebar}></i>
        <input className='search-box' type='search' placeholder='Search' onKeyDown={search} />
        {!todoist.synced && <div className='dot-pulse'/>}
        <div className='right'>
          {todoist.synced && <div className='small'>Last sync<br/><b>{ new Date().toLocaleTimeString() }</b></div>}
          {todoist.user.avatar && <img className='avatar' alt='avatar' src={todoist.user.avatar} onClick={()=>navigate('/connect')} />}
        </div>
      </div>
  )
}
