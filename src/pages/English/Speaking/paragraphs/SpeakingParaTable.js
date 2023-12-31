import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment-timezone';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPenToSquare, faFloppyDisk, faBan, faUser, faShuffle, faGlobe, faInfo } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const SpeakingDataTable = ({ userInfo, paragraphs, setSpeakingParaData, processProgressData }) => {
    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };
    const [temForm, setTemForm] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [paraOption, setParaOption] = useState("you");
    const [topicOption, setTopicOption] = useState("All Topic");
    const [show, setShow] = useState(false);

    const rowStripedStyle = (index) => {
        if (index % 2 === 0) {
            return 'rgb(0, 1, 2, 0.5)'
        } else {
            return 'rgb(52, 73, 94, 0.5)'
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setTemForm(item)
    };

    const saveEdit = async () => {
        try {
            // Update local state first
            setEditingId(null);
            var jsonbody = temForm
            const updatedParas = paragraphs.map(para => {
                if (para.para_id === jsonbody.para_id) {
                    return { ...para, title: jsonbody.title, topic: jsonbody.topic, content: jsonbody.content, level: jsonbody.level };
                }
                return para;
            });

            await axios.post(`/update_speaking_para`, jsonbody).then(async () => {
                setSpeakingParaData(updatedParas)
            })
            // Reset temp data and exit edit mode

            setTemForm(initialFormState);
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };

    const handleKeyPress = async (e) => {
        if (e.key === 'Enter') {
            await saveEdit();
        }
    };

    const cancel = async () => {
        setEditingId(null);
    };

    const onDelete = async (item) => {
        try {
            await axios.post(`/delete_speaking_pata/${item.para_id}`);
            const updatedPara = paragraphs.filter(para => para.para_id !== item.para_id);
            setSpeakingParaData(updatedPara)
            // fetchDeadlines(userInfo.id);
        } catch (error) {
            console.error('Error deleting deadline:', error);
            // Implement user-friendly error handling here
        }
    };
    const handleSelectParaOptionChange = async (option) => {
        const selectedValue = option;
        const progressResponse = await axios.get(`/get_speaking_para/${userInfo.id}/${selectedValue}`);
        setSpeakingParaData(processProgressData(progressResponse.data));
        setParaOption(selectedValue);
    };

    const topics = paragraphs.map(example => example.topic);
    const uniqueTopicSet = new Set(topics);
    const uniqueTopic = [...uniqueTopicSet];
    uniqueTopic.unshift('All Topic')

    const handleSelectTopicChange = (e) => {
        const selectedValue = e.target.value;
        setTopicOption(selectedValue);
    };

    const filterPara = paragraphs.filter(item => {

        if (topicOption === "All Topic") {
            return true
        } else if (item.topic == topicOption) {
            return true
        }
    });
    const handleParaClick = (para_id) => {
        window.location.href = `/practice/${para_id}`
    };
    const handleRandom = async () => {
        var ramdom_para_id = 0
        if (filterPara.length > 0) {
            ramdom_para_id = filterPara[Math.floor(Math.random() * filterPara.length)]
            window.location.href = `/practice/${ramdom_para_id.para_id}`
        }
    };

    const dropdownStyle = {
        position: 'relative',
        display: 'inline-block',
        width: "40px"
    };



    const dropdownContentStyle = {
        display: show ? 'block' : 'none',
        position: 'absolute',
        backgroundColor: '#f9f9f9',
        width: '500px',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        padding: '12px 16px',
        zIndex: 1,
        "border-radius": "10px",
        textAlign: 'left'
    };

    function corlorRowDisplay (item) {
        if ((item.min_duration_given_user != "NaN") &(item.min_duration_given_user == item.min_duration_all_users)) {
            return "#28B463"
        } else {
            return "#FDFEFE"
        }
    }
    return (
        <div>
            <div className="table py-4">
                <div class="row">
                    <div class="col-2">
                        <select value={topicOption} onChange={handleSelectTopicChange} class="form-select form-select-sm" aria-label=".form-select-sm example">
                            {uniqueTopic.map(topic => (
                                <option value={topic}>{topic}</option>
                            ))}
                        </select>
                    </div>
                    <div class="col-2 d-flex justify-content-start">

                        {(paraOption === "you") ? (
                            <button style={{width:"40px"}}  onClick={(e) => { handleSelectParaOptionChange("all") }} className="btn btn-sm btn-light text-center me-3">
                                <FontAwesomeIcon icon={faUser} />
                            </button>
                        ) : (
                            <button style={{width:"40px"}} onClick={(e) => { handleSelectParaOptionChange("you") }} className="btn btn-sm btn-light text-center me-3">
                                <FontAwesomeIcon icon={faGlobe} />
                            </button>
                        )}
                        <button style={{width:"40px"}} onClick={handleRandom} className="btn btn-sm btn-light text-center">
                            <FontAwesomeIcon icon={faShuffle} />
                        </button>
                        <button style={dropdownStyle}  onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="mx-3 btn btn-sm btn-light text-center">
                            <FontAwesomeIcon icon={faInfo} />
                            <div class="text-left" style={dropdownContentStyle}>
                                <ul>
                                    <li>
                                    Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faUser} />
                                    to show only your paragraphs or Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faGlobe} />
                                    to show all paragraphs.

                                    </li>
                                    <li class="my-3">
                                    Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faShuffle} />
                                    to randomly select a paragraph to practice.
                                    </li>

                                    <li class="my-3">
                                    Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faPenToSquare} />
                                    to edit your paragraphs. <span class="text-danger"> You cannot edit the paragraphs created by other users.</span>
                                    </li>

                                    <li class="my-3">
                                    Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faFloppyDisk} />
                                    to save your edit.
                                    </li>
                                    <li class="my-3">
                                    Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faTrashAlt} />
                                    to delete your paragraphs. <span class="text-danger"> You cannot delete the paragraphs created by other users.</span>
                                    </li>
                                    <li class="my-3">
                                    Press
                                    <FontAwesomeIcon style={{width:"40px"}} icon={faBan} />
                                    to cancel your edit.
                                    </li>
                                </ul>
                            </div>
                        </button>

                    </div>
                </div>
                <table className="table table-dark table-bordered mt-4">
                    <thead>
                        <tr style={{ verticalAlign: 'middle', textAlign: 'center' }} >
                            <th class='text-center' scope="col" style={{ width: "50px" }}>ID</th>
                            <th class='text-center' scope="col" style={{ width: "200px" }}>Topic</th>
                            <th class='text-center' scope="col" >Title</th>
                            <th class='text-center' scope="col" style={{ width: "120px" }}>Level</th>
                            <th class='text-center' scope="col" style={{ width: "70px" }}>length</th>
                            <th class='text-center' scope="col" style={{ width: "72px" }}>Completed Time</th>
                            <th class='text-center' scope="col" style={{ width: "120px" }}>Best Speak (second)</th>
                            <th class='text-center' scope="col" style={{ width: "70px" }}>Skip Count</th>
                            <th class='text-center' scope="col" style={{ width: "120px" }}>Created</th>
                            
                            <th style={{ width: "50px" }} class='text-center' scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterPara.map((item, itemIndex) => (
                            <tr onDoubleClick={() => handleParaClick(item.para_id)} key={itemIndex} style={{ backgroundColor: rowStripedStyle(itemIndex), color:corlorRowDisplay(item)}}>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center', color:corlorRowDisplay(item)}} class='text-center' >{itemIndex + 1}</td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                    {(editingId === item.id) ?
                                        (<input
                                            style={{ width: "120px" }}
                                            type="text"
                                            className="form-control"
                                            value={temForm.topic}
                                            onChange={(e) => setTemForm({ ...temForm, topic: e.target.value })}
                                        // onKeyPress={(e) => handleKeyPress(e, item.id)}
                                        />) :
                                        (<span>
                                            <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit', color:corlorRowDisplay(item)}} >{item.topic}</Link>
                                        </span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {(editingId === item.id) ?
                                        (<div>
                                            <div class="py-2">
                                                <label htmlFor="title" className="text-light">Title:</label>
                                                <input
                                                    // style={{ width: "95%" }}
                                                    type="text"
                                                    className="form-control"
                                                    value={temForm.title}
                                                    onChange={(e) => setTemForm({ ...temForm, title: e.target.value })}
                                                    onKeyPress={(e) => handleKeyPress(e)}
                                                />

                                            </div>
                                            <div class="py-2">
                                                <label htmlFor="content" className="text-light">Content:</label>
                                                <textarea
                                                    id="content"
                                                    name="content"
                                                    className="form-control"
                                                    value={temForm.content}
                                                    onChange={(e) => setTemForm({ ...temForm, content: e.target.value })}
                                                    rows={7}
                                                    placeholder="Enter Content"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        ) :
                                        (<span>
                                            <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit', color:corlorRowDisplay(item)}}>{item.title}</Link>
                                        </span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {(editingId === item.id) ?
                                        (<div class="m-2 m-2">
                                            <label htmlFor="level" name="level" className="text-light">Level:</label>
                                            <select value={temForm.level} name="level" class="form-select"
                                                onChange={(e) => setTemForm({ ...temForm, level: e.target.value })}
                                                aria-label="Default select example">
                                                <option value="very easy">Very Easy</option>
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                                <option value="very hard">Very Hard</option>
                                            </select>
                                        </div>
                                        ) :
                                        (<span>
                                            <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit', color:corlorRowDisplay(item)}}>{item.level}</Link>
                                        </span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit' , color:corlorRowDisplay(item)}}>{item.content.split(' ').length}</Link>
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit', color:corlorRowDisplay(item)}}>{item.total_rows_given_user} ({item.total_rows_all_users}) </Link>
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit' , color:corlorRowDisplay(item)}}>{item.min_duration_given_user} ({item.min_duration_all_users}) </Link>
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit', color:corlorRowDisplay(item) }}>{item.skip_value_min_duration_given_user} ({item.skip_value_min_duration_all_users}) </Link>
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Link to={`/practice/${item.para_id}`} style={{ textDecoration: 'inherit' , color:corlorRowDisplay(item)}}>{item.date_render}</Link>
                                </td>
                                
                                
                                <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {(item.user_id === userInfo.id) ? (
                                        <div>
                                            {editingId === item.id ?
                                                (<div class="text-center mt-1">
                                                    <button onClick={() => saveEdit(item.id)} className="btn btn-light btn-sm">
                                                        <FontAwesomeIcon icon={faFloppyDisk} style={{ color: "#0d0d0d", }} />
                                                    </button>
                                                    <button onClick={() => cancel()} className="btn btn-light btn-sm mt-3">
                                                        <FontAwesomeIcon icon={faBan} style={{ color: "#000000", }} />
                                                    </button>
                                                </div>
                                                ) :
                                                (
                                                    <div>
                                                        <button onClick={() => handleEdit(item)} className="btn btn-sm btn-light text-center">
                                                            <FontAwesomeIcon icon={faPenToSquare} style={{ color: "#0d0d0d", }} />
                                                        </button>
                                                        <button onClick={() => onDelete(item)} className="btn btn-sm btn-light text-center mt-3">
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>)
                                            }
                                        </div>

                                    ) : (<div>
                                        <button onClick={() => handleEdit(item)} className="btn btn-sm btn-danger text-center" disabled>
                                            <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        <button onClick={() => onDelete(item)} className="btn btn-sm btn-danger text-center mt-3" disabled>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>)}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default SpeakingDataTable;
