import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ProgressTable = ({ progress, handleRowDelete, dayhistory, setdayhistory, fetchUserData, setProgress, quillInputHandel }) => {
    const [editingId, setEditingId] = useState(null);
    const [tempInputData, setTempInputData] = useState();
    const [field, setField] = useState(null);
    // Merge progresses have the same date
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
        backgroundColor: index % 2 === 0 ? 'rgb(0, 1, 2, 0.5)' : 'rgb(52, 73, 94 , 0.5)'
    });
    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;
        setdayhistory(selectedValue);
        fetchUserData()
    };
    const handleEdit = (item, editfield) => {
        setField(editfield)
        setTempInputData({ objective: "", progress: "" });
        setEditingId(item.id);
        setTempInputData({ objective: item.objective, progress: item.progress });

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
                objective: tempInputData.objective,
                progress: tempInputData.progress,
            });
            // Update local state with new data
            setProgress(prevProgress => prevProgress.map(item =>
                item.id === itemId ? { ...item, objective: tempInputData.objective, progress: tempInputData.progress } : item
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

    const cancel = async () => {
        setEditingId(null);
    };
    
    return (
        <div>
            <div class="my-3" >
                <select value={dayhistory} onChange={handleSelectChange} class="form-select form-select-sm" aria-label=".form-select-sm example">
                    <option value="1">today</option>
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
                            <th style={{ width: "170px" }} class='text-center' scope="col" >Date</th>
                            <th style={{ width: "100px" }} class='text-center' scope="col">Time</th>
                            <th style={{ width: "180px" }} class='text-center' scope="col">Objective</th>
                            <th class='text-center' scope="col">Progress</th>
                            <th style={{ width: "40px" }} class='text-center' scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedProgress.map((group, groupIndex) =>
                            group.items.map((item, index) => (
                                <tr key={item.id} style={groupStripedStyle(groupIndex)}>
                                    {index === 0 && (
                                        <td rowSpan={group.items.length} style={{ verticalAlign: 'middle', textAlign: 'center' }}>{group.date_render}</td>
                                    )}
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center'>{item.time}</td>

                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                        {
                                            editingId === item.id & (field == "objective") ? (
                                                <input
                                                    type="text"
                                                    style={{ width: "150px" }}
                                                    value={tempInputData.objective}
                                                    onChange={(e) => setTempInputData({ ...tempInputData, objective: e.target.value })}
                                                    onKeyPress={(e) => handleKeyPress(e, item.id)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span onDoubleClick={() => handleEdit(item, "objective")}>{item.objective}</span>
                                            )
                                        }
                                    </td>

                                    <td style={{ verticalAlign: 'middle', textAlign: 'left' }}>
                                        {
                                            (editingId === item.id) ? (
                                                <div class="">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={tempInputData.progress}
                                                        onChange={(newContent, delta, source, editor) => {
                                                            // Call quillInputHandel to handle the new content
                                                            quillInputHandel(newContent, (progress) => {
                                                                // Update tempInputData with the processed action
                                                                setTempInputData({ ...tempInputData, progress });
                                                            });
                                                        }}
                                                        onKeyPress={(e) => handleKeyPress(e, item.id)}
                                                        modules={modules}
                                                    />
                                                </div>

                                            ) : (
                                                <div onDoubleClick={() => handleEdit(item, "progress")} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.progress) }} />
                                            )}
                                    </td>


                                    <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                        {(editingId === item.id) ?
                                            (<div class="text-center mt-1">
                                                <button onClick={() => saveEdit(item.id)} className="btn btn-light btn-sm">Save</button>
                                                <button onClick={() => cancel()} className="btn btn-light btn-sm mt-3">Cancel</button>
                                            </div>

                                            ) :
                                            (<button onClick={() => handleRowDelete(item.id)} className="btn btn-sm btn-light text-center">
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>)
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProgressTable;