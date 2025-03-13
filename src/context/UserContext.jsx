import React, { Children, createContext, useState } from 'react'

// Create a Context
export const userContext = createContext()


const UserContext = ({children}) => {

    const [user , setUser] = useState(null);
  return (
    
    <userContext.Provider value={{user , setUser}}>
        {children}
    </userContext.Provider>
  )
}

export default UserContext