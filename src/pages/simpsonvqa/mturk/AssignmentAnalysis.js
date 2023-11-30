import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactLoading from 'react-loading';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
function AssignmentAnalysis() {

    const [assignmentSummary, setAssignmentSummary] = useState({});
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const response = await axios.get(`/assignment_analysis`);
            setAssignmentSummary(response.data);
            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const StatusCounts = Object.keys(assignmentSummary).map(status => ({
        value: status,
        count: assignmentSummary[status],
        fill: status === "Submitted" ? "#2E86C1" : status === "Approved" ? "#27AE60" : "#E74C3C"
    }));


    return (
        <div className='backgound_theme' style={{ height: "1200px" }}>
            <div class="container">
                <div class="row mt-5">
                    <h3 class="mb-4">Assignment Analysis</h3>
                </div>
                <div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <ReactLoading type="spin" color="#212529" height={300} width={300} />
                        </div>
                    ) : (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <PieChart width={1000} height={800}>
                            <Pie
                                data={StatusCounts}
                                dataKey="count"
                                nameKey="value"
                                outerRadius={250}
                                label
                            >
                            </Pie>
                            <Legend />
                        </PieChart>`
                    </div>)}

                </div>
            </div>
        </div>


    );
};
export default AssignmentAnalysis;