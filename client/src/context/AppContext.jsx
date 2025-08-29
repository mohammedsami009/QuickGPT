import {createContext,useState,useEffect,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import  {dummyUserData,dummyChats} from '../assets/assets'




const AppContext = createContext()


export const AppContextProvider = ({children}) => {

const navigate = useNavigate()
const [user,setUser] = useState(null);
const [chats,setChats] = useState([]);
const [selectedChat,setSelectedChat] = useState(null);
const [theme,setTheme] = useState(localStorage.getItem('theme')||'light');
const fetchUser = async () =>{
    setUser(dummyUserData) //user data nai hai toh login page dikhayega
}

const fetchUserChats = async ()=>{
    setChats(dummyChats)
    setSelectedChat(dummyChats[0])
}
useEffect(()=>{
    if(theme === 'dark'){
        document.documentElement.classList.add('dark');
    }else{
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme',theme)
},[theme])


useEffect(()=>{
if(user){
    fetchUserChats()
}
else{
    setChats([])
    setSelectedChat(null)
}
},[user])

useEffect(()=>{
    fetchUser()
},[])

    const value = {
        navigate, user, setUser, fetchUser, chats, setChats,selectedChat,setSelectedChat,theme,setTheme
    }
    return (
        <AppContext.Provider value={value}>
            {children}
            
        </AppContext.Provider>
    )
}
export const useAppContext = ()=> useContext(AppContext)

//useContext(AppContext) → lets you access those values anywhere


//createContext() → creates a global storage.

// AppContextProvider → wraps your app and provides values.