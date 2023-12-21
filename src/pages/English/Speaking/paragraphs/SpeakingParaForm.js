import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment-timezone';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const SpeakingDataForm = ({ userInfo , paragraphs, setSpeakingParaData}) => {
    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };
    const [form, setForm] = useState(initialFormState);

    const para_processing = (text) => {
        var text = text.replace(/\n/g, '.')
        var text = text.replace(/\.\./g, '')
        var text = text.replace(/\.([^\s])/g, '. $1');
        var text = text.replace(`'s`, '');
        var text = text.replace(`'`, '');
        // var raw_para = inputPara.replace(/\n\n/g, ' ')
        return text
    };

    const handleInputChange = (e) => {
        if (e.target.name == "content") {
            setForm({ ...form, [e.target.name]: para_processing(e.target.value) });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }

    };
    function generateRandomCode() {
        return [...Array(12)].map(() => Math.random().toString(36)[2]).join('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            ...form,
            para_id: generateRandomCode(),
        };
        try {
            await axios.post('add_speaking_para', formData);
            setSpeakingParaData([...paragraphs, formData ]);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
        setForm(initialFormState);
    };
    
    return (
        <form onSubmit={handleSubmit}>

            <div>
                <label htmlFor="topic" className="text-light">Topic:</label>
                <input
                    id="topic"
                    name="topic"
                    type="text"
                    className="form-control"
                    value={form.topic}
                    onChange={handleInputChange}
                    placeholder="Enter Topic"
                    required
                />
            </div>
            <div class="my-3">
                <label htmlFor="title" className="text-light">Title:</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Enter Title"
                    required
                />
            </div>

            <div className="row mt-3">
                <div className="col-12">
                    <label htmlFor="content" className="text-light">Content:</label>
                    <textarea
                        id="content"
                        name="content"
                        className="form-control"
                        value={form.content}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter Content"
                        required
                    />
                </div>
            </div>
            <div className="text-center mt-4">
                <button type="submit" className="btn btn-outline-light btn-sm">Submit</button>
            </div>
        </form>
    );
};

export default SpeakingDataForm;
