import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactLoading from 'react-loading';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

function Search() {
    const [searchCategory, setSearchCategory] = useState("assignment");
    const [searchValue, setSearchValue] = useState("");
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(false);


    const handleSearchCategory = (event) => {
        const value = event.target.value
        setResult([])
        setSearchCategory(value);
    };

    const handleSearch = (event) => {
        const query = event.target.value.replace(/\s/g, '');
        setSearchValue(query);
    };

    const handleSubmit = () => {
        setLoading(true);
        axios.get('/search_engine/' + searchCategory + '/' + searchValue).then((response) => {
            setResult(response.data)
            if (response.data.length > 0) { setMessage(false) }
            else { setMessage(true) }
        }
        )
            .finally(setLoading(false))
    };


    return (
        <div className='backgound_theme'>
            <div class="container" style={{ height: "800px" }}>
                <div class="row mt-5">
                    <h3 class="mb-4">Search Engine</h3>
                </div>
                <div>
                    <div class="col-2 form-group">
                        <select
                            className="form-control text-center"
                            id="people-select"
                            value={searchCategory}
                            onChange={handleSearchCategory}
                        >
                            <option value="assignment">Assisgnment</option>
                            <option value="profile">Worker</option>
                            <option value="HIT">HIT</option>
                        </select>
                    </div>
                    <div class="my-3">
                        <input type="text" class="form-control" value={searchValue} onChange={handleSearch} placeholder="Search ..." />
                    </div>
                    <div class="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary my-3" onClick={() => handleSubmit()} style={{ width: "200px" }}>
                            Submit
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ReactLoading type="spin" color="#212529" height={300} width={300} />
                    </div>
                ) : (
                    <div>
                        <div class="row">
                            {result.length > 0 ? (
                                <div>
                                    {searchCategory === "profile" ? (
                                        <table class="table ">
                                            <thead>
                                                <tr class="text-center">
                                                    <th scope="col">#</th>
                                                    <th scope="col">Worker ID</th>
                                                    <th scope="col">Count</th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-center">
                                                {result.map((row, index) => (
                                                    <tr>
                                                        <td ><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{index}</Link></td>
                                                        <td><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{row.WorkerId}</Link></td>
                                                        <td><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{row.count}</Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (null)}
                                    {searchCategory === "assignment" ? (
                                        <table class="table ">
                                            <thead>
                                                <tr class="text-center">
                                                    <th scope="col">#</th>
                                                    <th scope="col">Assignment ID</th>
                                                    <th scope="col">Assignment Status</th>
                                                    <th scope="col">Working Time</th>
                                                    <th scope="col">Worker ID</th>
                                                    <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-center">
                                                {result.map((row, index) => (
                                                    <tr>
                                                        <td ><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{index}</Link></td>
                                                        <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }}>{row.AssignmentId}</Link></td>
                                                        <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }}>{row.AssignmentStatus}</Link></td>
                                                        <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }}>{row.WorkTimeInSeconds}</Link></td>
                                                        <td><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{row.WorkerId}</Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (null)}
                                    {searchCategory === "HIT" ? (
                                        <table class="table ">
                                            <thead>
                                                <tr class="text-center">
                                                    <th scope="col">#</th>
                                                    <th scope="col">HIT ID</th>
                                                    <th scope="col">Assignment ID</th>
                                                    <th scope="col">Assignment Status</th>
                                                    <th scope="col">Working Time</th>
                                                    <th scope="col">Worker ID</th>
                                                    <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody class="text-center">
                                                {result.map((row, index) => (
                                                    <tr>
                                                        <td ><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{index}</Link></td>
                                                        <td ><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{row.HITId}</Link></td>
                                                        <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }}>{row.AssignmentId}</Link></td>
                                                        <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }}>{row.AssignmentStatus}</Link></td>
                                                        <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }}>{row.WorkTimeInSeconds}</Link></td>
                                                        <td><Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} >{row.WorkerId}</Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (null)}

                                </div>
                            ) : (<div>
                                {message ? (<p class="text-center text-danger">Oops! No Matching Results </p>) : (null)}
                            </div>)}
                        </div>
                    </div>

                )}
            </div>
        </div>
    );
};
export default Search;