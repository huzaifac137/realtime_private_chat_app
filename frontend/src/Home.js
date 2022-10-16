import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Chat from './Chat';
import { io } from 'socket.io-client';
import authContext from './CONTEXT/AuthContext';

function Home() {

    const navigate = useNavigate();

  const[showChat , setShowChat] = useState(false);
  const[ERROR ,setError] = useState(null);
  const[USERS , setUsers]=useState([]);
  const[selectedUsername , setSelectedUsername] = useState(null);
  const[selectedUserId , setSelectedUserId] = useState(null);
  const[onlineUsers , setOnlineUsers] = useState([]);

  const socket = useRef();
 const ctx = useContext(authContext);

  const getUsers=async()=>
  {
    let responseData;
    try
    {
       const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users` ,{
        headers : {
          token : ctx.token
        }
       });

       responseData = await response.json();

       if(response.status!==200)
       {
        throw new Error(responseData.message);
       }

       setUsers(responseData.users);
    }

    catch(err)
    {
       setError(err.message);
    }

  }


  useEffect(()=>{
    getUsers();
  },[]);

  useEffect(()=>{
                  
    socket.current = io(`${process.env.REACT_APP_SERVER_URL}`);
    socket.current.emit("add-user" , ctx.userId);

    socket.current.on("online-users" ,(users)=>{
                   
      setOnlineUsers(users);

     });

 },[]);

  const handleClick=(userId ,username )=>
  {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setShowChat((prev)=>!prev);
  }


  return (
     <div className='totalContainer'>

    <div className='userContainer'>

      {ERROR && <h2> {ERROR} </h2>}
        {USERS.map((item)=> item.id!==ctx.userId &&  <div key={item.id} className="user" onClick={()=>handleClick( item.id,item.username )}> 

           <h3>{item.username}</h3> 
           <h4>  {  onlineUsers.some((user)=>user===item.id)? "online" : " offline"} </h4> 

         </div> )}   


    </div>
    {showChat===true &&  <Chat socket={socket} selectedUserId={selectedUserId} selectedUsername ={selectedUsername} />  }
    </div>
  );
}

export default Home;
