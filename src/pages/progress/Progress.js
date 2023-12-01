import React, { useState, useEffect } from 'react';
import { useAuth } from "../../components/AuthContext";
import axios from 'axios';
import "../../App.css";
const Progress = () => {
    const { currentUser } = useAuth();
    const [isContentTall, setIsContentTall] = useState(false);
    const [progress, setProgress] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [inputData, setInputData] = useState({
        object: '',
        action: '',
        important: false
    });

    useEffect(() => {
        if (currentUser) {
            getUserInfo();
        }
    }, [currentUser]); // Dependency on currentUser

    const getUserInfo = async () => {
        try {
            const response = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(response.data);
            getUserProgress(response.data.id);
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }
    };

    const getUserProgress = async (userId) => {
        try {
            const response = await axios.get(`/get_progress/${userId}`);
            const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setProgress(sortedData);
        } catch (error) {
            console.error("Failed to fetch user progress:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setInputData(prevInputData => ({
            ...prevInputData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const jsonBody = JSON.stringify({
            user_id: userInfo.id,
            username: userInfo.username,
            objective: inputData.object,
            progress: inputData.action,
            important: inputData.important ? 1 : 0
        });
        try {
            const response = await axios.post('/add_progress', jsonBody, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Success:', response.data);
            setInputData({
                object: '',
                action: '',
                important: false
            });
            // Optionally, fetch updated progress
            getUserProgress(userInfo.id);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const groupByDate = (progressArray) => {
        const groups = progressArray.reduce((acc, item) => {
            const date = item.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});

        return Object.keys(groups).map((date) => {
            return {
                date,
                items: groups[date],
            };
        });
    };
    const groupedProgress = groupByDate(progress);
    const groupStripedStyle = (index) => ({
        backgroundColor: index % 2 === 0 ? '#aee300' : '', // Alternating color for even and odd groups
    });


    const handleRowDelete = (rowId) => {
        // Confirm with the user before deleting the row
            // Send a DELETE request to the server
            axios.post(`/delete_progress/${rowId}`)
                .then(response => {
                    // If the delete was successful, update the state to remove the row
                    if (response.status === 200) {
                        setProgress(prevProgress => prevProgress.filter(item => item.id !== rowId));
                    } else {
                        console.error('Failed to delete the row:', response.data.message);
                    }
                })
                .catch(error => {
                    console.error('There was an error deleting the row:', error);
                });
    };
    console.log(progress)
    return (
        <div className={'background-image-repeat'}>
            <div className="container">
                {!currentUser ? (
                    <div className="pt-5 text-center">
                        <h1 className="text-danger pb-5">Warning!</h1>
                        <h5>Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
                        <h5> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
                    </div>
                ) : (
                    <div>
                        <div className="container pt-4">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="object"><h4 className="text-light px-2">Object</h4></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="object"
                                        name="object"
                                        placeholder="Enter object"
                                        value={inputData.object}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="action"><h4 className="text-light px-2 pt-3">Actions</h4></label>
                                    <textarea
                                        className="form-control"
                                        id="action"
                                        name="action"
                                        rows="2"
                                        placeholder="Enter actions"
                                        value={inputData.action}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div class="d-flex justify-content-center">
                                    <div className="d-flex justify-content-center align-items-center pt-3 mx-5">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="important"
                                                name="important"
                                                checked={inputData.important}
                                                onChange={handleInputChange}
                                            />
                                            <label className="form-check-label text-light" htmlFor="important">Important</label>
                                        </div>
                                    </div>
                                    <div className='text-center pt-3'>
                                        <button type="submit" className="btn btn-light">Submit</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {/* Progress Table will be here */}
                        <div className="table-responsive">
                            <table className="table table-dark table-bordered mt-4">
                                <thead>
                                    <tr>
                                        <th class='text-center' scope="col" style={{ width: "170px" }}>Date</th>
                                        <th class='text-center' style={{ width: "100px" }} scope="col">Time</th>
                                        <th style={{ width: "180px" }} scope="col">Objective</th>
                                        <th class='text-center' scope="col">Progress</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedProgress.map((group, groupIndex) =>
                                        group.items.map((item, index) => (
                                            <tr key={item.id} style={groupStripedStyle(groupIndex)}>
                                                {index === 0 && (
                                                    <td rowSpan={group.items.length} style={{ verticalAlign: 'middle', textAlign: 'center' }}>{group.date}</td>
                                                )}
                                                <td onDoubleClick={() => handleRowDelete(item.id)} className={item.important ? 'text-danger' : '' } style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center'>{item.time}</td>
                                                <td onDoubleClick={() => handleRowDelete(item.id)} className={item.important ? 'text-danger' : ''} style={{ verticalAlign: 'middle' }}>{item.objective}</td>
                                                <td onDoubleClick={() => handleRowDelete(item.id)} className={item.important ? 'text-danger' : ''} style={{"white-space": "pre-line"}}>{item.progress}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;