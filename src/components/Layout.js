import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuth } from "./AuthContext"
import axios from 'axios'
import Navbar_login from './Navbar_login';
import Navbar_nologin from './Navbar_nologin';
import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
const Layout = () => {
  const { currentUser, logout } = useAuth()
  const [userInfo, setUserInfo] = useState({})


  async function handleLogout(e) {
    e.preventDefault()
    await logout()
  }

  useEffect(() => {
    getUserInfo();
  }, []);
  const getUserInfo = async () => {
    if (currentUser != null) {
      const response = await axios.get('/get_user_info/' + currentUser.email);
      setUserInfo(response.data)
    }
  };
 
  return (
    <div>
      <div class="d-flex bg-dark justify-content-between">
        <div>
          <div className="nav-area bg-dark">
            <div class="d-flex">
              <Link to="/" className="logo text-light">
                Ngoc Dung Huynh
              </Link>
              {currentUser === null ? (
                <div >
                  <div>
                    <Navbar_nologin />
                  </div>
                  <div class="align-self-center">

                  </div>
                </div>
              ) : (<Navbar_login />)}
            </div>
          </div>
        </div>
        
        <div class="align-self-center mx-5">
        {currentUser === null ? (
        <div>
          <Link to="login" class="text-light text-decoration-none mx-2" > Login</Link>
          <Link to="signup" class="text-light text-decoration-none mx-2" > Signup</Link>
          </div>
          ) :(
          <div class="mx-2 d-flex flex-row">
            <p class="text-light text-decoration-none mx-2 my-0">Welcome, {userInfo.username}!</p>
            <Link onClick={handleLogout} class="text-light text-decoration-none mx-2" > Logout</Link>
            </div>
          )}
          
        </div>
      </div>
      <div >
        <Outlet />
      </div>
      {/* <div class="bg-dark" style={{ height: "100px" }}></div> */}
    </div>

  );
};

export default Layout;