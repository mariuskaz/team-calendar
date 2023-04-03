import '../Styles/Dialog.css'
export default function Teamlist({ users, checkout, close }) {

    function CheckBox({value}) {
        return <input 
                type='checkbox' 
                className='dialog-checkbox-right' 
                checked={value} 
                readOnly />
    }

    function ListItem({ id, name, mail, avatar, checked }) {
        return (
            <div className='dialog-menu-item' key={id} onClick={()=>checkout(id)}>
                <CheckBox value={checked} />
                <img className='avatar-medium' alt='avatar' src={avatar} />
                <div className='dialog-caption'>
                    <div className='dialog-text'>{name}</div>
                    <div className='subtitle'>{mail}</div>
                </div>
            </div>
        )
    }

    const TeamList = users.slice(1)
        .map(user => {
            return <ListItem 
                key={user.id} 
                id={user.id}
                name={user.name} 
                mail={user.mail} 
                avatar={user.avatar} 
                checked={user.checked} />
        })
    
    return (
        <div className='dialog-box'>
            <div className='dialog-title'>
                <div className='dialog-close-icon' onClick={close} />
                <div className='dialog-caption'>
                    <div className='title-big'>My Team</div>
                    <div className='subtitle'>customize team list</div>
                </div>
            </div>
            <div className='dialog-content'>
                {TeamList}
            </div>
        </div>
    )
}
