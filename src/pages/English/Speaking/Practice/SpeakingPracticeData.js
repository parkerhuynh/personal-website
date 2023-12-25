import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const SpeakingPracticeData = (currentUser, para_id) => {
    // Define state variables
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [allParaId, setAllParaId] = useState([]);

    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };
    const [para, setPara] = useState(initialFormState);
    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    function createWordObjects(wordsList) {
        return wordsList.map((word, index) => {
            return { word: word, id: index, level: -1 };
        });
    }

    
    
    const fetchUserData = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);

            const paraResponse = await axios.get(`/get_one_para/${para_id}`);
            setPara(paraResponse.data[0]);

            const paraIdsResponse = await axios.get(`/get_all_para_id`);
            setAllParaId(paraIdsResponse.data)

            

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    return { userInfo, isLoading, setIsLoading, para, setPara, allParaId};
};