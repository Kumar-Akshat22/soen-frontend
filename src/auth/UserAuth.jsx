import React, {useContext, useEffect, useState} from 'react'
import {userContext} from '../context/UserContext'
import { useNavigate } from 'react-router-dom';

const UserAuth = ({children}) => {

    const {user } = useContext(userContext);
    const [loading , setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(()=>{

        if(user){

            setLoading(false);
        }

        if(!user || !token){

            navigate('/login')
        }


    }, [])

    if(loading){

        return <div>Loading....</div>
    }


  return (
    <>
        {children}
    </>
  )
}

export default UserAuth