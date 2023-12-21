import React, { useState } from 'react';
import axios from 'axios';
import mic from "./microphone.png"
import un_mic from "./dis_microphone.png"
import add from "./add.png"
import reset_logo from "./reset.png"
import skip_logo from "./skip.png"

const ProgressTable = ({ para, setPara }) => {
    const [inputPara, setInputPara] = useState("")
    const [topic, setTopic] = useState("")
    const [editingInputPara, setEditingInputPara] = useState(false)
    const [submit, setSubmit] = useState(true)
    const MICSIZE = 50
    const IMG_MIC_SIZE = MICSIZE * .8

    const reset = () => {
        setPara("")
        setTopic("")
        setInputPara("")
        setEditingInputPara(false)
        setSubmit(true)
    }


    const handleEditPara = () => {
        setEditingInputPara(true)
    };

    const handleInputPara = (event) => {
        const value = event.target.value
        setInputPara(value)
    };
    const handleTopicChange = (event) => {
        const value = event.target.value
        setTopic(value)
    };

    const para_processing = (text) => {
        var text = text.replace(/\n/g, '.')
        var text = text.replace(/\.\./g, '')
        var text = text.replace(/\.([^\s])/g, '. $1');
        return text

    };

    const handleSubmitPara = () => {
        // reset()
        if (inputPara === "") {
            alert("Enter your paragraph please!")
        } else {
            const present_text = para_processing(inputPara)
            setPara(prevInputData => ({
                ...prevInputData,
                [name]: type === 'checkbox' ? checked : value
            }))
            setSubmit(false)
        }
    };

    const handleSavePara = () => {
        // reset()
        if (inputPara === "") {
            alert("Enter your paragraph please!")
        } else {
            const present_text = para_processing(inputPara)
            setPara(present_text)
            setEditingInputPara(false)
        }
    };

    return (
        <div>
            <div class="row my-3">
                {(editingInputPara || submit) ? (
                    <div>
                        <div class="row">
                            <label class="col-sm-1 col-form-label">Topic</label>
                            <div class="col-sm-11">
                                <input
                                    style={{ "backgroundColor": 'transparent' }}
                                    type="text"
                                    className="form-control my-2 text-light"
                                    value={topic}
                                    onChange={(e) => handleTopicChange(e)} // You need to define this method to handle topic changes
                                />
                            </div>
                        </div>
                        <div class="row">
                            <label class="col-sm-1 col-form-label">Paragraph</label>
                            <div class="col-sm-11">
                                <textarea
                                    class="form-control text-light"
                                    rows="20" value={inputPara}
                                    style={{ "backgroundColor": 'transparent' }}
                                    onChange={(e) => handleInputPara(e)}>
                                </textarea>
                            </div>
                        </div>


                        {submit ? (<div>
                            <div class="text-center"><button type="button" class="btn btn-light btn-sm my-2" style={{ "width": "150px" }} onClick={() => handleSubmitPara()}>Import</button> </div>
                        </div>) : (null)}
                        {editingInputPara ? (<div>
                            <div class="text-center"><button type="button" class="btn btn-light btn-sm my-2" style={{ "width": "150px" }} onClick={() => handleSavePara()}>Save</button> </div>
                        </div>) : (null)}

                    </div>) : (
                    <div>
                        <div class="row">
                            <label class="col-sm-1 col-form-label">Topic</label>
                            <div class="col-sm-11">
                                <input
                                onClick={handleEditPara}
                                    style={{ "backgroundColor": 'transparent' }}
                                    type="text"
                                    className="form-control my-2 text-light"
                                    value={topic}
                                    onChange={(e) => handleTopicChange(e)} // You need to define this method to handle topic changes
                                />
                            </div>
                        </div>
                        <div class="row">
                            <label class="col-sm-1 col-form-label">Paragraph</label>
                            <div class="col-sm-11">
                                <textarea
                                onClick={handleEditPara}
                                    class="form-control text-light"
                                    rows="20" value={inputPara}
                                    style={{ "backgroundColor": 'transparent' }}
                                    onChange={(e) => handleInputPara(e)}>
                                </textarea>
                            </div>
                        </div>
                        <div class=" d-flex align-items-center justify-content-center mt-2">
                            <button onClick={reset} type="button" class="btn  p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": MICSIZE, "height": MICSIZE }}>
                                <img src={add} style={{ "border-radius": "50%", "width": IMG_MIC_SIZE + 20, "height": IMG_MIC_SIZE + 20 }} />
                            </button>
                        </div>
                    </div>)}
            </div>
        </div>
    );
};

export default ProgressTable;