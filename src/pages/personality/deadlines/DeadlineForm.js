import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment-timezone';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const DeadlineForm = ({ userInfo, onDeadlineUpdate }) => {
    const initialFormState = {
        endDate: new Date(),
        notification: '1',
        objective: '',
        note: '',
        timezone: { value: moment.tz.guess(), label: moment.tz.guess() }
    };
    const [form, setForm] = useState(initialFormState);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setForm({ ...form, endDate: date });
    };

    const handleSelectChange = (selectedOption) => {
        setForm({ ...form, timezone: selectedOption });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const end_date = `${moment(form.endDate).format("YYYY-MM-DD HH:mm")}`
        const offset = `${moment().tz(form.timezone.value).format('Z')}`
        const timezone = form.timezone.value
        
        const formData = {
            ...form,
            end_date: end_date,
            user_id: userInfo.id,
            username: userInfo.username,
            offset: offset,
            timezone: timezone
        };
        try {
            await axios.post('add-deadline', formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
        setForm(initialFormState);
        onDeadlineUpdate();
    };

    return (
        <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="endDate" className="text-light me-3">End Date:</label>
                    <DatePicker
                        id="endDate"
                        selected={form.endDate}
                        onChange={handleDateChange}
                        showTimeSelect
                        dateFormat="Pp"
                        className="form-control"
                    />
                </div>
                <div class="my-4 d-flexalign-items-center">
                    <label htmlFor="timezone" className="text-light me-3">Timezone:</label>
                    <Select
                        id="timezone"
                        options={moment.tz.names().map(tz => ({ value: tz, label: tz }))}
                        value={form.timezone}
                        onChange={handleSelectChange}
                        className="basic-single"
                        classNamePrefix="select"/>
                </div>

            <div className="row mt-3">
            <div className="col-md-6">
                    <label htmlFor="objective" className="text-light">Objective:</label>
                    <input
                        id="objective"
                        name="objective"
                        type="text"
                        className="form-control"
                        value={form.objective}
                        onChange={handleInputChange}
                        placeholder="Enter objective"
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="notification" className="text-light">Notification:</label>
                    <select
                        id="notification"
                        name="notification"
                        className="form-control"
                        value={form.notification}
                        onChange={handleInputChange}
                    >   
                    
                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                            <option key={day} value={day}>{day} day(s) before</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-12">
                    <label htmlFor="note" className="text-light">Note:</label>
                    <textarea
                        id="note"
                        name="note"
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
    );
};

export default DeadlineForm;
