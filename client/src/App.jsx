import React, { useState } from 'react'
import SideBar from './Components/SideBar'
import {Route,Routes,useLocation} from 'react-router-dom'
import ChatBox from './Components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
const App = () => {

  const {user} = useAppContext()

  const [isMenuOpen,setIsMenuOpen] = useState(false)
  const {pathname} = useLocation()

  if(pathname === '/loading') return <Loading />

  return (
    <>
   {!isMenuOpen && (
  <img
    src={assets.menu_icon}
    className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden invert dark:invert-0"
    onClick={() => setIsMenuOpen(true)}
  />
)}

{user?(  <div className = 'dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white'>
        <div className='flex h-screen w-screen'>
        <SideBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/> {/*means “Render SideBar, and give it the current menu state plus the function to update that state.” */}
        <Routes>
          <Route path='/' element = {<ChatBox/>} />
          <Route path='/credits' element = {<Credits/>} />
          <Route path='/community' element = {<Community/>} />

        </Routes>
        </div>
      </div>):(
        <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen'>
          <Login />
        </div>
      )}

    
    </>
  )
}

export default App