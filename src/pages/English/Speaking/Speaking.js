
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import OpenAI from 'openai';
import ReactLoading from 'react-loading';
import axios from 'axios';
import { ordinalToNumber } from "./ordinalToNumber"
import { wordToNumber } from "./wordToNumber"
import { useSpeakingData } from './useSpeakingData.js';
import YourPara from "./YourPara.js"

const MICSIZE = 50
const IMG_MIC_SIZE = MICSIZE * .8

function App() {
  const { currentUser } = useAuth();
  const { userInfo, PersonalParagraph, SetPersonalParagraph, fetchUserData, isLoading } = useSpeakingData(currentUser);
  const [option, setOption] = useState("your")
  const [para, setPara] = useState("")


  const handleOption = (event) => {
    const value = event.target.value 
    setOption(value)
  };




  return (
    <div className={'background-image-repeat'}>
      <div className="container">
        {/* --------------------------------------------------------------------------------------- */}
        {!currentUser ? (
          <div className="pt-5 text-center">
            <h1 className="text-danger pb-5">Warning!</h1>
            <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
            <h5 className="text-light"> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
          </div>
        ) : (
          <div class="text-light">
            <h1 class="text-center py-5">Speaking</h1>
            {/* --------------------------------------------------------------------------------------- */}
            <div class="d-flex justify-content-end " >
              <div class="col-2 ">
                <select
                  class="form-select form-select-sm text-center"
                  aria-label=".form-select-sm example"
                  value={option}
                  onChange={handleOption}
                >
                  <option value="your">Your Paragraph</option>
                  <option value="our">Our Paragraph</option>
                </select>
              </div>
            </div>

            {/* --------------------------------------------------------------------------------------- */}
            <div>
              {option === "your" ? (
                <div class="row my-3">
                  <YourPara para={para}
                  setPara={setPara}/>
                </div>
              ) : (null)}
            </div>


          </div>
        )}
      </div>

    </div>
  );
}

export default App;