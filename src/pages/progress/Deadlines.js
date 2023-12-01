import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../components/AuthContext";
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment-timezone';

import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import "../../App.css";

const Progress = () => {
    const { currentUser } = useAuth();
    const [userInfo, setUserInfo] = useState({});
    const [deadlines, setDeadlines] = useState([]);
    const [form, setForm] = useState({
        startDate: new Date(),
        endDate: new Date(),
        notification: '1',
        objective: '',
        note: '',
        timezone: { value: moment.tz.guess(), label: moment.tz.guess() }
    });

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
            console.log(`/get_deadlines/${userId}/${moment().tz(moment.tz.guess()).format('Z')}`)
            const response = await axios.get(`/get_deadlines/${userId}/${moment().tz(moment.tz.guess()).format('Z')}`);
            const sortedDeadlines = response.data.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            ...form,
            startDate: formatDate(form.startDate, form.timezone.value),
            endDate: formatDate(form.endDate, form.timezone.value),
            user_id: userInfo.id,
            username: userInfo.username,
            timezone: moment().tz(form.timezone.value).format('Z')
        };
        console.log(formData)

        try {
            await axios.post('add-deadline', formData);
            fetchUserDeadlines(userInfo.id);
            resetForm();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
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
            startDate: new Date(),
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
    console.log(deadlines)
    return (
        <div className="background-image-repeat">
            <div className="container">
                <h2 className="text-light text-center pt-5 pb-3">Deadlines</h2>
                <form onSubmit={handleSubmit}>
                <div className="row">
                        <div className="col-md-6">
                            <label htmlFor="startDate" className="text-light me-3">Start Date:</label>
                            <DatePicker
                                id="startDate"
                                selected={form.startDate}
                                onChange={(date) => handleDateChange('startDate', date)}
                                showTimeSelect
                                dateFormat="Pp"
                                className="form-control"
                            />
                        </div>
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
                                        <th class='text-center' scope="col" style={{ width: "200px" }}>Times util Deadlines</th>


                                    </tr>
                                </thead>
                                <tbody>
                                    {deadlines.map((item, itemIndex) => (
                                        <tr onDoubleClick={() => handleRowDelete(item.id)} key={itemIndex}>
                                            <td class='text-center' >{itemIndex}</td>
                                            <td class='text-center' >{item.objective}</td>
                                            <td class='text-center'>{item.note}</td>
                                            <td class='text-center' >{item.end_date}</td>
                                            <td class='text-center' >{item.rest_day_render}</td>
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
