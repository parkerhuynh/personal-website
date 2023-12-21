import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const useSpeakingData = (currentUser) => {
    // Define state variables
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [PersonalParagraph, SetPersonalParagraph] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const fetchUserData = async () => {
        if (!currentUser) return;
        // setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);
            const progressResponse = await axios.get(`/get_progress/${userInfoResponse.data.id}`);
            SetPersonalParagraph(processProgressData(progressResponse.data));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const processProgressData = (data) => {
        data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        data = data.map((item) => {

            return {
                ...item,
            };
        });
        return data;
    };



    return { userInfo, PersonalParagraph, SetPersonalParagraph, fetchUserData, isLoading };
};