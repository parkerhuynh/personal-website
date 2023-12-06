import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Link } from 'react-router-dom';


const PaperTable = ({ papers, handleRowDelete, fetchUserData, setPaper, quillInputHandel }) => {
    // Merge paperes have the same date
    const [searchInput, setSearchInput] = useState('');
    const [filterConference, setFilterConference] = useState('');
    const [filterImgEnc, setFilterImgEnc] = useState('');
    const [filterQuesEnc, setFilterQuesEnc] = useState('');
    const [filterFusion, setFilterFusion] = useState('');

    const getFilterOptions = (key) => {
        const unique = new Set(papers.map(item => item[key]));
        return Array.from(unique);
    };
    const conferenceOptions = useMemo(() => getFilterOptions('conference'), [papers]);
    const imgEncOptions = useMemo(() => getFilterOptions('img_encoder'), [papers]);
    const quesEncOptions = useMemo(() => getFilterOptions('ques_encoder'), [papers]);
    const fusionOptions = useMemo(() => getFilterOptions('fusion'), [papers]);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const rowStripedStyle = (index) => ({
        backgroundColor: index % 2 === 1 ? 'rgb(0, 1, 2, 0.5)' : 'rgb(52, 73, 94 , 0.5)'
    });
    const handlePaperClick = (paper_id) => {
        window.location.href = `/paperinfo/${paper_id}`
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const filteredPapers = papers.filter(paper => {
        const searchLower = searchInput.toLowerCase();
        const matchesSearch = searchLower === '' || paper.paper.toLowerCase().includes(searchLower) ||
            paper.name.toLowerCase().includes(searchLower);
        return matchesSearch &&
            (filterConference === '' || paper.conference === filterConference) &&
            (filterImgEnc === '' || paper.img_encoder === filterImgEnc) &&
            (filterQuesEnc === '' || paper.ques_encoder === filterQuesEnc) &&
            (filterFusion === '' || paper.fusion === filterFusion);
    });
    // Sorted and filtered papers
    const sortedAndFilteredPapers = useMemo(() => {
        const sortedPapers = [...filteredPapers].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.year - b.year;
            } else {
                return b.year - a.year;
            }
        });
        return sortedPapers;
    }, [filteredPapers, sortOrder]);
    return (
        <div>

            {filteredPapers == {} ? (null) : (
                <div>
                    <div class="col-6 mt-4">
                        <div class="input-group">
                            <input
                                type="text"
                                class="form-control me-3"
                                placeholder="Search by Paper or Name"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div className="col-3">
                            <select
                                className="form-select"
                                value={filterConference}
                                onChange={(e) => setFilterConference(e.target.value)}
                            >
                                <option value="">All Conferences</option>
                                {conferenceOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div className="col-3">
                            <select
                                className="form-select"
                                value={filterImgEnc}
                                onChange={(e) => setFilterImgEnc(e.target.value)}
                            >
                                <option value="">All Image Encoder</option>
                                {imgEncOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div className="col-3">
                            <select
                                className="form-select"
                                value={filterQuesEnc}
                                onChange={(e) => setFilterQuesEnc(e.target.value)}
                            >
                                <option value="">All Question Encoder</option>
                                {quesEncOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <div className="col-3">
                            <select
                                className="form-select"
                                value={filterFusion}
                                onChange={(e) => setFilterFusion(e.target.value)}
                            >
                                <option value="">All Fusions</option>
                                {fusionOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="table">
                        <table className="table table-dark table-bordered mt-4">
                            <thead>
                                <tr>
                                    <th class='text-center' scope="col" >ID</th>
                                    <th class='text-center' scope="col" style={{ width: "300px" }}>Paper</th>
                                    <th class='text-center' scope="col" >Author</th>
                                    <th class='text-center' scope="col" >Name</th>
                                    <th class='text-center' scope="col" >Conference</th>
                                    <th onClick={toggleSortOrder} style={{ cursor: 'pointer' }} class='text-center' scope="col" >Year {sortOrder === 'asc' ? '↑' : '↓'}</th>
                                    <th class='text-center' scope="col">Img Enc</th>
                                    <th class='text-center' scope="col" >Ques Enc</th>
                                    <th class='text-center' scope="col">Fusion</th>

                                    <th style={{ width: "90px" }} class='text-center' scope="col">Datasets</th>
                                    <th style={{ width: "90px" }} class='text-center' scope="col">Results</th>
                                    <th style={{ width: "40px" }} class='text-center' scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredPapers.map((item, itemIndex) => (
                                    <tr key={itemIndex} style={rowStripedStyle(itemIndex)}>
                                        <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                            <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{itemIndex + 1}</Link>
                                        </td>
                                        <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }} class='text-center' >
                                            <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.paper}</Link>
                                        </td>
                                        <td onDoubleClick={() => handlePaperClick(item.paperid)} className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.author}</Link>
                                        </td>
                                        <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.name}</Link>
                                        </td>
                                        <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.conference}</Link>
                                        </td>
                                        <td onDoubleClick={() => handlePaperClick(item.paperid)} style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                            <Link to={`/paperinfo/${item.paperid}`} style={{ textDecoration: 'inherit' }} class="text-light">{item.year}</Link>
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
                                        <td className="text-center" style={{ verticalAlign: 'middle', textAlign: 'center', }} >
                                            <button onClick={() => handleRowDelete(item.id)} className="btn btn-sm btn-light text-center">
                                                <FontAwesomeIcon icon={faTrashAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


        </div>
    );
};

export default PaperTable;