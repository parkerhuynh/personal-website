import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactLoading from 'react-loading';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

function WorkerProfile() {
    const { worker_id } = useParams();
    const [workerProfile, setWorkerProfile] = useState([]);
    const [historicalRate, setHistoricalRate] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [batchFilter, setBatchFilter] = useState("All");
    const [questionCategory, setQuestionCategory] = useState({});
    const [answerCategory, setAnswerCategory] = useState({});
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`/get_single_worker_assigs/${worker_id}`);

            setWorkerProfile(response.data.assig_list)
            setHistoricalRate(response.data.historical_statistic)
            setQuestionCategory(response.data.question_category_count)
            setAnswerCategory(response.data.answer_category_count)
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };




    const getColorClassName = (status) => {
        if (status === 'Submitted') {
            return 'btn btn-primary'; // Blue
        } else if (status === 'Rejected') {
            return 'btn btn-danger'; // Red
        } else if (status === 'Approved') {
            return 'btn btn-success'; // Green
        }
        return 'btn'; // Default Bootstrap button style
    };

    const handleAssigmentClick = (assigment_id) => {
        window.location.href = `/assignment/${assigment_id}`
    };

    const handleRejectRest = () => {
        setLoading(true);
        axios.post('/reject_worker_rest/' + worker_id)
            .then(() => {
                console.log("Done!")
            })
            .then(() => {
                setLoading(false)
            })

        const updatedData = workerProfile.map(item => {
            if (item.AssignmentStatus === "Submitted") {
                item.AssignmentStatus = "Rejected"
                return item
            } else {
                return item
            }
        }
        );
        setWorkerProfile(updatedData)

    };

    const handleApproveRest = () => {
        setLoading(true);
        axios.post('/approve_worker_rest/' + worker_id)
            .then(() => {
                console.log("Done!")
            })
            .then(() => {
                setLoading(false)
            })

        const updatedData = workerProfile.map(item => {
            if (item.AssignmentStatus === "Submitted") {
                item.AssignmentStatus = "Approved"
                return item
            } else {
                return item
            }
        }
        );
        setWorkerProfile(updatedData)
    };
    const handleStatus = (event) => {
        const query = event.target.value.replace(/\s/g, '');
        setStatusFilter(query);
    };
    const handleBatch = (event) => {
        const query = event.target.value
        setBatchFilter(query);
    };

    const filterData = workerProfile.filter(item => {
        if (batchFilter === "All") {
            var batchCondition = true
        } else {
            const integerValue = parseInt(batchFilter);
            var batchCondition = item.Batch === integerValue;
            
        }
        if (statusFilter === "All") {
            var  statusCondition = true; // No filters, return all items
        } else {
            var statusCondition = item.AssignmentStatus === statusFilter;
        }
        
        
        
        // console.log(batchCondition)
        // console.log(statusCondition)
        // console.log("aasd")
        return  statusCondition & batchCondition;
    });

    const main_statusCounts = {
        "Submitted": 0,
        "Approved": 0,
        "Rejected": 0
    };

    workerProfile.forEach(assignment => {
        const status = assignment["AssignmentStatus"];
        if (main_statusCounts.hasOwnProperty(status)) {
            main_statusCounts[status]++;
        }
    });

    const MainStatusCounts = Object.keys(main_statusCounts).map(status => ({
        value: status,
        count: main_statusCounts[status],
        fill: status === "Submitted" ? "#2E86C1" : status === "Approved" ? "#27AE60" : "#E74C3C"
    }));

    const sub_statusCounts = {
        "Submitted": 0,
        "Approved": 0,
        "Rejected": 0
    };

    filterData.forEach(assignment => {
        const status = assignment["AssignmentStatus"];
        if (sub_statusCounts.hasOwnProperty(status)) {
            sub_statusCounts[status]++;
        }
    });

    const QuestionCounts = Object.keys(questionCategory).map(question => ({
        value: question,
        count: questionCategory[question],
        fill: question === "relevant" ? "#27AE60" : "#E74C3C"
    }));

    const AnswerCounts = Object.keys(answerCategory).map(question => ({
        value: question,
        count: answerCategory[question],
        fill: question === "incorrect" ? "#922B21" : question === "partially_correct" ? "#58D68D" : question === "ambiguous" ? "#884EA0" : question === "partially_incorrect" ? "#E59866" : "#186A3B"
    }));

    const SubStatusCounts = Object.keys(sub_statusCounts).map(status => ({
        value: status,
        count: sub_statusCounts[status],
        fill: status === "Submitted" ? "#2E86C1" : status === "Approved" ? "#27AE60" : "#E74C3C"
    }));
    const addChecking = (worker_id) => {
        setLoading(true);
        axios.post('/add_checking/' + worker_id)
            .then(() => {
                console.log("Done!")
            })
            .then(() => {
                setLoading(false)
            })
    };

    const handleWorkerList = () => {
        window.location.href = "/worker_list/"
    };

    const sum_main = MainStatusCounts.reduce((total, item) => total + item.count, 0);
    const sum_sub = SubStatusCounts.reduce((total, item) => total + item.count, 0);
    return (
        <div className='backgound_theme'>
            <div class="container">
                <div class="row mt-5">
                    <h3 class="mb-4">Worker profile</h3>
                </div>
                <h5 class="mt-3 text-info">Worker ID: <span class="text-danger">{worker_id} </span></h5>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ReactLoading type="spin" color="#212529" height={300} width={300} />
                    </div>
                ) : (
                    <div>
                        <div class="row">
                            <div class="col-4">
                                <table class="table ">
                                    <thead>
                                        <tr class="text-center">
                                            <th scope="col">#</th>
                                            <th scope="col">Feature </th>
                                            <th scope="col">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr key={1}>
                                            <td>1</td>
                                            <td>Last 30 Days Approval Rate</td>
                                            <td class="text-center">{historicalRate.Last30DaysApprovalRate}</td>
                                        </tr>
                                        <tr key={2}>
                                            <td>2</td>
                                            <td>Life Time Approval Rate</td>
                                            <td class="text-center">{historicalRate.LifetimeApprovalRate}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="row">
                                    <button type="button" onClick={() => handleApproveRest()} class="btn btn-success mt-3">Approve</button>
                                    <button type="button" onClick={() => handleRejectRest()} class="btn btn-danger mt-3">Reject</button>
                                    <button type="button" onClick={() => addChecking(worker_id)} class="btn btn-info mt-3" >Hard Decision</button>
                                    <button type="button" onClick={() => handleWorkerList(worker_id)} class="btn btn-warning mt-3">Worker List</button>
                                </div>
                            </div>
                            <div class="col-8" >
                                <div class="row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div class="col-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <PieChart width={300} height={300}>
                                            <Pie
                                                data={QuestionCounts}
                                                dataKey="count"
                                                nameKey="value"
                                                outerRadius={70}
                                                label
                                            >
                                            </Pie>
                                            <Legend />
                                        </PieChart>
                                    </div>
                                    <div class="col-6" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <PieChart width={500} height={300}>
                                            <Pie
                                                data={AnswerCounts}
                                                dataKey="count"
                                                nameKey="value"
                                                outerRadius={70}
                                                label
                                            >
                                            </Pie>
                                            <Legend />
                                        </PieChart>`
                                    </div>
                                </div>
                                <div class="row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div class="col-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <PieChart width={300} height={300}>
                                            <Pie
                                                data={MainStatusCounts}
                                                dataKey="count"
                                                nameKey="value"
                                                outerRadius={70}
                                                label
                                            >
                                            </Pie>
                                            <Legend />
                                        </PieChart>`
                                    </div>
                                    {sum_sub === sum_main ? (null) : (
                                        <div class="col-4" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <PieChart width={300} height={300}>
                                                <Pie
                                                    data={SubStatusCounts}
                                                    dataKey="count"
                                                    nameKey="value"
                                                    outerRadius={70}
                                                    label
                                                >
                                                </Pie>
                                                <Legend />
                                            </PieChart>`
                                        </div>
                                    )}


                                </div>


                            </div>
                        </div>

                        <div class="border-top  my-5"></div>
                        <div class="row">
                            <div class="col-2 form-group">
                                <select
                                    className="form-control text-center"
                                    value={statusFilter}
                                    onChange={handleStatus}

                                >   <option value="All">All</option>
                                    <option value="Submitted">Submitted</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div class="col-2 form-group">
                                <select
                                    className="form-control text-center"
                                    value={batchFilter}
                                    onChange={handleBatch}

                                >
                                    <option value="All">All</option>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4</option>
                                    <option value={5}>5</option>
                                    <option value={6}>6</option>
                                </select>
                            </div>

                        </div>

                        <h5 class="my-3 text-center">There are {filterData.length} assignments</h5>
                        <div class="row">
                            <table class="table text-center">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Assignment ID</th>
                                        <th scope="col">Assignment Status</th>
                                        <th scope="col">Working Time</th>
                                        <th scope="col">Average Value</th>
                                        <th scope="col">Batch</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterData.map((row, index) => (
                                        <tr key={index}>
                                            <td>{index}</td>
                                            <td><Link to={`/assignment/${row.AssignmentId}`} style={{ textDecoration: 'inherit' }} > {row.AssignmentId}</Link></td>
                                            <td><button style={{ width: "70px", height: "15px" }}
                                                type="button" onClick={() => handleAssigmentClick(row.AssignmentId)} class={getColorClassName(row.AssignmentStatus)}></button></td>
                                            <td>{row.WorkTimeInSeconds}</td>
                                            <td>{row.average.toFixed(2)}</td>
                                            <td>{row.Batch}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>


                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default WorkerProfile;