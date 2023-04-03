import { useNavigate } from "react-router-dom"
import { useState } from 'react'
import Teamlist from './Teamlist'
import '../Styles/Dialog.css'

export default function Settings({ todoist, close }) {
  const [showTeamList, setShowTeamList] = useState(false)
  const navigate = useNavigate()

  function handleTodoistSettings() {
    window.open('https://todoist.com/app/settings/account')
    close()
  }

  function handleDefaultProject() {
    //alert('Default folder: Inbox')
    close()
  }

  return (
    <>
    {!showTeamList && <div className='dialog-menu'>
      <div className='dialog-title'>
        <div className='dialog-close-icon' onClick={close} />
        <img className='avatar-big' alt='avatar' src={todoist.user.avatar} />
        <div className='dialog-caption' style={{ padding:'12px' }}>
            <div className='title-bold'>{todoist.user.name}</div>
            <div className='subtitle'>{todoist.user.mail}</div>
        </div>
      </div>
      <div className='dialog-menu-item' onClick={()=>setShowTeamList(true)}><i className='material-icons-outlined'>group</i>My Team</div>
      <div className='dialog-menu-item' onClick={handleDefaultProject}><i className='material-icons-outlined'>folder</i>Default project</div>
      <div className='dialog-menu-item' onClick={handleTodoistSettings}><i className='material-icons-outlined'>tune</i>Todoist settings</div>
      <div className='dialog-menu-item' onClick={()=>navigate('/connect')}><i className='material-icons-outlined'>logout</i>Disconnect</div>
    </div>}
    {showTeamList && <Teamlist users={todoist.users} checkout={todoist.checkout} close={close} />}
    </>
  )
}
