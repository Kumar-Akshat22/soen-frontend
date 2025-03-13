import React from "react";
import { AppRoutes } from "./routes/AppRoutes";
import UserContext from "./context/UserContext";

const App = () => {
  return (
  
    <div className="h-screen flex items-center">
      
      <UserContext>
        
        <AppRoutes />

      </UserContext>

    </div>
)};

export default App;
