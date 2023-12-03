import { useState, useEffect } from 'react';
import axios from 'axios';

const useUserData = (currentUser) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchUserData();
        }
    }, [currentUser]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(response.data);
        } catch (error) {
            console.error("Error fetching user info:", error);
            // Implement user-friendly error handling here
        }
    };

    return { userInfo, fetchUserData };
};

export default useUserData;