import React, { useState, useEffect } from 'react';
import { useAuth } from "../../components/AuthContext";
import axios from 'axios';
import "../../App.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import katex from 'katex';
window.katex = katex;


const Progress = () => {
    const { currentUser } = useAuth();
    const [progress, setProgress] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    const [inputData, setInputData] = useState({
        object: '',
        action: '',
        important: false,

    });

    useEffect(() => {
        if (currentUser) {
            getUserInfo();
        }
    }, [currentUser]);

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
        if (e.target) { // Regular inputs
            const { name, value, type, checked } = e.target;
            setInputData(prevInputData => ({
                ...prevInputData,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else { // ReactQuill editor
            console.log(e)
            setInputData(prevInputData => ({
                ...prevInputData,
                action: e  // 'e' is the new value from ReactQuill
            }));
        }
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
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                {
                    color: ["red", "blue", "yellow"],
                },
            ],
            ['code-block', 'image'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['formula'],

        ],
        clipboard: {
            // Extend clipboard module to handle mixed content better
            matchVisual: false,
        },
        formula: true,
    };
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
                        <div className="container pt-4">
                            <h2 class="text-light text-center">Progress</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="object"><h4 className="text-light px-2">Object</h4></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="object"
                                        name="object"
                                        placeholder="Enter objective"
                                        value={inputData.object}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="action"><h4 className="text-light px-2 pt-3">Actions</h4></label>
                                    <ReactQuill
                                        theme="snow"
                                        value={inputData.action}
                                        onChange={handleInputChange}
                                        modules={modules}
                                    />
                                </div>
                                <div class="d-flex justify-content-center">
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
                                        <th style={{ width: "40px" }} class='text-center' scope="col"></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedProgress.map((group, groupIndex) =>
                                        group.items.map((item, index) => (
                                            // <tr key={item.id} style={groupStripedStyle(groupIndex)}>
                                            <tr key={item.id}>
                                                {index === 0 && (
                                                    <td rowSpan={group.items.length} style={{ verticalAlign: 'middle', textAlign: 'center' }}>{group.date}</td>
                                                )}
                                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center'>{item.time}</td>
                                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>{item.objective}</td>
                                                <td style={{ verticalAlign: 'middle', textAlign: 'left' }}><div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.progress) }} /></td>
                                                <td className="text-center"  style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <button onClick={() => handleRowDelete(item.id)} className="btn btn-sm btn-light text-center">
                                                        <FontAwesomeIcon icon={faTrashAlt}  />
                                                    </button>
                                                </td>
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