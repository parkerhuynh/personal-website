import React, { useState } from 'react';
import axios from 'axios';
const FileUploadForm = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [fileNameUpload, setFileNameUpload] = useState("mturk_result");
    const [fileNameDownload, setFileNameDownload] = useState("mturk_decision");
    const [resultIndex, setResultIndex] = useState("1");
    const [resultDownloadIndex, setResultDownloadIndex] = useState("1");

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const fileNameUploadChange = (value) => {
        setFileNameUpload(value);
    };
    const fileNameDownloadChange = (value) => {
        setFileNameDownload(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let fileName = ""
        if (fileNameUpload==='mturk_result') {
            fileName = fileNameUpload + "_" + resultIndex + ".csv"
        } else {
            fileName = fileNameUpload + ".csv"
        }
        

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            setLoading(true);
            setUploadStatus(null);

            try {
                const response = await fetch('/upload/' + fileName, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    setUploadStatus('success');
                } else {
                    setUploadStatus('error');
                }

            } catch (error) {
                setUploadStatus('error');
            }

            setLoading(false);
        }
    };
    const handleDownload = () => {
        axios.get(`/download_data/${fileNameDownload}/${resultDownloadIndex}`).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const download_file_name = `mturk_decision_${resultDownloadIndex}.csv`
            link.setAttribute('download', download_file_name);
            document.body.appendChild(link);
            link.click();
        });
    };

    return (
        <div class="container" style={{ "height": "1100px" }}>
            <div class="row mt-5">
                <h3 class="mb-4">Upload</h3>
            </div>
            <div class="row mt-5">
                <form onSubmit={handleSubmit}>
                    <input type="file" onChange={e => handleFileChange(e)} />
                    <div class="row mt-3">
                    <div class="col-4">
                        <select class="form-control text-center" value={fileNameUpload} onChange={(e) => fileNameUploadChange(e.target.value)} >
                            <option value="mturk_result">MTURK RESULT</option>
                            <option value="data_base">DATA BASE</option>
                            <option value="caption">CAPTION</option>
                        </select>
                    </div>
                    {fileNameUpload === "mturk_result" ? (<div class="col-1">
                        <select class="form-control text-center" value={resultIndex} onChange={(e) => setResultIndex(e.target.value)} >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                        </select>
                    </div>) : (null)}
                    <div class="col-1">
                        <button type="submit" class="btn btn-outline-dark" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>

                    </div>
                    </div>
                    {uploadStatus === 'success' && <p class="text-success">File uploaded successfully!</p>}
                    {uploadStatus === 'error' && <p class="text-danger">Error uploading file.</p>}
                </form>
            </div>
            <div class="col-1"></div>


            <div class="row mt-5">
                    <h3 class="mb-4">Download</h3>
            </div>
            <div class="row mt-5">
                    <form onSubmit={handleSubmit}>
                        <div class="row">
                            <div class="col-4">
                                <select class="form-control text-center" value={fileNameDownload} onChange={(e) => fileNameDownloadChange(e.target.value)} >
                                    <option value="mturk_decision">MTURK DECISION</option>
                                    <option value="mturk_result">MTURK RESULT</option>
                                </select>
                            </div>
                            {fileNameDownload !== "mturk_worker" ? (<div class="col-1">
                                <select class="form-control text-center" value={resultDownloadIndex} onChange={(e) => setResultDownloadIndex(e.target.value)} >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                </select>
                            </div>) : (null)}
                            
                            <div class="col-1">
                                <button type="button" class="btn btn-outline-dark" onClick={handleDownload}>Download</button>
                            </div>
                        </div>
                    </form>

                <div class="col-3"></div>
            </div>

        </div>

    );
};

export default FileUploadForm;