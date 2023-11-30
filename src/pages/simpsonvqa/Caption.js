import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactLoading from 'react-loading';
const WorkerList = () => {
    const [captions, setCaptions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/get_captions');
            setCaptions(response.data)
            if (response.data.length > 0) {
                setLoading(false);
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    
    return (
        <div className='backgound_theme'>
            <div class="container" >
                <div class="row mt-5">
                    <h3 class="mb-4">Captions</h3>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ReactLoading type="spin" color="#212529" height={300} width={300} />
                    </div>
                ) : (
                  <div class="row mt-5">
                  <div class="d-flex flex-wrap">
                      {captions.map((caption, index) => (
                          <div class="col-4 p-2">
                              <div class="card">
                                  <img class="card-img-top" src={caption["Img path"]} alt="Card image cap" style={{height: "250px"}}/>
                                  <div class="card-body">
                                      <h5>Caption 1:</h5>
                                      <p class="card-text">{caption["Caption 1"]}.</p>
                                      <h5>Caption 2:</h5>
                                      <p class="card-text">{caption["Caption 2"]}.</p>
                                  </div>
                              </div>
                          </div>
                      ))}

                  </div>
              </div>
                )}

            </div>
        </div>

    );
};

export default WorkerList;