import { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';


export const SpeakingStatisticData = (currentUser) => {
    // Define state variables
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const initialData = {
        diffWordDurMisspell: [],
        skipCountWords: [],
        totalSpeakingPerDay: [],
        doneCounts: [],
        averageDoneWord: [],
        skipCountPerDaye: []
    }
    const [diffWordDurMisspel,setDiffWordDurMisspel]  = useState([])
    const [skipCountWords, setSkipCountWords] = useState([])
    const [totalSpeakingPerDay, setTotalSpeakingPerDay] = useState([])
    const [doneCounts, setDoneCounts] = useState([])
    const [skipCountPerDay, setSkipCountPerDay] = useState([])
    const [dailyAvergePerWord, setDailyAvergePerWord] = useState([])

    useEffect(() => {
        fetchUserData();
    }, [currentUser]);

    const DataAnalysis = async (userId, day) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const diffWordDurMisspelData = await axios.get(`/diff_word_dur_misspell/${userId}/${day}/${timezone}`);
        setDiffWordDurMisspel(diffWordDurMisspelData.data);
        
        const skipCountWordsData = await axios.get(`/skip_count_words_func/${userId}/${day}/${timezone}`);
        setSkipCountWords(skipCountWordsData.data);

        const totalSpeakingPerDayData = await axios.get(`/total_speaking_per_day/${userId}/${day}/${timezone}`);
        setTotalSpeakingPerDay(totalSpeakingPerDayData.data);

        const doneCountsData = await axios.get(`/done_counts_func/${userId}/${day}/${timezone}`);
        setDoneCounts(doneCountsData.data);

        const skipCountPerDayData = await axios.get(`/skip_count_per_day_func/${userId}/${day}/${timezone}`);
        setSkipCountPerDay(skipCountPerDayData.data);
        
        const dailyAvergePerWordData = await axios.get(`/daily_averge_per_word/${userId}/${day}/${timezone}`);
        setDailyAvergePerWord(dailyAvergePerWordData.data);
    }

    const fetchUserData = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const userInfoResponse = await axios.get(`/get_user_info/${currentUser.email}`);
            setUserInfo(userInfoResponse.data);

            DataAnalysis(userInfoResponse.data.id, 3)

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    return { userInfo, isLoading, 
        diffWordDurMisspel, skipCountWords, totalSpeakingPerDay,
        doneCounts, skipCountPerDay, DataAnalysis, dailyAvergePerWord};
};