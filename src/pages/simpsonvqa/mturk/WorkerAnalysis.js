import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactLoading from 'react-loading';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
const WorkerAnaysis = () => {
    const [workerList, setWorkerList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [numberWoker, SetNumberWoker] = useState(50);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [filteredWorkers, setFilteredWorkers] = useState([]);

    const CHARTTHEMECOLOR = "#5D6D7E"


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
    const handleNumberWorker = (event) => {
        const value = event.target.value
        SetNumberWoker(value);
    };

    const handleBarClick = (data) => {
        const workerId = data["WorkerId"];
        window.open(`/profile/${workerId}`, '_blank');
    };
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
                return a.WorkerId.localeCompare(b.WorkerId)

            } else if (column === 'count') {
                return a.count - b.count;

            } else if (column === 'Approval Rate') {
                return a["Approval Rate"] - b["Approval Rate"];

            } else if (column === 'WorkTimeInSeconds') {
                return new Date(a.WorkTimeInSeconds) - new Date(b.WorkTimeInSeconds);

            } else if (column === 'value') {
                return a.value - b.value;

            } else if (column === 'HistoricalRate') { }
            return a.WorkerId.localeCompare(b.WorkerId);
        })


        // Reverse the sorted array if the sort order is descending
        if (sortOrder === 'desc') {
            sorted.reverse();
        }

        setFilteredWorkers(sorted);
    };
    return (
        <div className='backgound_theme'>
            <div class="container" >
                <div class="row">
                    <h3 class="mb-4">Worker Analysis</h3>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ReactLoading type="spin" color="#212529" height={300} width={300} />

                    </div>
                ) : (
                    <div>
                        <div class="row my-3">
                            <div class="col-10">
                                <h4 class="text-info">Top {numberWoker} Hardest Workers</h4>
                            </div>
                            <div class="col-1">
                                <div class="form-group">
                                    <select
                                        className="form-control text-center"
                                        id="people-select"
                                        value={numberWoker}
                                        onChange={handleNumberWorker}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                        <option value="40">40</option>
                                        <option value="50">50</option>
                                        <option value="60">60</option>
                                        <option value="70">70</option>
                                        <option value="80">80</option>
                                        <option value="90">90</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-1">
                            <button type="button" class="btn btn-outline-dark" onClick={() => handleSort('count')}>Sort</button>
                            </div>
                        </div>
                        <div class="row">
                            <ResponsiveContainer width="100%" height={600}>
                                <BarChart data={filteredWorkers.slice(0, numberWoker)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="WorkerId"
                                        height={150} interval={0} angle={-60}
                                        tick={{

                                            fontFamily: "Book Antiqua, Times, serif",
                                            textAnchor: "end"
                                        }} />
                                    <YAxis
                                        width={60}
                                        label={{
                                            value: 'Assignment Count', offset: -4, angle: -90, position: 'left',
                                            style: { textAnchor: 'middle', fill: "#000000" }
                                        }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="count"
                                        onClick={handleBarClick} fill={CHARTTHEMECOLOR} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="border-top"></div>

                        <div class="row my-3 ">
                            <div class="col-8">
                                <h4 class="text-info">Top {numberWoker} Quickest Workers</h4>
                            </div>
                            <div class="col-3">
                                <div class="form-group">
                                    <select
                                        className="form-control text-center"
                                        id="people-select"
                                        value={numberWoker}
                                        onChange={handleNumberWorker}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                        <option value="40">40</option>
                                        <option value="50">50</option>
                                        <option value="60">60</option>
                                        <option value="70">70</option>
                                        <option value="80">80</option>
                                        <option value="90">90</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-1">
                                <button type="button" class="btn btn-outline-dark" onClick={() => handleSort('WorkTimeInSeconds')}>Sort</button>
                            </div>

                        </div>
                        <div class="row">
                            <ResponsiveContainer width="100%" height={600}>
                                <BarChart data={filteredWorkers.slice(0, numberWoker)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="WorkerId"
                                        height={150} interval={0} angle={-60}
                                        tick={{

                                            fontFamily: "Book Antiqua, Times, serif",
                                            textAnchor: "end"
                                        }} />
                                    <YAxis
                                        width={60}
                                        label={{
                                            value: 'Average Working Time', offset: -4, angle: -90, position: 'left',
                                            style: { textAnchor: 'middle', fill: "#000000" }
                                        }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="WorkTimeInSeconds"
                                        onClick={handleBarClick} fill={CHARTTHEMECOLOR} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

            </div>

        </div>


    );
};

export default WorkerAnaysis;