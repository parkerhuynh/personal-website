import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const PaperForm = ({ inputData, handleSubmit, handleInputChange, setInputData}) => {
    const [datasetCount, setDatasetCount] = useState(1);
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
    const addDataset = () => {
        setDatasetCount(prevCount => prevCount + 1);
    };

    const deleteDataset = (index) => {
        setInputData(prevInputData => {
          const newData = { ...prevInputData };
          delete newData[`dataset_${index}`];
          delete newData[`result_${index}`];
          return newData;
        });
        setDatasetCount(prevCount => prevCount - 1);
      };

    const renderInputs = () => {
        let inputs = [];
        for (let i = 1; i <= datasetCount; i++) {
            inputs.push(
                <div key={i} class="d-flex justify-content-center">
                    <div class="me-4">
                        <label class="text-light text-center">
                            Dataset {i}
                            <input
                                className="form-control"
                                type="text"
                                name={`dataset_${i}`}
                                value={inputData[`dataset_${i}`] || ''}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />

                        </label>
                    </div>
                    <div class="text-tiny">
                        <label class="text-light text-center">
                            Result {i}
                            <input
                                type="text"
                                className="form-control"
                                name={`result_${i}`}
                                value={inputData[`result_${i}`] || ''}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </label>
                        
                    </div>
                    <div class="d-flex align-items-end">
                        <button type="button" className="btn btn-light bn-sm ms-3" onClick={() => deleteDataset(i)}>Delete</button>
                    </div>
                    
                    
                </div>
            );
        }
        return inputs;
    };

    return (
        <div>
            <div className="container pt-4">

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="paper"><h6 className="text-light px-2">Title</h6></label>
                        <input
                            type="text"
                            className="form-control"
                            id="paper"
                            name="paper"
                            placeholder="Enter Title"
                            value={inputData.paper}
                            onChange={(e) => handleInputChange(null, e)}
                            required
                        />
                    </div>
                    <div class="row">
                        <div className="form-group pt-2 col-4">
                            <label htmlFor="author"><h6 className="text-light px-2">Author</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="author"
                                name="author"
                                placeholder="Enter Author"
                                value={inputData.author}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>
                        <div className="form-group pt-2 col-2">
                            <label htmlFor="name"><h6 className="text-light px-2">Name</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                placeholder="Enter Name"
                                value={inputData.name}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>
                        <div className="form-group pt-2 col-2">
                            <label htmlFor="conference"><h6 className="text-light px-2">Confrence</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="conference"
                                name="conference"
                                placeholder="Enter Confrence"
                                value={inputData.conference}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>
                        <div className="form-group pt-2 col-2">
                            <label htmlFor="year"><h6 className="text-light px-2">Year</h6></label>
                            <input
                                type="number"
                                className="form-control"
                                id="year"
                                name="year"
                                placeholder="Enter Year"
                                value={inputData.year}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>
                    </div>
                    <div class="row">
                    <div className="form-group pt-2 col-10">
                            <label htmlFor="author"><h6 className="text-light px-2">Link</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="link"
                                name="link"
                                placeholder="Enter Author"
                                value={inputData.link}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>

                    </div>

                    <div class="row">
                        <div className="form-group pt-2 col-3">
                            <label htmlFor="img_encoder"><h6 className="text-light px-2">Image Encoder</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="img_encoder"
                                name="img_encoder"
                                placeholder="Enter Image Encoder"
                                value={inputData.img_encoder}
                                onChange={(e) => handleInputChange(null, e)}
                            />
                        </div>
                        <div className="form-group pt-2 col-3">
                            <label htmlFor="ques_encoder"><h6 className="text-light px-2">Question Encoder</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="ques_encoder"
                                name="ques_encoder"
                                placeholder="Enter Question Encoder"
                                value={inputData.ques_encoder}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>
                        <div className="form-group pt-2 col-3">
                            <label htmlFor="fusion"><h6 className="text-light px-2">Fusion</h6></label>
                            <input
                                type="text"
                                className="form-control"
                                id="fusion"
                                name="fusion"
                                placeholder="Enter Fusion Machine Type"
                                value={inputData.fusion}
                                onChange={(e) => handleInputChange(null, e)}
                                required
                            />
                        </div>
                    </div>
                    <div class="row mt-4">
                        <h6 className="text-light ps-4">Results</h6>
                        <div class="col-6">
                            {renderInputs()}
                            <div class="mt-2 text-center">
                                <button type="button" className="btn btn-light bn-sm" onClick={addDataset}>Add Another Dataset</button>
                            </div>
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="abtract"><h6 className="text-light px-2 pt-3">Abtract</h6></label>
                        <ReactQuill
                            theme="snow"
                            value={inputData.abstract}
                            onChange={(content) => handleInputChange('abstract', content)}
                            modules={modules}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contribtions"><h6 className="text-light px-2 pt-3">Contribtions</h6></label>
                        <ReactQuill
                            theme="snow"
                            value={inputData.contributions}
                            onChange={(content) => handleInputChange('contributions', content)}
                            modules={modules}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="problems"><h6 className="text-light px-2 pt-3">Problems</h6></label>
                        <ReactQuill
                            theme="snow"
                            value={inputData.problems}
                            onChange={(content) => handleInputChange('problems', content)}
                            modules={modules}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="structure"><h6 className="text-light px-2 pt-3">Structure</h6></label>
                        <ReactQuill
                            theme="snow"
                            value={inputData.structure}
                            onChange={(content) => handleInputChange('structure', content)}
                            modules={{
                                toolbar: [
                                    ['code-block', 'image', 'link', 'formula'],
                                ],
                                clipboard: {
                                    // Extend clipboard module to handle mixed content better
                                    matchVisual: false,
                                },
                                formula: true,
                            }}
                        />
                    </div>
                    
                    <div className="d-flex justify-content-center">
                        <div className="text-center my-3">
                            <button type="submit" className="btn btn-light">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default PaperForm;