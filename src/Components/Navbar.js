import '../Styles/Navbar.css'
import '../Styles/Dots.css'
import { useState } from 'react'
import Settings from './Settings'

export default function Navbar({ toggleSidebar, toggle, todoist }) {
  const [visible, setVisible] = useState(false)

  const margin = toggle % 2 === 0 ? "55%" : "49%"
  const style= { marginLeft: margin }

  return (
    <div className='navbar'>
        <i className='menu-icon' onClick={toggleSidebar}></i>
        {!todoist.synced && <div className='dot-pulse' style={style}/>}
        <div className='right'>
          {todoist.synced && <div className='small'>Last sync<br/>{ new Date().toLocaleTimeString() }</div>}
          {todoist.user.avatar && <img className='avatar' alt='avatar' src={todoist.user.avatar} onClick={()=>setVisible(true)} />}
        </div>
        {visible && <Settings todoist={todoist} close={()=>setVisible(false)} />}
      </div>
  )
}
