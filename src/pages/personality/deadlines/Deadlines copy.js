import React, { useState, useEffect, CSSProperties } from 'react';
import axios from 'axios';
import { useAuth } from "../../../components/AuthContext";
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import "../../../App.css";

const Progress = () => {
    const { currentUser } = useAuth();
    const [userInfo, setUserInfo] = useState({});
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        endDate: new Date(),
        notification: '1',
        objective: '',
        note: '',
        timezone: { value: moment.tz.guess(), label: moment.tz.guess() }
    });
    const [editingId, setEditingId] = useState(null);
    const [tempInputData, setTempInputData] = useState({
        endDate: new Date(),
        notification: '1',
        objective: '',
        note: '',
        status: 'no status',
        timezone: { value: moment.tz.guess(), label: moment.tz.guess() }
    });


    const handleEdit = (item) => {
        const orOffset = moment.tz(item.timezone).utcOffset();
        const defOffset = moment.tz(moment.tz.guess()).utcOffset();

        const datatime = moment(item.original_end_date, "DD:MM:YYYY hh:mm:ss Z")
        const differenceInHours = (defOffset - orOffset) / 60;
        const newdatatime = datatime.subtract(differenceInHours, 'hours')
        console.log("Difference in hours:", newdatatime);

        setEditingId(item.id);
        setTempInputData({
            endDate: moment(item.original_end_date, "DD:MM:YYYY hh:mm:ss Z").utc().toDate(),
            // endDate: initialDate,
            endDate_str: item.original_end_date,
            notification: item.notification,
            objective: item.objective,
            note: item.note,
            timezone: { value: item.timezone, label: item.timezone },
            status: item.status
        });
    };

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(response.data);
            fetchUserDeadlines(response.data.id);
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    const fetchUserDeadlines = async (userId) => {
        try {
            const response = await axios.get(`/get_deadlines/${userId}/${moment().tz(moment.tz.guess()).format('Z')}`);
            const sortedDeadlines = response.data.sort((a, b) => b.days_until_given_date - a.days_until_given_date);
            setDeadlines(sortedDeadlines);
        } catch (error) {
            console.error("Error fetching deadlines:", error);
        }
    };

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleDateChange = (field, date) => {
        setForm({ ...form, [field]: date });
    };

    const handleSelectChange = (timezone) => {
        setForm({ ...form, timezone });
    };

    

    const handleRowDelete = async (rowId) => {
        try {
            await axios.post(`/delete_deadline/${rowId}`);
            fetchUserDeadlines(userInfo.id);
        } catch (error) {
            console.error('Error deleting deadline:', error);
        }
    };

    const resetForm = () => {
        setForm({
            endDate: new Date(),
            notification: '1',
            objective: '',
            note: '',
            timezone: form.timezone,

        });
    };

    const formatDate = (date, timezone) => {
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear()
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        var datetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        var labelTimeZone = moment().tz(timezone).format('Z');
        var dateWithLocalZone = [datetime, labelTimeZone].join(" ")
        return dateWithLocalZone;
        // return moment(date).tz(form.timezone.value).format('YYYY-MM-DD HH:mm:ss Z');
    };

    if (!currentUser) {
        return (
            <div className="background-image-repeat">
                <div className="container pt-5 text-center">
                    <h1 className="text-danger pb-5">Warning!</h1>
                    <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
                    <h5 className="text-light">If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
                </div>
            </div>
        );
    }
    const rowStripedStyle = (index) => ({
        backgroundColor: index % 2 === 0 ? 'rgb(0, 1, 2, 0.5)' : 'rgb(52, 73, 94 , 0.5)', // Alternating color for even and odd groups
    });

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
            tempInputData.endDate = formatDate(tempInputData.endDate, tempInputData.timezone.value)
            // tempInputData.status = tempInputData.status.value

            tempInputData.offset = moment().tz(tempInputData.timezone.value).format('Z')
            tempInputData.timezone = tempInputData.timezone.value
            await axios.post(`/update_deadline/${itemId}`, tempInputData).then(async () => {
                fetchUserDeadlines(userInfo.id)
            }
            )

            // Reset temp data and exit edit mode

            setTempInputData({
                endDate: new Date(),
                notification: '1',
                objective: '',
                note: '',
                timezone: { value: moment.tz.guess(), label: moment.tz.guess() }
            });
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };
    const cancel = async () => {
        setEditingId(null);
    };
    const status_options = [
        { value: 'no status', label: 'no status' },
        { value: 'doing', label: 'doing' },
        { value: 'pending', label: 'pending' },
        { value: 'doing', label: 'doing' },
        { value: 'done!', label: 'done!' }
    ]

    return (
        <div className="background-image-repeat">
            <div className="container">
                <h2 className="text-light text-center pt-5 pb-3">Deadlines</h2>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6">
                            <label htmlFor="endDate" className="text-light me-3">End Date:</label>
                            <DatePicker
                                id="endDate"
                                selected={form.endDate}
                                onChange={(date) => handleDateChange('endDate', date)}
                                showTimeSelect
                                dateFormat="Pp"
                                className="form-control"
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <label htmlFor="timezone" className="text-light">Timezone:</label>
                            <Select
                                id="timezone"
                                options={moment.tz.names().map(tz => ({ value: tz, label: tz }))}
                                value={form.timezone}
                                onChange={handleSelectChange}
                                className="basic-single"
                                classNamePrefix="select"
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="notification" className="text-light">Notification:</label>
                            <select
                                id="notification"
                                className="form-control"
                                value={form.notification}
                                onChange={handleInputChange}
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <option key={day} value={day}>{day} day(s) before</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-12">
                            <label htmlFor="objective" className="text-light">Objective:</label>
                            <input
                                id="objective"
                                type="text"
                                className="form-control"
                                value={form.objective}
                                onChange={handleInputChange}
                                placeholder="Enter objective"
                                required
                            />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-12">
                            <label htmlFor="note" className="text-light">Note:</label>
                            <textarea
                                id="note"
                                className="form-control"
                                value={form.note}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Enter note"
                                required
                            />
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <button type="submit" className="btn btn-light">Submit</button>
                    </div>
                </form>
                <div className="table py-4">
                    <table className="table table-dark table-bordered mt-4">
                        <thead>
                            <tr>
                                <th class='text-center' scope="col" style={{ width: "50px" }}>ID</th>
                                <th class='text-center' scope="col" style={{ width: "150px" }}>Objective</th>
                                <th class='text-center' scope="col" >Description</th>
                                <th class='text-center' scope="col" style={{ width: "180px" }}>Deadline</th>
                                <th class='text-center' scope="col" style={{ width: "170px" }}>Times util Deadlines</th>
                                <th class='text-center' scope="col" style={{ width: "100px" }}>Status</th>
                                <th style={{ width: "40px" }} class='text-center' scope="col"></th>


                            </tr>
                        </thead>
                        <tbody>
                            {deadlines.map((item, itemIndex) => (
                                <tr key={itemIndex} style={rowStripedStyle(itemIndex)}>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >{itemIndex + 1}</td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                        {editingId === item.id ?
                                            (<input
                                                style={{ width: "130px" }}
                                                type="text"
                                                value={tempInputData.objective}
                                                onChange={(e) => setTempInputData({ ...tempInputData, objective: e.target.value })}
                                                onKeyPress={(e) => handleKeyPress(e, item.id)}
                                            />) :
                                            (<span onDoubleClick={() => handleEdit(item)}>{item.objective}</span>)
                                        }
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                        {editingId === item.id ?
                                            (<input
                                                style={{ width: "130px" }}
                                                type="text"
                                                value={tempInputData.note}
                                                onChange={(e) => setTempInputData({ ...tempInputData, note: e.target.value })}
                                                onKeyPress={(e) => handleKeyPress(e, item.id)}
                                            />) :
                                            (<span onDoubleClick={() => handleEdit(item)}>{item.note}</span>)
                                        }
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                        {editingId === item.id ?
                                            (<div>
                                                <DatePicker
                                                    id="endDate"
                                                    selected={tempInputData.endDate}
                                                    onChange={(date) => setTempInputData({ ...tempInputData, endDate: date })}
                                                    showTimeSelect
                                                    dateFormat="Pp"
                                                    className="form-control"
                                                />
                                                <label htmlFor="timezone" className="text-light">Timezone:</label>
                                                <Select
                                                    id="timezone"
                                                    options={moment.tz.names().map(tz => ({ value: tz, label: tz }))}
                                                    value={tempInputData.timezone}
                                                    onChange={(timezone) => setTempInputData({ ...tempInputData, timezone: timezone })}
                                                    className="basic-single text-dark"
                                                    classNamePrefix="select"
                                                />

                                            </div>
                                            ) :
                                            (<span onDoubleClick={() => handleEdit(item)}>{item.end_date_render}</span>)
                                        }
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >{item.rest_day_render}</td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                        {editingId === item.id ?
                                            (<div>
                                                <Select
                                                    id="timezone"
                                                    options={status_options}
                                                    value={tempInputData.timezone}
                                                    onChange={(status) => setTempInputData({ ...tempInputData, status: status.value })}
                                                    className="basic-single text-dark"
                                                    classNamePrefix="select"
                                                />
                                            </div>
                                            ) :
                                            (<span onDoubleClick={() => handleEdit(item)}>{item.status}</span>)
                                        }</td>
                                    <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                        {editingId === item.id ?
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Progress;
