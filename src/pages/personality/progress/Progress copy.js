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
import moment from 'moment-timezone';
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
    const [editingId, setEditingId] = useState(null); // Track which row is being edited
    const [tempInputData, setTempInputData] = useState({ object: '', action: '' });
    const [dayhistory, setdayhistory] = useState(3);

    const handleEdit = (item) => {
        setEditingId(item.id);
        setTempInputData({ object: item.objective, action: item.progress });
    };

    useEffect(() => {
        if (currentUser) {
            getUserInfo();
        }
    }, [currentUser]);

    const getUserInfo = async () => {
        try {
            const response = await axios.get(`/get_user_info/${currentUser.email}`);
            
            setUserInfo(response.data);
            getUserProgress(response.data.id, dayhistory);
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }
    };

    const getUserProgress = async (userId, dayhis) => {
        try {
            const response = await axios.get(`/get_progress/${userId}/${dayhis}`);
            const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const updatedItems = sortedData.map((item) => {
                // Replace 'new_created_at_value' with the new created_at value you want
                const new_created_at_value = moment(item.created_at, "DD-MM-YYYY hh:mm:ss Z")
                const date_render = `${new_created_at_value.format('ddd')}, ${new_created_at_value.format("YYYY-MM-DD")}`
                const date = `${new_created_at_value.format("YYYY-MM-DD")}`
                const time = `${new_created_at_value.format("HH:mm:ss")}`
                console.log(date_render)
                // Return a new object with the same properties as the original item,
                // but with the updated created_at value
                return {
                    ...item,
                    created_at: new_created_at_value,
                    date: date,
                    time: time,
                    date_render: date_render,
                };
                });

            setProgress(updatedItems);
        } catch (error) {
            console.error("Failed to fetch user progress:", error);
        }
    };

    function resizeImageToMaxDimension(width, height, maxDimension) {
        // Calculate the aspect ratio
        const aspectRatio = width / height;

        // Determine new dimensions
        let newWidth, newHeight;

        if (width > height) {
            // If width is the larger dimension
            newWidth = Math.min(width, maxDimension);
            newHeight = newWidth / aspectRatio;
        } else {
            // If height is the larger dimension or if width and height are equal
            newHeight = Math.min(height, maxDimension);
            newWidth = newHeight * aspectRatio;
        }

        // Ensuring that dimensions are integers
        newWidth = Math.round(newWidth);
        newHeight = Math.round(newHeight);

        return { newWidth, newHeight };
    }

    function quillInputHandel(action, callback) {
        // Check if the action string contains an <img> tag
        if (action.includes("<img")) {
            // Create a new Image object
            let img = new Image();

            // Extract the image source from the action string
            let srcMatch = action.match(/<img src="(.*?)"/);
            if (srcMatch && srcMatch[1]) {
                img.src = srcMatch[1];

                // Once the image is loaded, calculate the new dimensions
                img.onload = function () {
                    let new_dimens = resizeImageToMaxDimension(img.width, img.height, 500);
                    let resizedAction = action.replace("<img", `<img width="${new_dimens.newWidth}" height="${new_dimens.newHeight}"`);
                    // Execute the callback function with the resized action
                    callback(resizedAction);
                };
            } else {
                // If no image source is found, return the original action
                callback(action);
            }
        } else {
            // If no <img> tag is found, return the original action
            callback(action);
        }
    }

    const handleInputChange = (e) => {
        if (e.target) { // Regular inputs
            const { name, value, type, checked } = e.target;
            setInputData(prevInputData => ({
                ...prevInputData,
                [name]: type === 'checkbox' ? checked : value
            }));
        } else { // ReactQuill editor
            quillInputHandel(e, (action) => {
                console.log(action) // Assuming quillInputHandel accepts a callback
                setInputData(prevInputData => ({
                    ...prevInputData,
                    action: action  // 'action' is the new value from ReactQuill, processed asynchronously
                }));
            });
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
            const date_render = item.date_render;
            if (!acc[date_render]) {
                acc[date_render] = [];
            }
            acc[date_render].push(item);
            return acc;
        }, {});

        return Object.keys(groups).map((date_render) => {
            return {
                date_render,
                items: groups[date_render],
            };
        });
    };
    const groupedProgress = groupByDate(progress);
    const groupStripedStyle = (index) => ({
        backgroundColor: index % 2 === 0 ? 'rgb(23, 32, 42, 0.5)' : 'rgb(52, 73, 94 , 0.5)', // Alternating color for even and odd groups
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

    const saveEdit = async (itemId) => {
        // Call backend API to save changes
        try {
            const response = await axios.post(`/update_progress/${itemId}`, {
                objective: tempInputData.object,
                progress: tempInputData.action,
            });
            // Update local state with new data
            setProgress(prevProgress => prevProgress.map(item =>
                item.id === itemId ? { ...item, objective: tempInputData.object, progress: tempInputData.action } : item
            ));
            setEditingId(null); // Exit editing mode
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const handleKeyPress = async (e, itemId) => {
        if (e.key === 'Enter') {
            // Save changes and exit edit mode
            await saveEdit(itemId);
        }
    };
    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;
        setdayhistory(selectedValue);
        getUserProgress(userInfo.id, selectedValue)

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
                        <div class="my-3" > 
                            <select value={dayhistory} onChange={handleSelectChange} class="form-select form-select-sm" aria-label=".form-select-sm example">
                            <option value="1">1 day</option>
                            <option value="2">2 days</option>
                            <option value="3">3 days</option>
                            <option value="4">4 days</option>
                            <option value="5">5 days</option>
                            <option value="6">6 days</option>
                            <option value="7">1 week</option>
                            <option value="14">2 weeks</option>
                            <option value="30">1 month</option>
                            <option value="all">All</option>
                        </select>
                        </div>
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
                                            <tr key={item.id} style={groupStripedStyle(groupIndex)}>
                                                {/* <tr key={item.id}> */}
                                                {index === 0 && (
                                                    <td rowSpan={group.items.length} style={{ verticalAlign: 'middle', textAlign: 'center' }}>{group.date_render}</td>
                                                )}
                                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center'>{item.time}</td>
                                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                                    {
                                                        editingId === item.id ? (
                                                            <input
                                                                type="text"
                                                                value={tempInputData.object}
                                                                onChange={(e) => setTempInputData({ ...tempInputData, object: e.target.value })}
                                                                onKeyPress={(e) => handleKeyPress(e, item.id)}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span onDoubleClick={() => handleEdit(item)}>{item.objective}</span>
                                                        )
                                                    }</td>
                                                <td style={{ verticalAlign: 'middle', textAlign: 'left' }}>
                                                    {
                                                        editingId === item.id ? (
                                                            <div class="">
                                                                <ReactQuill
                                                                    theme="snow"
                                                                    value={tempInputData.action}
                                                                    onChange={(newContent, delta, source, editor) => {
                                                                        // Call quillInputHandel to handle the new content
                                                                        quillInputHandel(newContent, (action) => {
                                                                            // Update tempInputData with the processed action
                                                                            setTempInputData({ ...tempInputData, action });
                                                                        });
                                                                    }}
                                                                    onKeyPress={(e) => handleKeyPress(e, item.id)}
                                                                    modules={modules}
                                                                />
                                                                <div class="text-center mt-1">
                                                                    <button onClick={() => saveEdit(item.id)} className="btn btn-light btn-sm">Save</button>
                                                                </div>

                                                            </div>

                                                        ) : (
                                                            <div onDoubleClick={() => handleEdit(item)} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.progress) }} />
                                                        )}
                                                </td>
                                                <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <button onClick={() => handleRowDelete(item.id)} className="btn btn-sm btn-light text-center">
                                                        <FontAwesomeIcon icon={faTrashAlt} />
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