import '../Styles/Settings.css'
import { useNavigate } from "react-router-dom"

export default function Settings({ todoist, hide }) {
  const navigate = useNavigate()
  //<i className="material-icons settings-right" onClick={hide}>close</i>
  return (
    <div className='settings-popup'>
      <div className='settings-section'>
        <i className="material-icons settings-right" onClick={hide}>close</i>
        <img className='avatar-big' alt='avatar' src={todoist.user.avatar} />
        <div className='settings-card'>
            <span>{todoist.user.name}</span><br/>
            <small>{todoist.user.mail}</small>
        </div>
      </div>
      <div className='settings-menu-item' onClick={hide}><i className='material-icons-outlined'>group</i>Customize My Team</div>
      <div className='settings-menu-item' onClick={()=>navigate('/connect')}><i className='material-icons-outlined'>logout</i>Disconnect</div>
    </div>
  )
}
