
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../components/AuthContext.js';
import ReactLoading from 'react-loading';
import axios from 'axios';
import { SpeakingParaData } from './SpeakingParaData.js';
import SpeakingDataForm from './SpeakingParaForm.js';
import SpeakingDataTable from './SpeakingParaTable.js';

const MICSIZE = 50
const IMG_MIC_SIZE = MICSIZE * .8

function Paragraph() {
  const { currentUser } = useAuth();
  const { userInfo, paragraphs, setSpeakingParaData, isLoading, processProgressData} = SpeakingParaData(currentUser);
  const [addPrara,  setAddPara ]  = useState(false);
  
  const showAddPara = () => {
    setAddPara(!addPrara)
  }
  
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
            <h3 class="text-center py-5">Speaking Paragraphs</h3>
            {isLoading ? (null):(<div>
              <div>
                {addPrara ? (
                <div>
                  <div class="text-center">
                    <button type="button" onClick={showAddPara} class="btn btn-outline-light btn-sm mx-1">
                      Hide
                    </button>
                  </div>
                  <SpeakingDataForm userInfo={userInfo} paragraphs={paragraphs} setSpeakingParaData={setSpeakingParaData}/>
                </div>
                
                ): (
                  <div class="text-center">
                    <button type="button" onClick={showAddPara} class="btn btn-outline-light btn-sm mx-1">
                      Add Paragraph
                    </button>
                  </div>
                )}

              </div>
              <div> 
                <SpeakingDataTable userInfo={userInfo}
                paragraphs={paragraphs} setSpeakingParaData={setSpeakingParaData} processProgressData={processProgressData}/>

              </div>
              
            </div>)}
            
          </div>
        )}
      </div>

    </div>
  );
}

export default Paragraph;