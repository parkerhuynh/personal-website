import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactLoading from 'react-loading';
import { Link } from 'react-router-dom';
const WorkerList = () => {
    const [workerList, setWorkerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchWorker, setSearchWorker] = useState('')
    const [filteredWorkers, setFilteredWorkers] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/get_woker_list');
            setWorkerList(response.data)
            setFilteredWorkers(response.data)
            if (response.data.length > 0) {
                setLoading(false);
            }


        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    // Search Worker
    const handleSearch = (event) => {
        const query = event.target.value.replace(/\s/g, '');
        setSearchWorker(query);

        const filtered = workerList.filter((worker) =>
            worker.WorkerId.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredWorkers(filtered);
    };
    
    

    // SORT Value
    const handleSort = (column) => {
        if (sortColumn === column) {
            // Reverse the sort order if the same column is clicked again
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set the new sort column and default sort order to ascending
            setSortColumn(column);
            setSortOrder('asc');
        }

        const sorted = [...filteredWorkers].sort((a, b) => {
            if (column === 'WorkerId') {
                // Sort by WorkerID alphabetically
                return a.WorkerId.localeCompare(b.WorkerId);
            } else if (column === 'Count') {
                // Sort by Count numerically
                return a.Count - b.Count;
            } else if (column === 'Approved') {
                return a["Approved"] - b["Approved"];
            } else if (column === 'Rejected') {
                return a["Rejected"] - b["Rejected"];
            } else if (column === 'WorkTimeInSeconds') {
                return new Date(a.WorkTimeInSeconds) - new Date(b.WorkTimeInSeconds);
            } else if (column === 'ques') {
                return a.question_value - b.question_value;
            } else if (column === 'ans') {
                return a.answer_value - b.answer_value;
            } else if (column === 'Submitted') {
                return a["Submitted"] - b["Submitted"];
            } else if (column === 'HistoricalRate') { }
            return a.WorkerId.localeCompare(b.WorkerId);
            
            
        })


        // Reverse the sorted array if the sort order is descending
        if (sortOrder === 'desc') {
            sorted.reverse();
        }

        setFilteredWorkers(sorted);
    };
    

    const addChecking = (worker_id) => {
        setLoading(true);
        axios.post('/add_checking/' + worker_id)
            .then(() => {
                console.log("Done!")
            })
            .then(() => {
                setLoading(false)
            })

        const updatedData = filteredWorkers.map(item => {
            
            if (item.WorkerId === worker_id) {
                item.Checking = "yes"
                return item
            } else {
                return item
            }
        }
        );
        setFilteredWorkers(updatedData)
        setWorkerList(updatedData)
    };
    const removeChecking = (worker_id) => {
        setLoading(true);
        axios.post('/remove_checking/' + worker_id)
            .then(() => {
                console.log("Done!")
            })
            .then(() => {
                setLoading(false)
            })

        const updatedData = filteredWorkers.map(item => {
            
            if (item.WorkerId === worker_id) {
                item.Checking = "no"
                return item
            } else {
                return item
            }
        }
        );
        setFilteredWorkers(updatedData)
        setWorkerList(updatedData)
    };

    const getColorStatus = (count,  approve, reject,pending) => {
        if (pending === count) {
            return {color: "#17202A"}
        } else if (approve === count) {
            return {color: "#69FF07", "text-decoration": "line-through", "background-color": "#EBEDEF"}
        } else if (reject === count) {
            return {color: "#FF0000", "text-decoration": "line-through", "background-color": "#EBEDEF"}
        } else if (approve/(count-pending) > 0.9) {
            if (pending !== 0) {
            return {color: "#27AE60"}} else {
                return {color: "#27AE60", "text-decoration": "line-through", "background-color": "#EBEDEF"}
            }
        } else if (approve/(count-pending) > 0.75) {
            if (pending !== 0) {
                return {color: "#82E0AA"}} else {return {color: "#82E0AA",  "text-decoration": "line-through", "background-color": "#EBEDEF"}}
        } else if (approve/(count-pending) < 0.75) {
            if (pending !== 0) {
            return {color: "#F1948A"}} else {return {color: "#F1948A", "text-decoration": "line-through", "background-color": "#EBEDEF"}}
        } else if (approve/(count-pending) < 0.5) {
            if (pending !== 0) {
            return {color: "#B03A2E"}} else {return {color: "#B03A2E", "text-decoration": "line-through", "background-color": "#EBEDEF"}}
        }
        return {color: '#F1C40F'}; // Default Bootstrap button style
    };

    return (
        <div className='backgound_theme'>
            <div class="container" >
                <div class="row mt-5">
                    <h3 class="mb-4">Worker List</h3>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ReactLoading type="spin" color="#212529" height={300} width={300} />
                    </div>
                ) : (
                    <div>
                        <input type="text" class="form-control" value={searchWorker} onChange={handleSearch} placeholder="Search worker..." />
                        <h4 class="text-info mt-3">List of {filteredWorkers.length} Workers</h4>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col" >#</th>
                                    <th scope="col" >Worker ID </th>
                                    <th scope="col" onClick={() => handleSort('Count')}>Count</th>
                                    <th scope="col" onClick={() => handleSort('Approved')}>Approved</th>
                                    <th scope="col" onClick={() => handleSort('Rejected')}>Rejected</th>
                                    <th scope="col" onClick={() => handleSort('Submitted')}>Pending</th>
                                    <th scope="col" onClick={() => handleSort('WorkTimeInSeconds')}>Avg. Time </th>
                                    <th scope="col" onClick={() => handleSort('ques')}>Q-Value</th>
                                    <th scope="col" onClick={() => handleSort('ans')}>A-Value</th>
                                    <th scope='col'>Hard Decision</th>
                                    <th scope="col">Rate (Last 30 days)</th>
                                    <th scope="col">Rate (Last month)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWorkers.map((row, index) => (
                                    <tr key={index} >
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{index}</span></Link></td>
                                        <td >
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.WorkerId}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.count}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.Approved}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.Rejected}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.Submitted}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.WorkTimeInSeconds}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.question_value}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.answer_value}</span></Link>
                                        </td>
                                        <td>
                                            {row.Checking === "yes" ? (
                                            <button onClick={() => removeChecking(row.WorkerId)} style={{ width: "70px", height: "15px" }} class="btn btn-success"></button>):(null)}
                                            {row.Checking === "no" ? (
                                            <button onClick={() => addChecking(row.WorkerId)}  style={{ width: "70px", height: "15px" }} class="btn btn-light"></button>):(null)}
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} ><span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.Last30DaysApprovalRate}</span></Link>
                                        </td>
                                        <td>
                                            <Link to={`/profile/${row.WorkerId}`} style={{ textDecoration: 'inherit' }} > <span style={getColorStatus(row.count, row.Approved, row.Rejected, row.Submitted)}>{row.LifetimeApprovalRate}</span></Link>
                                        </td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>

    );
};

export default WorkerList;