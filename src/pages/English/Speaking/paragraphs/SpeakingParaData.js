import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const SpeakingParaData = (currentUser) => {
    // Define state variables
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [paragraphs, setSpeakingParaData] = useState(true);
    
    useEffect(() => {
        fetchUserData();
    }, [currentUser]);
    
    const fetchUserData = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);
            const progressResponse = await axios.get(`/get_speaking_para/${userInfoResponse.data.id}/you`);
            setSpeakingParaData(processProgressData(progressResponse.data));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const processProgressData = (data) => {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        data = data.map((item) => {
            var original_tz_st =  moment.tz(`${item.created_at}`, "YYYY-MM-DD HH:mm:ss", "Australia/Sydney").format()
            const current_tz_date = moment(original_tz_st).startOf('minutes').fromNow();
            // const date_render = `${current_tz_date.format('ddd')}, ${current_tz_date.format("DD-MM-YYYY")}`

            return {
                ...item,
                date_render: current_tz_date
            };
        });
        return data;
    };
    
    return { userInfo, paragraphs,setSpeakingParaData, isLoading, processProgressData};
};