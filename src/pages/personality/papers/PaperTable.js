import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link } from 'react-router-dom';

const PaperTable = ({ papers, handleRowDelete, fetchUserData, setPaper, quillInputHandel }) => {
    // Merge paperes have the same date

    const rowStripedStyle = (index) => ({
        backgroundColor: index % 2 === 1 ? 'rgb(0, 1, 2, 0.5)' : 'rgb(52, 73, 94 , 0.5)'
    });
    const handlePaperClick = (paper_id) => {
        console.log(paper_id)
        window.location.href = `/paperinfo/${paper_id}`
    };
    console.log(papers)
    return (
        <div>
            {papers == {} ? (null):(
                <div className="table py-4">
                <table className="table table-dark table-bordered mt-4">
                    <thead>
                        <tr>
                            <th class='text-center' scope="col" style={{ width: "30px" }}>ID</th>
                            <th class='text-center' scope="col" style={{ width: "280px" }}>Paper</th>
                            <th class='text-center' scope="col" style={{ width: "120px" }}>Author</th>
                            <th class='text-center' scope="col" style={{ width: "50px" }}>Name</th>
                            <th class='text-center' scope="col" style={{ width: "100px" }}>Img Enc</th>
                            <th class='text-center' scope="col" style={{ width: "100px" }}>Ques Enc</th>
                            <th class='text-center' scope="col" style={{ width: "100px" }}>Fusion</th>

                            <th style={{ width: "90px" }} class='text-center' scope="col">Datasets</th>
                            <th style={{ width: "90px" }} class='text-center' scope="col">Results</th>
                            <th style={{ width: "40px" }} class='text-center' scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {papers.map((item, itemIndex) => (
                            <tr  key={itemIndex} style={rowStripedStyle(itemIndex)}>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                    <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{itemIndex+1}</Link>
                                </td>
                                <td  onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.paper}</Link>
                                </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.author}</Link>
                                </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.name}</Link>
                                </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.img_encoder}</Link>
                                </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.ques_encoder}</Link>
                                    </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.fusion}</Link>
                                </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.datasets.map((dataset) => (<p>{dataset}</p>))}</Link>
                                </td>
                                <td onDoubleClick={() => handlePaperClick(item.paperid)} className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.results.map((result) => (<p>{result}</p>))}</Link>
                                </td>
                                <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center',}} >
                                    <button onClick={() => handleRowDelete(item.id)} className="btn btn-sm btn-light text-center">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
            

        </div>
    );
};

export default PaperTable;