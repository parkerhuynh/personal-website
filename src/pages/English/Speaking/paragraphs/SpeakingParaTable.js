import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment-timezone';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const SpeakingDataTable = ({ userInfo, paragraphs, setSpeakingParaData, processProgressData }) => {
    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };
    const [temForm, setTemForm] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [field, setField] = useState(null);
    const [paraOption, setParaOption] = useState("you");
    const [topicOption, setTopicOption] = useState("All Topic");

    const rowStripedStyle = (index) => {
        if (index % 2 === 0) {
            return 'rgb(0, 1, 2, 0.5)'
        } else {
            return 'rgb(52, 73, 94, 0.5)'
        }
    };

    const handleEdit = (item, editfield) => {
        setEditingId(item.id);
        setField(editfield)
        setTemForm(item)
    };

    const saveEdit = async () => {
        try {
            // Update local state first
            setEditingId(null);
            var jsonbody = temForm
            const updatedParas = paragraphs.map(para => {
                if (para.para_id === jsonbody.para_id) {
                    return { ...para, title: jsonbody.title, topic: jsonbody.topic, content: jsonbody.content };
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
    const handleSelectParaOptionChange = async (e) => {
        const selectedValue = e.target.value;
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

    return (
        <div>
            <div className="table py-4">
                <div class="row">
                    <div class="col-2">
                        <select value={paraOption} onChange={handleSelectParaOptionChange} class="form-select form-select-sm text-center" aria-label=".form-select-sm example">
                            <option value="you">Your Paragraphs</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <div class="col-2">
                        <select value={topicOption} onChange={handleSelectTopicChange} class="form-select form-select-sm" aria-label=".form-select-sm example">
                            {uniqueTopic.map(topic => (
                                <option value={topic}>{topic}</option>
                            ))}
                        </select>
                    </div>

                </div>
                <table className="table table-dark table-bordered mt-4">
                    <thead>
                        <tr>
                            <th class='text-center' scope="col" style={{ width: "50px" }}>ID</th>
                            <th class='text-center' scope="col" style={{ width: "200px" }}>Topic</th>
                            <th class='text-center' scope="col" >Title</th>
                            <th class='text-center' scope="col" style={{ width: "170px" }}>Created</th>
                            <th style={{ width: "50px" }} class='text-center' scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterPara.map((item, itemIndex) => (
                            <tr key={itemIndex} style={{ backgroundColor: rowStripedStyle(item, itemIndex) }}>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >{itemIndex + 1}</td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                    {(editingId === item.id) & (field == "topic") ?
                                        (<input
                                            style={{ width: "120px" }}
                                            type="text"
                                            className="form-control"
                                            value={temForm.topic}
                                            onChange={(e) => setTemForm({ ...temForm, topic: e.target.value })}
                                        // onKeyPress={(e) => handleKeyPress(e, item.id)}
                                        />) :
                                        (<span onDoubleClick={() => handleEdit(item, "topic")}>{item.topic}</span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {(editingId === item.id) & (field == "title") ?
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
                                        (<span onDoubleClick={() => handleEdit(item, "title")}>{item.title}</span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {item.date_render}
                                </td>
                                <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {editingId === item.id ?
                                        (<div class="text-center mt-1">
                                            <button onClick={() => saveEdit(item.id)} className="btn btn-light btn-sm">Save</button>
                                            <button onClick={() => cancel()} className="btn btn-light btn-sm mt-3">Cancel</button>
                                        </div>
                                        ) :
                                        (
                                            <div>
                                                <button onClick={() => onDelete(item)} className="btn btn-sm btn-light text-center">
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>)
                                    }

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
