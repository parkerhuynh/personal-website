import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import {normalizeAndProcessWord, separateString, breakingWordProcessing} from './Utils.js'

export const SpeakingPracticeData = (currentUser, para_id) => {
    // Define state variables
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [topUser, setTopUser] = useState([])
    const [trials, setTrials] = useState([])
    const [breakingWords, setBreakingWords] = useState([])
    const [skipPassWords, setSkipWords] = useState([])
    const [diffPassWords,setDiffWords]  = useState([])
    

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
    
    
    const fetchUserData = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);

            const paraResponse = await axios.get(`/get_one_para/${para_id}`);
            setPara(paraResponse.data[0]);

            const topUserData = await axios.get(`/get_static_one_paragraph/${userInfoResponse.data.id}/${para_id}`);
            setTopUser(topUserData.data.top_users);
            setTrials(topUserData.data.user_trails)
        
            const breaking_Words = breakingWordProcessing(paraResponse.data[0].content)
            setBreakingWords(breaking_Words)

            const diffWordDurMisspelData = await axios.get(`/diff_word_dur_misspell/${userInfoResponse.data.id}/${7}/${timezone}`);
            let diffwords = diffWordDurMisspelData.data.map(item => item.word)
            setDiffWords(diffwords.slice(0,20))

            const skipCountWordsData = await axios.get(`/skip_count_words_func/${userInfoResponse.data.id}/${7}/${timezone}`);
            let skipwords = skipCountWordsData.data.map(item => item.word)
            setSkipWords(skipwords.slice(0,20));

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return { userInfo, isLoading, setIsLoading, para, setPara, topUser, setTopUser, trials, setTrials, breakingWords, setBreakingWords, skipPassWords, diffPassWords};
};