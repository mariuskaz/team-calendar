import '../Styles/Navbar.css'
import '../Styles/Dots.css'
import { useNavigate, useSearchParams } from "react-router-dom"
import { useState } from 'react'
import Settings from './Settings'

export default function Navbar({ toggleSidebar, todoist }) {
  const [visible, setVisible] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  function search(event) {
    if (event.key === "Enter") {
      event.target.blur()
      let uid = searchParams.get('uid'),
      params = 'search=' + encodeURI(event.target.value)
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
          {todoist.synced && <div className='small'>Last sync<br/>{ new Date().toLocaleTimeString() }</div>}
          {todoist.user.avatar && <img className='avatar' alt='avatar' src={todoist.user.avatar} onClick={()=>setVisible(true)} />}
        </div>
        {visible && <Settings todoist={todoist} close={()=>setVisible(false)} />}
      </div>
  )
}
