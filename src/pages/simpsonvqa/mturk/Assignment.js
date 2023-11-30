import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactLoading from 'react-loading';

function Assignment() {
    const { assignment_id } = useParams();
    const [triples, setTriples] = useState([]);
    const [batch, setBatch] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const response = await axios.get(`/get_one_assig/${assignment_id}`);
            setTriples(response.data.assignment);
            setBatch(response.data.batch);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleWorkerProfile = () => {
        window.location.href = `/profile/${triples[0].WorkerId}`
    };

    const handleWorkerList = () => {
        window.location.href = "/worker_list/"
    };

    const handleRejectClick = () => {
        setLoading(true);
        axios.post('/reject_assignment/' + assignment_id+"/"+batch)
            .then(async () => {
                const response = await axios.get('/next_assignment/' + triples[0].WorkerId);
                const responseData = response.data;
                if (responseData !== "") {
                    window.location.href = `/assignment/${responseData}`
                } else {
                    window.location.href = `/profile/${triples[0].WorkerId}`
                }
            })
            .finally(setLoading(false))
    };
    const handleApproveClick = () => {
        setLoading(true);
        axios.post('/approve_assignment/' + assignment_id+"/"+batch)
            .then(async () => {
                const response = await axios.get('/next_assignment/' + triples[0].WorkerId);
                const responseData = response.data;
                if (responseData !== "") {
                    window.location.href = `/assignment/${responseData}`
                } else {
                    window.location.href = `/profile/${triples[0].WorkerId}`
                }
            })
            .finally(setLoading(false))
    };

    const getColorQuestion = (question) => {
        if (question === 'relevant') {
            return 'text-center text-success'; // Blue
        } 
        return 'text-center text-danger'; // Default Bootstrap button style
    };

    const getColorAsnwer = (answer) => {
        if (answer === 'correct') {
            return {color:"#186A3B"};
        } else if (answer === 'partially_correct') {
            return {color:"#58D68D"}
        } else if (answer === 'ambiguous') {
            return {color: "#884EA0"}
        } else if (answer === 'partially_incorrect'){
            return {color:"#E59866"}
        }
        return {color: '#922B21'}; // Default Bootstrap button style
    };

    return (
        <div className='backgound_theme'>
            <div class="container">
                <div class="row mt-5">
                    <h3 class="mb-4">Assignment</h3>
                    {triples.length > 0? (<h4 class="mt-3 text-info">AssignmentId ID: <span class="text-danger">{triples[0].WorkerId} </span></h4>):(null)}
                    
                    <h5 class="mt-3 text-info">AssignmentId ID: <span class="text-danger">{assignment_id} </span></h5>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ReactLoading type="spin" color="#212529" height={300} width={300} />
                    </div>
                ) : (
                    <div>
                        <div class="row mt-5 d-flex justify-content-around">
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleWorkerProfile()}
                                class="btn btn-sm btn-info">Profile</button>
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleApproveClick()}
                                class="btn btn-sm btn-success">Approve</button>
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleRejectClick()}
                                class="btn btn-sm btn-danger" >Reject</button>
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleWorkerList()}
                                class="btn btn-sm btn-secondary" >Workers</button>
                        </div>
                        <div class="row mt-5">
                            <div class="d-flex flex-wrap">
                                {triples.map((triple, index) => (
                                    <div class="col-4 p-2">
                                        <div class="card">
                                            <img class="card-img-top" src={triple["img_url"]} alt="Card image cap" />
                                            <div class="card-body">
                                                <p class="card-text">Question: {triple["question"]}.</p>
                                                <h4 class={getColorQuestion(triple["question_relevant"])}>{triple["question_relevant"]}.</h4>
                                                <p class="card-text">Answer: {triple["answer"]}.</p>
                                                <h4 class="text-center" style={getColorAsnwer(triple["triple_accuracy"])}>{triple["triple_accuracy"]}.</h4>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                        <div class="row my-5 d-flex justify-content-around">
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleWorkerProfile()}
                                class="btn btn-sm btn-info">Profile</button>
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleApproveClick()}
                                class="btn btn-sm btn-success">Approve</button>
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleRejectClick()}
                                class="btn btn-sm btn-danger" >Reject</button>
                            <button style={{ width: "130px", height: "35px" }} type="button" onClick={() => handleWorkerList()}
                                class="btn btn-sm btn-secondary" >Workers</button>
                        </div>
                    </div>
                )}


            </div>
        </div>


    );
};
export default Assignment;