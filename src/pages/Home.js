import React from 'react';
import { GeoAlt } from 'react-bootstrap-icons';
import { FiMail } from 'react-icons/fi';
import { FaPhone } from 'react-icons/fa';
import backgroundImg from "../background.jpg";

function Home() {
  return (
    <div style={{height: "100vh", width: "100%", backgroundImage: `url(${backgroundImg})`, "background-size": "cover",
    "background-position": "center"}}>
      <div className="container" >
        {/* Content here */}
      </div>
    </div>
  );
}

export default Home;