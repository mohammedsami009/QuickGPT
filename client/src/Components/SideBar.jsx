import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
// Remove react-toastify import - assuming toast is available globally

const SideBar = ({isMenuOpen,setIsMenuOpen}) => {
  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, setToken, token } = useAppContext() // Removed fetchUsersChats
  const [search, setSearch] = useState('')

  const logout = ()=>{
    localStorage.removeItem('token')
    setToken(null)
    alert('Logged out successfully')
  }

  const deleteChat = async(e, chatId) => {
    try {
      e.stopPropagation()
      const confirmDelete = window.confirm('Are you sure you want to delete this chat?')
      if(!confirmDelete) return 
      
      console.log('🗑️ Starting deletion process...')
      console.log('🎯 Chat ID to delete:', chatId)
      console.log('🔑 Token from context:', token)
      console.log('🏪 Token from localStorage:', localStorage.getItem('token'))
      
      // Use token from localStorage as fallback
      const authToken = token || localStorage.getItem('token')
      
      if (!authToken) {
        console.error('❌ No authentication token found!')
        alert('No authentication token found. Please login again.')
        return
      }
      
      console.log('🚀 Making request with token:', authToken)
      
      const response = await axios.post('/api/chat/delete', 
        { chatId }, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )
      
      console.log('📨 Full response object:', response)
      console.log('📋 Response data:', response.data)
      console.log('🔢 Response status:', response.status)
      
      const { data } = response
      
      if(data.success){
        console.log('✅ Backend confirmed deletion success!')
        console.log('📝 Success message:', data.message)
        
        // Update local state
        setChats(prev => {
          const updated = prev.filter(chat => chat._id !== chatId)
          console.log('🔄 Updated chats array:', updated)
          return updated
        })
        
        alert('Chat deleted successfully!')
      } else {
        console.error('❌ Backend returned success: false')
        console.error('📝 Error message:', data.message)
        alert(data.message || 'Failed to delete chat')
      }
    } catch (error) {
      console.error('💥 Caught error during deletion:', error)
      console.error('📊 Error name:', error.name)
      console.error('📝 Error message:', error.message)
      console.error('🌐 Network error:', error.code)
      
      if (error.response) {
        console.error('📡 Response status:', error.response.status)
        console.error('📡 Response headers:', error.response.headers)
        console.error('📡 Response data:', error.response.data)
        
        if (error.response.status === 404) {
          alert('Delete endpoint not found. Check your backend routes.')
        } else if (error.response.status === 401) {
          alert('Authentication failed. Please login again.')
        } else {
          alert(error.response.data?.message || 'Server error occurred')
        }
      } else if (error.request) {
        console.error('📡 No response received:', error.request)
        alert('No response from server. Check your connection.')
      } else {
        console.error('⚙️ Request setup error:', error.message)
        alert('Request failed: ' + error.message)
      }
    }
  }

  return (
    <div className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-10 ${!isMenuOpen && 'max-md:-translate-x-full'} `}>
      
      {/* Logo */}
      <img 
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} 
        alt="logo" 
        className='w-full max-w-48'
      />
     
      {/* New chat button */}
      <button onClick={createNewChat} className='flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer'>
        <span className='mr-2 text-xl'>+</span> New Chat
      </button>

      {/* Search bar */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img 
          src={assets.search_icon} 
          alt="search icon" 
          className="w-5 h-5 invert dark:invert-0"
        />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversations"
          className="text-xs placeholder:text-gray-400 outline-none flex-1 bg-transparent"
        />
      </div>

      {/* Recent chats */}
      {chats.length > 0 && <p className='mt-4 text-sm'>Recent Chats</p>}
      
      <div className='flex-1 overflow-y-scroll mt-3 text-sm space-y-3'>
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div 
              key={chat._id} 
              onClick={()=> {navigate('/'); setSelectedChat(chat);setIsMenuOpen(false)}}
              className='p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group'
            >
              <div>
                <p className='truncate w-full'>
                  {chat.messages.length > 0 ? chat.messages[0].content.slice(0, 32) : chat.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-[#B1A6C0]'>
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              <img  
                src={assets.bin_icon}
                className="w-4 h-4 cursor-pointer invert dark:invert-0 invisible group-hover:visible transition-all duration-200 ml-2 flex-shrink-0"
                alt="delete"
                onClick={(e) => deleteChat(e, chat._id)} // Simplified click handler
              />
            </div>
          ))}
      </div>

      {/*Community images */}
      <div onClick={()=>{navigate('/community');setIsMenuOpen(false)}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all'>
        <img src={assets.gallery_icon} className='w-[18px] h-[18px] invert dark:invert-0' alt="" />
        <div className='flex flex-col text-sm'>
          <p>Community Images</p>
        </div>
      </div>

      {/*Credit purchase option*/}
      <div onClick={()=>{navigate('/credits');setIsMenuOpen(false)}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all'>
        <img src={assets.diamond_icon} className='w-4.5 dark:invert' alt="" />
        <div className='flex flex-col text-sm'>
          <p>Credits : {user?.credits}</p>
          <p className='text-xs text-gray-400'>Purchase credits to use quickgpt</p>
        </div>
      </div>

      {/*Dark Mode Toggle */}
      <div className='flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md '>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className='w-[18px] h-[18px] invert dark:invert-0' alt="" />
          <p>Dark Mode</p>
        </div>
        <label className='relative inline-flex cursor-pointer'>
          <input onChange={()=> setTheme(theme === 'dark'? 'light':'dark')} type="checkbox" className='sr-only peer' checked={theme === 'dark'} />
          <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all'></div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'></span>
        </label>
      </div>

      {/* User account */}
      <div className='flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group'>
        <img src={assets.user_icon} className='w-7 rounded-full' alt="" />
        <p className='flex-1 text-sm dark:text-primary truncate'>{user? user.name:'Login your account'}</p>
        {user && <img onClick={logout} src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block'/>}
      </div>

      <img onClick={()=> setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert' alt="" />
    </div>
  )
}

export default SideBar