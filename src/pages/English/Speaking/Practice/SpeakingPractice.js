import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../components/AuthContext.js';
import axios from 'axios';
import { SpeakingPracticeData } from './SpeakingPracticeData.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPenToSquare, faTable, faFloppyDisk, faBan, faGlobe, faUser, faShuffle} from '@fortawesome/free-solid-svg-icons';

function PaperInfo() {
    const { para_id } = useParams();
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const { userInfo, isLoading, setIsLoading, para, setPara, allParaId } = SpeakingPracticeData(currentUser, para_id);
    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };

    const [temForm, setTemForm] = useState(initialFormState);
    const [userOption, setUserOption] = useState(true);

    const handleParaTableClick = () => {
        window.location.href = `/speaking_para`
    }
    const handleEdit = () => {
        setIsEditing(true);
        setTemForm(para)
    };

    const cancel = async () => {
        setIsEditing(false);
    };

    const saveEdit = async () => {
        try {
            // Update local state first
            setIsEditing(false);
            var jsonbody = temForm
            setPara(temForm)
            await axios.post(`/update_speaking_para`, jsonbody).then(async () => {
                console.log('successful!')
            })
            // Reset temp data and exit edit mode
            setTemForm(initialFormState);
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };
    const onDelete = async () => {
        try {
            await axios.post(`/delete_speaking_pata/${para.para_id}`).then(
                window.location.href = `/speaking_para`
            )

            // fetchDeadlines(userInfo.id);
        } catch (error) {
            console.error('Error deleting deadline:', error);
            // Implement user-friendly error handling here
        }
    };

    const handleUserOption = () => {
        setUserOption(!userOption)
    };


    const yourOtherParaId = allParaId.filter(para => para.user_id === userInfo.id);
    
    const handleRandom = async () => {
        var ramdom_para_id = 0
        let currentItem = para.para_id
        if (userOption) {
            if (yourOtherParaId.length > 1) {
                let filteredList = yourOtherParaId.filter(item => item.para_id !== currentItem);
                ramdom_para_id = filteredList[Math.floor(Math.random() * filteredList.length)]
                const paraResponse = await axios.get(`/get_one_para/${ramdom_para_id.para_id}`);
                setPara(paraResponse.data[0]);
            }
        } else {
            if (allParaId.length > 1) {
                let filteredList = allParaId.filter(item => item.para_id !== currentItem);
                ramdom_para_id = filteredList[Math.floor(Math.random() * filteredList.length)]
                const paraResponse = await axios.get(`/get_one_para/${ramdom_para_id.para_id}`);
                setPara(paraResponse.data[0]);
            }
        }
    };

    return (
        <div className={'background-image-repeat'}>
            <div class="container pb-5">
                {!currentUser ? (
                    <div className="container">
                        <div className="pt-5 text-center">
                            <h1 className="text-danger pb-5">Warning!</h1>
                            <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
                            <h5 className="text-light"> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 class="text-center py-5 text-light "> Speaking Practice</h1>
                        {isLoading ? (null) : (
                            <div>
                                <div class="card" style={{ backgroundColor: 'rgb(0, 1, 2, 0.5)' }}>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-1"> </div>
                                            <div class="col-10">
                                                {isEditing ? (
                                                    <div class="d-flex justify-content-center">
                                                        <label htmlFor="title" className="text-light me-2">Title:</label>
                                                        <input
                                                            style={{ width: "700px" }}
                                                            type="text"
                                                            className="form-control"
                                                            value={temForm.title}
                                                            onChange={(e) => setTemForm({ ...temForm, title: e.target.value })}
                                                        // onKeyPress={(e) => handleKeyPress(e, item.id)}
                                                        />
                                                    </div>
                                                ) : (

                                                    <h4 class="card-title text-light text-center">{para.title}</h4>
                                                )}
                                            </div>
                                            <div class="col-1 d-flex justify-content-end">
                                                {(para.user_id !== userInfo.id) ? (
                                                    <div class="d-flex justify-content-around  m-0 p-0">
                                                        <button onClick={handleParaTableClick} className="btn btn-sm btn-light text-center me-3">
                                                            <FontAwesomeIcon icon={faTable} style={{ color: "#000000", }} />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger text-center me-3" disabled>
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger text-center" disabled>
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>

                                                ) : (
                                                    <div class="d-flex justify-content-around  m-0 p-0">
                                                        <button onClick={handleParaTableClick} className="btn btn-sm btn-light text-center me-3">
                                                            <FontAwesomeIcon icon={faTable} style={{ color: "#000000", }} />
                                                        </button>
                                                        {isEditing ? (
                                                            <div class="d-flex justify-content-around  m-0 p-0">
                                                                <button onClick={saveEdit} className="btn btn-sm btn-light text-center me-3">
                                                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                                                </button>
                                                                <button onClick={cancel} className="btn btn-sm btn-light text-center">
                                                                    <FontAwesomeIcon icon={faBan} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div class="d-flex justify-content-around  m-0 p-0">
                                                                <button onClick={handleEdit} className="btn btn-sm btn-light text-center me-3">
                                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                                </button>
                                                                <button onClick={onDelete} className="btn btn-sm btn-light text-center">
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isEditing ? (
                                            <div >

                                                <div class="d-flex justify-content-center align-items-center m-2">
                                                    <label htmlFor="topic" className="text-light me-2">Topic:</label>
                                                    <input
                                                        style={{ width: "700px" }}
                                                        type="text"
                                                        className="form-control"
                                                        value={temForm.topic}
                                                        onChange={(e) => setTemForm({ ...temForm, topic: e.target.value })}
                                                    />
                                                </div>
                                                <div class="m-5">
                                                    <label htmlFor="content" className="text-light my-2">Content:</label>
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
                                        ) : (
                                            <div>
                                                <div class="row my-2">
                                                    <div class="col-1"> </div>
                                                    <div class="col-10">
                                                        <h5 class="card-title text-light text-center">{para.topic}</h5>
                                                    </div>
                                                    <div class="col-1 d-flex justify-content-end">
                                                        {userOption ? (
                                                            <button onClick={handleUserOption} className="btn btn-sm btn-light text-center me-3">
                                                                <FontAwesomeIcon icon={faUser} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={handleUserOption} className="btn btn-sm btn-light text-center me-3">
                                                                <FontAwesomeIcon icon={faGlobe} />
                                                            </button>
                                                        )}

                                                        <button onClick={handleRandom} className="btn btn-sm btn-light text-center">
                                                            <FontAwesomeIcon icon={faShuffle} />
                                                        </button>
                                                    </div>

                                                </div>

                                                <pre class="card-text text-light m-5">{para.content}</pre>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};
export default PaperInfo;