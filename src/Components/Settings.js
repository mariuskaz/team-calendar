import { useNavigate } from "react-router-dom"
import { useState } from 'react'
import Teamlist from './Teamlist'
import '../Styles/Dialog.css'

export default function Settings({ todoist, close }) {
  const [showTeamList, setShowTeamList] = useState(false)
  const [showDefaultFolder, setShowDefaultFolder] = useState(false)
  const [defaultFolder, setDefaultFolder] = useState(todoist.project)
  const navigate = useNavigate()

  function handleTodoistSettings() {
    window.open('https://todoist.com/app/settings/account') && close()
  }

  function handleDefaultFolder() {
    todoist.setup(defaultFolder)
    close()
  }

  function DefaultFolder() {
    const projects = todoist.projects.map(project => {
      return <option key={project.id} value={project.id} style={{padding:'5px'}}>{project.name.substring(0,40)}</option>
    })

    return (
      <div className='modal-dialog'>
        <div className='dialog-box'>
          <div className='dialog-title' style={{border:'0'}}>
            <div className='dialog-close-icon' onClick={close} />
            <div className='dialog-caption'>
                <div className='title-big'>Default project</div>
                <div className='subtitle'>for new tasks</div>
            </div>
          </div>
          <div className='dialog-content'>
              <div className='dialog-section'>
                <select className='dialog-select' onChange={(e)=>setDefaultFolder(e.target.value)} value={defaultFolder}>{projects}</select>
              </div>
          </div>
          <div className='dialog-footer'>
            <div className="button button-dark-theme" onClick={handleDefaultFolder}>Apply</div>
            <div className="button" onClick={close}>Cancel</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    {!showTeamList && !showDefaultFolder && <div className='dialog-menu'>
      <div className='dialog-title'>
        <div className='dialog-close-icon' onClick={close} />
        <img className='avatar-big' alt='avatar' src={todoist.user.avatar} />
        <div className='dialog-caption' style={{ padding:'12px' }}>
            <div className='title-bold'>{todoist.user.name}</div>
            <div className='subtitle'>{todoist.user.mail}</div>
        </div>
      </div>
      <div className='dialog-menu-item' onClick={()=>setShowTeamList(true)}><i className='material-icons-outlined'>group</i>My Team</div>
      <div className='dialog-menu-item' onClick={()=>setShowDefaultFolder(true)}><i className='material-icons-outlined'>folder</i>Default project</div>
      <div className='dialog-menu-item' onClick={handleTodoistSettings}><i className='material-icons-outlined'>tune</i>Todoist settings</div>
      <div className='dialog-menu-item' onClick={()=>navigate('/connect')}><i className='material-icons-outlined'>logout</i>Disconnect</div>
    </div>}
    {showTeamList && <Teamlist users={todoist.users} checkout={todoist.checkout} close={close} />}
    {showDefaultFolder && <DefaultFolder close={close} />}
    </>
  )
}
