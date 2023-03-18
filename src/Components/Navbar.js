import '../Styles/Navbar.css'
import '../Styles/Dots.css'
import { useNavigate, useSearchParams } from "react-router-dom"

export default function Navbar({ toggleSidebar, todoist }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  function search(event) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.target.blur()
      const uid = searchParams.get('uid')
      let params = 'search=' + encodeURI(event.target.value)
      if (uid !== null) params += '&uid=' + uid 
      navigate(`/results?${params}`)
      event.target.value = ""
    }
  }

  return (
    <div className='navbar'>
        <i className='menu-icon' onClick={toggleSidebar}></i>
        <input className='search-box' type='search' placeholder='search' onKeyDown={search} />
        {!todoist.synced && <div className='dot-pulse'/>}
        <div className='right'>
          {todoist.synced && <div className='small'>Last sync<br/><b>{ new Date().toLocaleTimeString() }</b></div>}
          {todoist.user.avatar && <img className='avatar' alt='avatar' src={todoist.user.avatar} onClick={()=>navigate('/connect')} />}
        </div>
      </div>
  )
}
