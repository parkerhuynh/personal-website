import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment-timezone';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

const DeadlinesTable = ({ deadlines, onDelete, onDeadlineUpdate, formatDeadline }) => {
    const [editingId, setEditingId] = useState(null);
    const [field, setField] = useState(null);
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
            status: item.status,
            notification: item.notification,
            id: item.id
        })
    };
    const rowStripedStyle = index => ({
        backgroundColor: index % 2 === 0 ? 'rgb(0, 1, 2, 0.5)' : 'rgb(52, 73, 94, 0.5)',
    });
    const cancel = async () => {
        setEditingId(null);
    };
    const handleKeyPress = async (e, itemId) => {
        if (e.key === 'Enter') {
            // Save changes and exit edit mode
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
            console.log(jsonbody)
            await axios.post(`/update_deadline/${itemId}`, jsonbody).then(async () => {
                onDeadlineUpdate()
            }
            )

            // Reset temp data and exit edit mode

            setTempInputData(init_temp);
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };
    const currentTimeInTimezone = new Date()
    const status_options = [
        { value: 'no status', label: 'no status' },
        { value: 'doing', label: 'doing' },
        { value: 'pending', label: 'pending' },
        { value: 'doing', label: 'doing' },
        { value: 'done!', label: 'done!' }
    ]
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
    return (
        <div className="table py-4">
            <table className="table table-dark table-bordered mt-4">
                <thead>
                    <tr>
                        <th class='text-center' scope="col" style={{ width: "50px" }}>ID</th>
                        <th class='text-center' scope="col" style={{ width: "150px" }}>Objective</th>
                        <th class='text-center' scope="col" >Description</th>
                        <th class='text-center' scope="col" style={{ width: "200px" }}>Deadline</th>
                        <th class='text-center' scope="col" style={{ width: "170px" }}>Times util Deadlines</th>
                        <th class='text-center' scope="col" style={{ width: "100px" }}>Status</th>
                        <th style={{ width: "90px" }} class='text-center' scope="col"></th>


                    </tr>
                </thead>
                <tbody>
                    {deadlines.map((item, itemIndex) => (
                        <tr key={itemIndex} style={rowStripedStyle(itemIndex)}>
                            <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >{itemIndex + 1}</td>
                            <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                {(editingId === item.id) & (field =="objective") ?
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
                                {(editingId === item.id) & (field =="description") ?
                                    (<input
                                        style={{ width: "100px" }}
                                        type="text"
                                        value={tempInputData.note}
                                        onChange={(e) => setTempInputData({ ...tempInputData, note: e.target.value })}
                                        onKeyPress={(e) => handleKeyPress(e, item.id)}
                                    />) :
                                    (<span onDoubleClick={() => handleEdit(item, "description")}>{item.note}</span>)
                                }
                            </td>
                            <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                {(editingId === item.id) & (field =="date") ?
                                    (<div>
                                        <DatePicker
                                            id="endDate"
                                            selected={tempInputData.newdatatime}
                                            onChange={(date) => setTempInputData({ ...tempInputData, newdatatime: date })}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            className="form-control"
                                            style={{height: "10px", "font-size":"10px", padding: "5px"}}
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
                                {(editingId === item.id) & (field =="status")  ?
                                    (<div>
                                        <Select
                                            id="timezone"
                                            options={status_options}
                                            value={tempInputData.timezone}
                                            onChange={(status) => setTempInputData({ ...tempInputData, status: status.value })}
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
    );
};

export default DeadlinesTable;