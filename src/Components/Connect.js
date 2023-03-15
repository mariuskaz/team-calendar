import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Connect() {

	const input = useRef()
	const navigate = useNavigate()

	function connect() {
		localStorage.setItem("token", input.current.value)
		navigate('/today')
	}

  	return (
    	<div style={{height:'300px', width: '310px', margin:'auto', marginTop: '50px'}}>
        	<h3 style={{color:'gray', marginBottom:'30px', fontWeight:'normal', fontFamily:'Calibri', fontSize:'16pt'}}> Connect to Todoist with <br/>personal token </h3>
			<img style={{verticalAlign: 'bottom'}} src='logo.png' alt='logo' height='32px' />
			<a href='https://todoist.com' style={{color:'gray', fontSize:'16pt', margin:'7px', height:'32px'}}>todoist</a><br/>
			<div style={{marginTop:'50px'}}>
				<label style={{fontWeight:'bold'}}>API token</label><br/>
				<input style={{margin:'10px 0px', padding:'8px 5px', width:'300px', outline:'none', border:'1px solid lightgray'}} type="text" ref={input} /><br/>
				<div className="button button-dark-theme" onClick={connect}>Connect</div>
        		<div className="button">Cancel</div>
				<div style={{margin:'60px 0', padding:'10px', fontSize:'9pt', background:'whitesmoke'}}>Get your token from <a style={{color:'DeepSkyBlue'}} href='https://todoist.com/app/settings/integrations/developer' target='_blank' rel="noreferrer">Todoist integrations</a></div>
			</div>
    	</div>
  	)
}
