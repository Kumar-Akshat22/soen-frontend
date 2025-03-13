import React , { useState,useContext } from "react";
import { Link , Navigate, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { userContext } from "../context/UserContext";

const Register = () => {

    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');
    const { setUser } = useContext(userContext);

    const navigate = useNavigate();

    function submitHandler(e){

        e.preventDefault();

        axios.post('/users/register' , {
            email,
            password
        })
        .then((res)=>{

            localStorage.setItem("token" , res.data.token);
            setUser(res.data.user);
            navigate('/')
            
        })
        .catch((err)=>{

            console.log(err.message);
        })

    }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Create your Account</h2>
    <div className="max-w-md shadow-lg rounded-2xl bg-[#1b2534] p-6 mx-auto">
      <form className="" onSubmit={(e)=>{
        submitHandler(e)
      }}>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your email
          </label>
          <input
          onChange={(e)=>{
            setEmail(e.target.value)
          }}
          value={email}
            type="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="name@flowbite.com"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Your password
          </label>
          <input
          onChange={(e)=>{
            setPassword(e.target.value)
          }}
          value={password}
            type="password"
            id="password"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="text-white cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Sign up
        </button>

        <div>
        <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? {" "}
            <Link to="/login" className="text-[#fafcff] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Register;
