import 'material-icons/iconfont/material-icons.css';
import './Styles/App.css';

import { useState, useEffect, useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import useTodoist from './Hooks/useTodoist';

export default function App() {
  const [toggle, setToggle] = useState(0)
  const todoist = useTodoist()

  useEffect( () => {
    if (!todoist.synced) todoist.sync()
  }, [todoist])

  useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  })

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') todoist.sync()
  }

  return (
    <>
      <Navbar
        todoist={todoist}
        toggleSidebar={()=>setToggle(n => n + 1)} />

      <Sidebar 
        toggle={toggle} />

      <div className='main'>
        <Outlet context={[todoist]} />
      </div>
    </>
  )
}
