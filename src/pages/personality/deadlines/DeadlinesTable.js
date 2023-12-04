import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment-timezone';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

const DeadlinesTable = ({ deadlines, onDelete, formatDeadline, processItem, setDeadlines }) => {
    const [editingId, setEditingId] = useState(null);
    const [field, setField] = useState(null);
    const [filterStatus, setfilterStatus] = useState('all');
    const [filterObjective, setFilterObjective] = useState("all");

    const init_temp = {
        endDate: new Date(),
        notification: '1',
        objective: '',
        note: '',
        timezone: { value: moment.tz.guess(), label: moment.tz.guess() }
    }
    const [tempInputData, setTempInputData] = useState(init_temp);

    const handleEdit = (item, editfield) => {
        setEditingId(item.id);
        setField(editfield)
        setTempInputData({
            objective: item.objective,
            note: item.note,
            newdatatime: item.newdatatime,
            timezone: item.timezone,
            status: { value: item.status, label: item.status },
            notification: { value: item.notification, label: item.notification },
            id: item.id
        })
    };

    const cancel = async () => {
        setEditingId(null);
    };

    const handleKeyPress = async (e, itemId) => {
        if (e.key === 'Enter') {
            await saveEdit(itemId);
        }
    };

    const saveEdit = async (itemId) => {
        try {
            // Update local state first
            setEditingId(null);
            var jsonbody = tempInputData
            jsonbody.end_date = `${moment(jsonbody.newdatatime).format("YYYY-MM-DD HH:mm")}`
            jsonbody.timezone = jsonbody.timezone.value
            // console.log(jsonbody.status)
            jsonbody.status = jsonbody.status.value
            // console.log(jsonbody.notification)
            jsonbody.notification = jsonbody.notification.value
            const update_deadlines = deadlines
            const index = deadlines.findIndex(deadline => deadline.id === jsonbody.id);
            if (index !== -1) {
                update_deadlines[index] = processItem(jsonbody)
                
            }
            setDeadlines(update_deadlines)

            

            await axios.post(`/update_deadline/${itemId}`, jsonbody).then(async () => {
                // onDeadlineUpdate()
            }
            )

            // Reset temp data and exit edit mode

            setTempInputData(init_temp);
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };
    
    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '30px',
            height: '30px',
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '30px',
            padding: '0 6px'
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '30px',
        }),
    };

    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;
        setfilterStatus(selectedValue);
    };

    const handleSelectObjectiveChange = (e) => {
        const selectedValue = e.target.value;
        setFilterObjective(selectedValue);
    };

    const rowStripedStyle = (item, index) => {
        if (item.status == "done") {
            return 'rgb(26, 188, 156, 0.5)'
        }
        if (item.status == "terminated") {
            return 'rgb(211, 84, 0 , 0.4)'
        }
        if ((item.expired >= 0) & (item.expired < item.notification)) {
            return 'rgb(241, 196, 15 , 0.4)'
        }
        if (item.expired < 0) {
            return 'rgb(169, 50, 38 , 0.4)'
        }
        
        if (index % 2 === 0) {
            return 'rgb(0, 1, 2, 0.5)'
        } else {
            return 'rgb(52, 73, 94, 0.5)'
        }
    };

    const notify_options = [1, 2, 3, 4, 5, 6, 7].map(day => (
        { value: day, label: day }
    ))

    const status_options = [
        { value: 'no status', label: 'no status' },
        { value: 'doing', label: 'doing' },
        { value: 'pending', label: 'pending' },
        { value: 'done', label: 'done' },
        { value: 'terminated', label: 'terminated' }
        
    ]

    const objectives = deadlines.map(example => example.objective);
    const uniqueObjectivesSet = new Set(objectives);
    const uniqueObjectives = [...uniqueObjectivesSet];
    uniqueObjectives.unshift('all')
    const currentTimeInTimezone = new Date()

    var filterData = deadlines.filter(item => {

        if (filterStatus === "all") {
            return true
        }

        if (filterStatus == "expired") {
            return item.expired < 0
        }

        if (filterStatus == "unexpired") {

            return item.expired >= 0
        }
        else if (item.status == filterStatus) {
            return true
        }
        
    });

    filterData = filterData.filter(item => {

        if (filterObjective === "all") {
            return true
        } else if (item.objective == filterObjective) {
            return true
        }
    });

    return (
        <div>
            <div class="row">
                <div class="my-3 col-3" >
                    <select value={filterStatus} onChange={handleSelectChange} class="form-select form-select-sm" aria-label=".form-select-sm example">
                        <option value="all">All</option>
                        <option value="unexpired">Unexpired</option>
                        <option value="expired">Expired</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done!</option>
                        <option value="pending">Pending</option>
                        <option value="no status">no status</option>
                        <option value="terminated">terminated</option>
                    </select>
                </div>

                <div class="my-3 col-3" >
                    <select value={filterObjective} onChange={handleSelectObjectiveChange} class="form-select form-select-sm" aria-label=".form-select-sm example">
                        {uniqueObjectives.map(objective => (
                            <option value={objective}>{objective}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table py-4">
                <table className="table table-dark table-bordered mt-4">
                    <thead>
                        <tr>
                            <th class='text-center' scope="col" style={{ width: "50px" }}>ID</th>
                            <th class='text-center' scope="col" style={{ width: "150px" }}>Objective</th>
                            <th class='text-center' scope="col" >Description</th>
                            <th class='text-center' scope="col" style={{ width: "150px" }}>Deadline</th>
                            <th class='text-center' scope="col" style={{ width: "170px" }}>Times util Deadlines</th>
                            <th class='text-center' scope="col" style={{ width: "120px" }}>Status</th>
                            <th class='text-center' scope="col" style={{ width: "90px" }}>Notify</th>
                            <th style={{ width: "90px" }} class='text-center' scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterData.map((item, itemIndex) => (
                            <tr key={itemIndex} style={{ backgroundColor: rowStripedStyle(item, itemIndex) }}>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >{itemIndex + 1}</td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                    {(editingId === item.id) & (field == "objective") ?
                                        (<input
                                            style={{ width: "120px" }}
                                            type="text"
                                            value={tempInputData.objective}
                                            onChange={(e) => setTempInputData({ ...tempInputData, objective: e.target.value })}
                                            onKeyPress={(e) => handleKeyPress(e, item.id)}
                                        />) :
                                        (<span onDoubleClick={() => handleEdit(item, "objective")}>{item.objective}</span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {(editingId === item.id) & (field == "description") ?
                                        (<input
                                            style={{ width: "95%" }}
                                            type="text"
                                            value={tempInputData.note}
                                            onChange={(e) => setTempInputData({ ...tempInputData, note: e.target.value })}
                                            onKeyPress={(e) => handleKeyPress(e, item.id)}
                                        />) :
                                        (<span onDoubleClick={() => handleEdit(item, "description")}>{item.note}</span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                    {(editingId === item.id) & (field == "date") ?
                                        (<div>
                                            <DatePicker
                                                id="endDate"
                                                selected={tempInputData.newdatatime}
                                                onChange={(date) => setTempInputData({ ...tempInputData, newdatatime: date })}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="form-control"
                                                style={{ height: "10px", "font-size": "10px", padding: "5px" }}
                                            />
                                            <label htmlFor="timezone" className="text-light">Timezone:</label>
                                            <Select
                                                id="timezone"
                                                options={moment.tz.names().map(tz => ({ value: tz, label: tz }))}
                                                value={tempInputData.timezone}
                                                onChange={(timezone) => setTempInputData({ ...tempInputData, timezone: timezone })}
                                                className="basic-single text-dark"
                                                classNamePrefix="select"
                                                styles={customStyles}
                                            />
                                        </div>
                                        ) :
                                        (<span onDoubleClick={() => handleEdit(item, "date")}>{item.end_date_render}</span>)
                                    }
                                </td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >{formatDeadline(item.current_tz_end_date, currentTimeInTimezone)}</td>
                                <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                    {(editingId === item.id) & (field == "status") ?
                                        (<div>
                                            <Select
                                                id="timezone"
                                                options={status_options}
                                                value={tempInputData.status}
                                                onChange={(status) => setTempInputData({ ...tempInputData, status: status })}
                                                className="basic-single text-dark"
                                                classNamePrefix="select"
                                                styles={customStyles}

                                            />
                                        </div>
                                        ) :
                                        (<span onDoubleClick={() => handleEdit(item, "status")}>{item.status}</span>)
                                    }
                                </td>
                                <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {(editingId === item.id) & (field == "notify") ?
                                        (<div>
                                            <Select
                                                id="timezone"
                                                options={notify_options}
                                                value={tempInputData.notification}
                                                onChange={(notify) => setTempInputData({ ...tempInputData, notification: notify })}
                                                className="basic-single text-dark"
                                                classNamePrefix="select"
                                                styles={customStyles}

                                            />
                                        </div>
                                        ) :
                                        (<span onDoubleClick={() => handleEdit(item, "notify")}>{item.notification}</span>)
                                    }
                                </td>
                                <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                    {editingId === item.id ?
                                        (<div class="text-center mt-1">
                                            <button onClick={() => saveEdit(item.id)} className="btn btn-light btn-sm">Save</button>
                                            <button onClick={() => cancel()} className="btn btn-light btn-sm mt-3">Cancel</button>
                                        </div>
                                        ) :
                                        (<button onClick={() => onDelete(item.id)} className="btn btn-sm btn-light text-center">
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>)
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

export default DeadlinesTable;