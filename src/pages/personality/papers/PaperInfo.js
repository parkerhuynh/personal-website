import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../components/AuthContext';
import axios from 'axios';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
function PaperInfo() {
    const { paper_id } = useParams();
    const { currentUser } = useAuth();
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [paperInfo, setPaperInfo] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [field, setField] = useState(null);
    const [temPaperInfo, setTemPaperInfo] = useState({});



    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const fetchUserData = async () => {
        if (!currentUser) return;
        // setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);
            const paperResponse = await axios.get(`/get_one_paper/${userInfoResponse.data.id}/${paper_id}`);
            var datainfo = paperResponse.data
            if (datainfo.username == currentUser.username) {
                datainfo.title = datainfo.paper
                datainfo.resultLen = []
                for (let i = 0; i < datainfo.datasets.length; i++) {
                    datainfo[`dataset_${i + 1}`] = datainfo.datasets[i]
                    datainfo[`result_${i + 1}`] = datainfo.results[i]
                    datainfo.resultLen.push(i + 1)
                }
                setPaperInfo(datainfo);
            } else {
                setPaperInfo({resultLen: []});
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
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

    const handleEdit = (editingfield) => {
        setField(editingfield)
        setIsEdit(true)
        setTemPaperInfo(paperInfo)

    };
    const handleInputChange = (quill_name, e) => {
        
        if (e.target) {
            
            const { name, value, type, checked } = e.target;
            setTemPaperInfo(prevInputData => ({
                ...prevInputData,
                [name]: type === 'checkbox' ? checked : value
            }));
            console.log(temPaperInfo)
        } else {
            setTemPaperInfo(prevInputData => ({
                ...prevInputData,
                [quill_name]: e
            }));
            ;
        }
    };
    const handleSubmit = async () => {
        
        try {
            var payload = temPaperInfo
            payload.user_id = temPaperInfo.id
            payload.username = temPaperInfo.username
            // if (payload.link != "") {
            //     payload.url = `<p><a href="${payload.link}" rel="noopener noreferrer" target="_blank">${payload.link}</a></p>`

            // }
            payload.url = payload.link
            const response = await axios.post('/update_paper', payload, {
            headers: { 'Content-Type': 'application/json' },
            });
            setPaperInfo(temPaperInfo)
            setIsEdit(false);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const cancel = async () => {
        setIsEdit(false);
    };
    console.log(paperInfo)
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
                        {!paperInfo ? (null) : (
                            <div>
                                <div className="table pt-4">
                                    <table className="table table-dark table-bordered mt-4">
                                        <thead>
                                        </thead>
                                        <tbody>
                                            <tr onDoubleClick={(e) => handleEdit("paper")} >
                                                <td style={{ verticalAlign: 'middle', width: "200px" }} ><h5>Title</h5></td>
                                                <td class="text-left">
                                                    {(isEdit & (field == "paper")) ? (
                                                        <div>
                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="paper"
                                                                    name="paper"
                                                                    placeholder="Enter Title"
                                                                    value={temPaperInfo.paper}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("paper")} class="text-light"> {paperInfo.paper}</h6></div>
                                                    )}

                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("name")} >
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Name</h5></td>
                                                <td>
                                                    {(isEdit & (field == "name")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="name"
                                                                    name="name"
                                                                    placeholder="Enter Name of Model"
                                                                    value={temPaperInfo.name}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("name")} class="text-light text-left"> {paperInfo.name}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("url")} >
                                                <td style={{ verticalAlign: 'middle' }} onDoubleClick={() => handleEdit("url")}><h5>URL</h5></td>
                                                <td>
                                                    {(isEdit & (field == "url")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="link"
                                                                    name="link"
                                                                    placeholder="Enter URL"
                                                                    value={temPaperInfo.link}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div onDoubleClick={() => handleEdit("url")} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`<p><a href="${paperInfo.link}" rel="noopener noreferrer" target="_blank">${paperInfo.link}</a></p>`) }} />
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("abstract")} >
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Abstract</h5></td>
                                                <td>
                                                    {(isEdit & (field == "abstract")) ? (
                                                        <div className="form-group">
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={temPaperInfo.abstract}
                                                                onChange={(content) => handleInputChange('abstract', content)}
                                                                modules={modules}
                                                            />
                                                        </div>

                                                    ) : (
                                                        <div onDoubleClick={() => handleEdit("abstract")} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paperInfo.abstract) }} />
                                                    )}

                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("author")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Authors</h5></td>
                                                <td>
                                                    {(isEdit & (field == "author")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="author"
                                                                    name="author"
                                                                    placeholder="Enter Authors"
                                                                    value={temPaperInfo.author}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("author")} class="text-light text-left"> {paperInfo.author}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("conference")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Conference</h5></td>
                                                <td>
                                                    {(isEdit & (field == "conference")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="conference"
                                                                    name="conference"
                                                                    placeholder="Enter Conference"
                                                                    value={temPaperInfo.conference}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("conference")} class="text-light text-left"> {paperInfo.conference}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("year")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Year</h5></td>
                                                <td>
                                                    {(isEdit & (field == "year")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    id="year"
                                                                    name="year"
                                                                    placeholder="Enter Year"
                                                                    value={temPaperInfo.Year}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("year")} class="text-light text-left"> {paperInfo.year}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("category")}>
                                                <td style={{ verticalAlign: 'middle' }} onDoubleClick={(e) => handleEdit("category")}><h5>Category</h5></td>
                                                <td>
                                                    {(isEdit & (field == "category")) ? (
                                                        <div>
                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="category"
                                                                    name="category"
                                                                    placeholder="Enter Category"
                                                                    value={temPaperInfo.category}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("category")} class="text-light text-left"> {paperInfo.category}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("img_encoder")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Image Encoder</h5></td>
                                                <td>
                                                    {(isEdit & (field == "img_encoder")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="img_encoder"
                                                                    name="img_encoder"
                                                                    placeholder="Enter Image Encoder"
                                                                    value={temPaperInfo.img_encoder}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("img_encoder")} class="text-light text-left"> {paperInfo.img_encoder}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("ques_enc")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Question Encoder</h5></td>

                                                <td>
                                                    {(isEdit & (field == "ques_enc")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="ques_encoder"
                                                                    name="ques_encoder"
                                                                    placeholder="Enter Question Encoder"
                                                                    value={temPaperInfo.ques_encoder}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("ques_enc")} class="text-light text-left"> {paperInfo.ques_encoder}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("fusion")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Fusion</h5></td>
                                                <td>
                                                    {(isEdit & (field == "fusion")) ? (
                                                        <div>

                                                            <div className="form-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="fusion"
                                                                    name="fusion"
                                                                    placeholder="Enter Fusion"
                                                                    value={temPaperInfo.fusion}
                                                                    onChange={(e) => handleInputChange(null, e)}
                                                                    required
                                                                />
                                                            </div>

                                                        </div>
                                                    ) : (
                                                        <div> <h6 onDoubleClick={(e) => handleEdit("fusion")} class="text-light text-left"> {paperInfo.fusion}</h6></div>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Datasets</h5></td>
                                                {!paperInfo.resultLen ? (null): (
                                                    <td  style={{ verticalAlign: 'middle' }} >
                                                    <div class="d-flex align-items-start">
                                                        {paperInfo.resultLen.map((id) => (
                                                            <div class="col-3 text-center border-end d-flex justify-content-center align-items-center" style={{ "height": "40px" }}>
                                                                {(isEdit & (field == `result_${id}`)) ? (
                                                                    <div>
                                                                    <input 
                                                                        style={{ "width": "160px" }}
                                                                        type="text"
                                                                        className="form-control "
                                                                        id={`dataset_${id}`}
                                                                        name={`dataset_${id}`}
                                                                        placeholder={`Enter Dataset ${id}`}
                                                                        value={temPaperInfo[`dataset_${id}`]}
                                                                        onChange={(e) => handleInputChange(null, e)}
                                                                        required
                                                                    />
                                                                </div>
                                                                ) : (
                                                                    <div ><h6
                                                                        onDoubleClick={(e) => handleEdit(`result_${id}`)}>
                                                                        {paperInfo[`dataset_${id}`]}</h6>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                    
                                                )}
                        
                                            </tr>
                                            <tr>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Results</h5></td>
                                                {!paperInfo.resultLen ? (null): (
                                                    <td  style={{ verticalAlign: 'middle' }} >
                                                    <div class="d-flex align-items-start">
                                                        {paperInfo.resultLen.map((id) => (
                                                            <div class="col-3 text-center border-end d-flex justify-content-center align-items-center" style={{ "height": "40px" }}>
                                                                {(isEdit & (field == `result_${id}`)) ? (
                                                                    <div >
                                                                    <input 
                                                                        style={{ "width": "160px" }}
                                                                        type="text"
                                                                        className="form-control "
                                                                        id={`result_${id}`}
                                                                        name={`result_${id}`}
                                                                        placeholder={`Enter Result ${id}`}
                                                                        value={temPaperInfo[`result_${id}`]}
                                                                        onChange={(e) => handleInputChange(null, e)}
                                                                        required
                                                                    />
                                                                </div>
                                                                ) : (
                                                                    <div ><h6
                                                                        onDoubleClick={(e) => handleEdit(`result_${id}`)}>
                                                                        {paperInfo[`result_${id}`]}</h6>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                    
                                                )}

                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("contribute")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Contributions</h5></td>
                                                <td>
                                                    {(isEdit & (field == "contribute")) ? (
                                                        <div className="form-group">
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={temPaperInfo.contribute}
                                                                onChange={(content) => handleInputChange('contribute', content)}
                                                                modules={modules}
                                                            />
                                                        </div>

                                                    ) : (
                                                        <div onDoubleClick={() => handleEdit("contribute")} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paperInfo.contribute) }} />
                                                    )}

                                                </td>

                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("structure")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Structure</h5></td>
                                                <td>
                                                    {(isEdit & (field == "structure")) ? (
                                                        <div className="form-group">
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={temPaperInfo.structure}
                                                                onChange={(content) => handleInputChange('structure', content)}
                                                                modules={modules}
                                                            />
                                                        </div>

                                                    ) : (
                                                        <div onDoubleClick={() => handleEdit("structure")} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paperInfo.structure) }} />
                                                    )}

                                                </td>
                                            </tr>
                                            <tr onDoubleClick={(e) => handleEdit("problems")}>
                                                <td style={{ verticalAlign: 'middle' }} ><h5>Limitations</h5></td>
                                                <td>
                                                {(isEdit & (field == "problems")) ? (
                                                        <div className="form-group">
                                                            <ReactQuill
                                                                theme="snow"
                                                                value={temPaperInfo.problems}
                                                                onChange={(content) => handleInputChange('problems', content)}
                                                                modules={modules}
                                                            />
                                                        </div>

                                                    ) : (
                                                        <div onDoubleClick={() => handleEdit("problems")} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(paperInfo.problems) }} />
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    {isEdit ?
                                        (<div class="text-center mt-1" >
                                            <button onClick={() => handleSubmit()} className="btn btn-light btn-sm me-4">Save</button>
                                            <button onClick={() => cancel()} className="btn btn-light btn-sm">Cancel</button>
                                        </div>

                                        ) :
                                        (null)
                                    }
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