import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const ProgressForm = ({ inputData, handleSubmit, handleInputChange }) => {
    

    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [
                {
                    color: ['red',
                    'blue',
                    'yellow',
                    'white',
                    'green',
                    'orange',
                    'pink',
                    'purple',
                    'lime',
                    'magenta',
                    'cyan',
                    'silver',
                    'gold',
                    'teal',
                    'turquoise',
                    'lavender',
                    'coral'],
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

    return (
        <div>
            <div className="container pt-4">
                <h2 className="text-light text-center">Progress</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="objective"><h4 className="text-light px-2">Object</h4></label>
                        <input
                            type="text"
                            className="form-control"
                            id="objective"
                            name="objective"
                            placeholder="Enter objective"
                            value={inputData.objective}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="progress"><h4 className="text-light px-2 pt-3">Actions</h4></label>
                        <ReactQuill
                            theme="snow"
                            value={inputData.progress}
                            onChange={handleInputChange}
                            modules={modules}
                        />
                    </div>
                    <div className="d-flex justify-content-center">
                        <div className="text-center pt-3">
                            <button type="submit" className="btn btn-light">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default ProgressForm;