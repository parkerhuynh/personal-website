import React, { useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { usePaperData } from './usePaperData';
import ReactLoading from 'react-loading';
import PaperForm from './PaperForm';
import PaperTable from './PaperTable';
import '../../../App.css';
import axios from 'axios';
import katex from 'katex';
window.katex = katex;

const Paper = () => {
    const { currentUser } = useAuth();
    
    const { userInfo, paper, setPaper, fetchUserData, isLoading, quillInputHandel } = usePaperData(currentUser);
    const [addPaper, setAddPaper] = useState(false);
    const [datasetCount, setDatasetCount] = useState(1);
    const init_inputdata = {
        author: "", 
        conference: "",
        fusion: "", 
        img_encoder: "",
        contributions:"",
        link:"",
        name:"",
        paper:"",
        ques_encoder:"",
        structure: "",
        abtract: "",
        category:"",
        year:""}
    const [inputData, setInputData] = useState({});

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        var payload = inputData
        payload.user_id = userInfo.id
        // payload.url =`<p><a href="${payload.link}" rel="noopener noreferrer" target="_blank">${payload.link}</a></p>`
        payload.url = payload.link
        payload.username = userInfo.username
        const response = await axios.post('/add_paper', payload, {
            headers: { 'Content-Type': 'application/json' },
            });
        if (response.status === 200) {
            console.log('Success:', response.data);
            setInputData(init_inputdata);
            fetchUserData()
            
        } else {
            window.alert("Upload Failed: The paper could not be uploaded.!");
        }
        
    };


    // Function to handle the deletion of a paper row
    const handleRowDelete = async (rowId) => {
        try {
            // Send a DELETE request to your backend
            const response = await axios.delete(`/delete_paper/${rowId}`);

            if (response.status === 200) {
                // Update the 'paper' state to remove the deleted entry
                setPaper(prevPaper => prevPaper.filter(item => item.id !== rowId));
            } else {
                console.error('Failed to delete the row:', response.data.message);
                // Handle the case where the server returns a non-success status code
            }
        } catch (error) {
            console.error('There was an error deleting the row:', error);
            // Handle errors in the delete request
        }
    };

    const handleInputChange = (quill_name,e) => {
        
        if (e.target) {
            
            const { name, value, type, checked } = e.target;
            setInputData(prevInputData => ({
                ...prevInputData,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else {
            quillInputHandel(quill_name, e, (paper, quill_name) => {
                setInputData(prevInputData => ({
                    ...prevInputData,
                    [quill_name]: paper  // 'action' is the new value from ReactQuill, processed asynchronously
                }));
            });
        }
    };

    // Function to initiate editing of a paper ro
    const handleSwitch = () => {
        setAddPaper(!addPaper)
    };
    
    return (
        <div className={'background-image-repeat'}>
            <div class="mx-5">
                {!currentUser ? (
                    <div className="pt-5 text-center">
                        <h1 className="text-danger pb-5">Warning!</h1>
                        <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
                        <h5 className="text-light"> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
                    </div>
                ) : (
                    <div>
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', "padding-top": "300px" }}>
                                <ReactLoading type="spinningBubbles" color="#F7F9F9" height={300} width={300} />
                            </div>
                        ) : (
                            <div class="m-0 pt-5">
                                <h2 className="text-light text-center">Papers</h2>
                                <div class="d-flex justify-content-center mt-5">
                                    {addPaper ? (<button type="button" class="btn btn-light btn-sm me-3 text-light" onClick = {handleSwitch} style={{width:"150px", backgroundColor:"transparent"}}>Show Table</button>):
                                    (<button type="button" class="btn btn-light me-3 btn-sm text-light" onClick={handleSwitch} style={{width:"150px", backgroundColor:"transparent"}}>Add Paper</button>)
                                    }
                                </div>
                                {addPaper ?
                                (
                                    <PaperForm
                                    handleInputChange={handleInputChange}
                                    inputData={inputData}
                                    handleSubmit={handleSubmit}
                                    setInputData = {setInputData}
                                    datasetCount = {datasetCount}
                                    />
                                ):
                                (
                                    <PaperTable papers={paper}
                                    handleRowDelete={handleRowDelete}
                                    fetchUserData={fetchUserData}
                                    setPaper={setPaper}
                                    quillInputHandel={quillInputHandel}
                                    setDatasetCount={setDatasetCount}
                                />
                                )
                                    }
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Paper;