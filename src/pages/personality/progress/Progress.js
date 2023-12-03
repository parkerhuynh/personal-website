import React, { useState } from 'react';
import { useAuth } from '../../../components/AuthContext';
import { useProgressData } from './useProgressData';
import ReactLoading from 'react-loading';
import ProgressForm from './ProgressForm';
import ProgressTable from './ProgressTable';
import axios from 'axios';
import katex from 'katex';
window.katex = katex;

const Progress = () => {
    const { currentUser } = useAuth();
    const [inputData, setInputData] = useState({ objective: '', progress: '' });

    const [dayhistory, setdayhistory] = useState(3);
    const { userInfo, progress, setProgress, fetchUserData, isLoading, quillInputHandel } = useProgressData(currentUser, dayhistory);



    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            user_id: userInfo.id,
            username: userInfo.username,
            objective: inputData.objective,
            progress: inputData.progress,
            important: inputData.important ? 1 : 0
        };
        try {
            const response = await axios.post('/add_progress', payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Success:', response.data);
            setInputData({
                objective: '',
                progress: '',
                important: false
            });
            fetchUserData()
        } catch (error) {
            console.error('Error:', error);
        }
    };


    // Function to handle the deletion of a progress row
    const handleRowDelete = async (rowId) => {
        try {
            // Send a DELETE request to your backend
            const response = await axios.delete(`/delete_progress/${rowId}`);

            if (response.status === 200) {
                // Update the 'progress' state to remove the deleted entry
                setProgress(prevProgress => prevProgress.filter(item => item.id !== rowId));
            } else {
                console.error('Failed to delete the row:', response.data.message);
                // Handle the case where the server returns a non-success status code
            }
        } catch (error) {
            console.error('There was an error deleting the row:', error);
            // Handle errors in the delete request
        }
    };

    const handleInputChange = (e) => {
        if (e.target) {
            const { name, value, type, checked } = e.target;
            setInputData(prevInputData => ({
                ...prevInputData,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else {
            quillInputHandel(e, (progress) => {
                console.log(progress) // Assuming quillInputHandel accepts a callback
                setInputData(prevInputData => ({
                    ...prevInputData,
                    progress: progress  // 'action' is the new value from ReactQuill, processed asynchronously
                }));
            });
        }
    };

    // Function to initiate editing of a progress ro


    return (
        <div className={'background-image-repeat'}>
            <div className="container">
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
                                <ProgressForm
                                    handleInputChange={handleInputChange}
                                    inputData={inputData}
                                    handleSubmit={handleSubmit} />

                                <ProgressTable progress={progress}
                                    handleRowDelete={handleRowDelete}
                                    dayhistory={dayhistory}
                                    setdayhistory={setdayhistory}
                                    fetchUserData={fetchUserData}
                                    setProgress={setProgress}
                                    quillInputHandel={quillInputHandel}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;