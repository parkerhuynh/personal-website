import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../components/AuthContext";
import moment from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import DeadlineForm from './DeadlineForm';
import DeadlinesTable from './DeadlinesTable';
import useUserData from './useUserData';
import '../../../App.css';

const Progress = () => {
    const { currentUser } = useAuth();
    const [deadlines, setDeadlines] = useState([]);
    const { userInfo, fetchUserData } = useUserData(currentUser);

    useEffect(() => {
        if (currentUser && userInfo) {
            fetchDeadlines(userInfo.id);
        }
    }, [currentUser, userInfo]);

    const fetchDeadlines = async (userId) => {
        try {
            // const response = await axios.get(`/get_deadlines/${userId}/${moment().tz(moment.tz.guess()).format('Z')}`);
            const response = await axios.get(`/get_deadlines/${userId}`);
            const data = processProgressData(response.data)
            setDeadlines(data);
        } catch (error) {
            console.error("Error fetching deadlines:", error);
            // Implement user-friendly error handling here
        }
    };

    const processProgressData = (data) => {
        
        data = data.map((item) => {
            // console.log(item)
            var original_tz_end_date_st = moment.tz(`${item.end_date}`, "YYYY-MM-DD HH:mm", item.timezone).format()
            
            const current_tz_end_date = moment(original_tz_end_date_st)
            // console.log(current_tz_end_date.format())
            const timezone = {value: item.timezone, label: item.timezone}


            // console.log(original_tz_end_date_st)
            // console.log(current_tz_end_date)
            
            const orOffset = moment.tz(item.timezone).utcOffset();
            const defOffset = moment.tz(moment.tz.guess()).utcOffset();
            const differenceInHours = (defOffset - orOffset) / 60;
            
            var newdatatime =  moment(original_tz_end_date_st)
            
            newdatatime = newdatatime.subtract(differenceInHours, 'hours').utc().toDate()
            var today =  moment(new Date())
            
            // console.log(differenceInHours)
            // console.log(currentTimeInTimezone)
            // console.log(newdatatime)
            
            return {
                ...item,
                end_date_render: current_tz_end_date.format('DD-MM-YYYY HH:mm'),
                current_tz_end_date: current_tz_end_date,
                newdatatime:newdatatime,
                timezone: timezone,
                expired:  current_tz_end_date.diff(today, 'days')
            };
        });
        data = data.sort((a, b) => b.current_tz_end_date - a.current_tz_end_date)
        return data;
    };

    // console.log(deadlines)

    const handleDeadlineUpdate = async () => {
        fetchDeadlines(userInfo.id);
    };



    const handleDeadlineDelete = async (id) => {
        try {
            await axios.post(`/delete_deadline/${id}`);
            fetchDeadlines(userInfo.id);
        } catch (error) {
            console.error('Error deleting deadline:', error);
            // Implement user-friendly error handling here
        }
    };
    function formatDeadline(deadline, currentTimeInTimezone) {
        const diffMs = deadline - currentTimeInTimezone;
        const diff = new Date(diffMs);
    
        // Constants
        const oneDayMs = 24 * 60 * 60 * 1000;
        const oneWeekMs = 7 * oneDayMs;
        const oneMonthMs = 30 * oneDayMs;
    
        // If the deadline has passed
        if (diffMs < 0) {
            const sinceDeadline = Math.abs(diffMs);
            if (sinceDeadline < oneDayMs) {
                const hours = Math.floor(sinceDeadline / (60 * 60 * 1000));
                return `Expired ${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (sinceDeadline < oneMonthMs) {
                const days = Math.floor(sinceDeadline / oneDayMs);
                return `Expired ${days} day${days > 1 ? 's' : ''} ago`;
            } else {
                const months = Math.floor(sinceDeadline / oneMonthMs);
                const days = Math.floor((sinceDeadline % oneMonthMs) / oneDayMs);
                return `Expired ${months} month${months > 1 ? 's' : ''} and ${days} day${days > 1 ? 's' : ''} ago`;
            }
        }
    
        // If the deadline is in the future
        else {
            if (diffMs > oneMonthMs) {
                const months = Math.floor(diffMs / oneMonthMs);
                const days = Math.floor((diffMs % oneMonthMs) / oneDayMs);
                return `In ${months} month${months > 1 ? 's' : ''} and ${days} day${days > 1 ? 's' : ''}`;
            } else if (diffMs > oneWeekMs) {
                const weeks = Math.floor(diffMs / oneWeekMs);
                const days = Math.floor((diffMs % oneWeekMs) / oneDayMs);
                return `In ${weeks} week${weeks > 1 ? 's' : ''} and ${days} day${days > 1 ? 's' : ''}`;
            } else if (diffMs > oneDayMs) {
                const days = Math.floor(diffMs / oneDayMs);
                const hours = Math.floor((diffMs % oneDayMs) / (60 * 60 * 1000));
                return `In ${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
            } else {
                const hours = Math.floor(diffMs / (60 * 60 * 1000));
                const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
                return `In ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
            }
        }
    }

    if (!currentUser) {
        return (
            <div className="background-image-repeat">
                <div className="container pt-5 text-center">
                    <h1 className="text-danger pb-5">Warning!</h1>
                    <h5 className="text-light">Access Restricted: Please log in to view this content.</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="background-image-repeat">
            <div className="container">
                <h2 className="text-light text-center pt-5 pb-3">Deadlines</h2>
                <DeadlineForm userInfo={userInfo} onDeadlineUpdate={handleDeadlineUpdate} />
                <DeadlinesTable 
                    deadlines={deadlines} 
                    onDelete={handleDeadlineDelete} 
                    onDeadlineUpdate={handleDeadlineUpdate}
                    formatDeadline = {formatDeadline}
                    setDeadlines = {setDeadlines}
                />
            </div>
        </div>
    );
};

export default Progress;