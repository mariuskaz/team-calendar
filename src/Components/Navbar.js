import '../Styles/Navbar.css'
import { useState } from 'react'
import Settings from './Settings'

export default function Navbar({ toggleSidebar, todoist }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className='navbar'>
        <i className='menu-icon' onClick={toggleSidebar}></i>
        <div className='right'>
          {todoist.synced && <div className='small'>Last sync<br/>{ new Date().toLocaleTimeString() }</div>}
          {todoist.user.avatar && <img className='avatar' alt='avatar' src={todoist.user.avatar} onClick={()=>setVisible(true)} />}
        </div>
        {visible && <Settings todoist={todoist} close={()=>setVisible(false)} />}
      </div>
  )
}
