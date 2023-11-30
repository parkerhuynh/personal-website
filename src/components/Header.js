import Navbar_login from './Navbar_login';
import Navbar_nologin from './Navbar_nologin';
import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
const Header = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [rightInfo, setRightInfo] = useState(true);

  const USERNAME = "ndhuynh"
  const PASSWORD = "12341234"

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedLoggedIn === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setRightInfo(true)

    localStorage.setItem('isLoggedIn', 'true');
    if (username === USERNAME && password === PASSWORD) {
      setLoggedIn(true);
    } else {
      setRightInfo(false)
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  const handleLogout = () => {
    setUsername("")
    setPassword("")
    localStorage.setItem('isLoggedIn', 'false');

    setLoggedIn(false);
  };


  return (
    <div>
      <div class="bg-dark">
      </div>
      <header>
        <div className="nav-area bg-dark">
          <Link to="/" className="logo text-light">
            Ngoc Dung Huynh
          </Link>
          {loggedIn ? (<Navbar_login />) : (<Navbar_nologin />)}

        </div>

      </header>

    </div>

  );
};

export default Header;