import 'material-icons/iconfont/material-icons.css';
import './Styles/App.css';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import useTodoist from './Hooks/useTodoist';

export default function App() {
  const [toggle, setToggle] = useState(0)
  const [week, setWeek] = useState(0)
  const [today, setToday] = useState(true)
  const todoist = useTodoist()
  const listview =  useRef()
  const scroll = useRef({})

  const location = useLocation()
  const view = location.pathname

  useEffect(() => {
    if (!todoist.synced) todoist.sync()
  }, [todoist])

  useLayoutEffect(() => {
    const today_section = document.getElementsByClassName('today-section')[0]
    listview.current.style.scrollBehavior = 'smooth'
    listview.current.scrollTop = today_section?.offsetTop - 160 || 0
  }, [today])

  useLayoutEffect(() => {
    listview.current.style.scrollBehavior = 'auto'
    listview.current.scrollTop = scroll.current[view] || 0
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  })

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') todoist.sync()
  }

  function handleScroll(e) {
    scroll.current = { ...scroll.current, [view]:e.target.scrollTop }
  }

  function showToday() {
    setWeek(0)
    setToday(!today)
  }

  return (
    <>
      <Navbar
        todoist={todoist}
        toggleSidebar={()=>setToggle(n => n + 1)} />

      <Sidebar 
        toggle={toggle} 
        todoist={todoist} />

      <main ref={listview} onScroll={handleScroll}>
        <Outlet context={[todoist, week, setWeek, showToday]} />
      </main>
    </>
  )
}
