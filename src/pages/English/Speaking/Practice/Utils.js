import { ordinalToNumber } from "./ordinalToNumber"
import { wordToNumber } from "./wordToNumber"
import axios from "axios";

const word_processing = (raw_word) => {
    raw_word = raw_word.replace(/[^a-zA-Z0-9\s,.]/g, '') // Remove all non-alphanumeric characters except spaces
        .toLowerCase();
    return raw_word;
};

function normalizeWord(word) {
    const lowerCaseWord = word.toLowerCase();
    return wordToNumber[lowerCaseWord] || ordinalToNumber[lowerCaseWord] || word;
}


export const normalizeAndProcessWord = (word) => {
    return normalizeWord(word_processing(word));
}

export function separateString(str) {
    const regex = /(\n\n|\n|,|\.)/;
    return str.split(regex).filter(s => s); // filter out empty strings
}



export const calculateDuration = (currentTime, startTime, elapsed) => {
    const tempDuration = currentTime - startTime;
    return elapsed + tempDuration;
};

export const skipwords = ["\n\n", "\n", ",", "."]

export const onDelete = async (para_id) => {
    try {
        await axios.post(`/delete_speaking_pata/${para_id}`).then(
            window.location.href = `/speaking_para`
        )
    } catch (error) {
        console.error('Error deleting deadline:', error);
    }
};


export function breakingWordProcessing(para) {
    const wordlist = para.split(" ")
    var breaking_Words = []
    if (wordlist.length > 1) {
        for (let i = 0; i <= (wordlist.length - 1); i++) {
            let words = separateString(wordlist[i]);
            for (let j = 0; j <= (words.length - 1); j++) {
                breaking_Words.push(normalizeAndProcessWord(words[j]))
            }
        }
    }
    return breaking_Words
};


export const handleRandom = async (para, userInfo, userOption) => {

    const paraIdsResponse = await axios.get(`/get_all_para_id`);
    let allParaId = paraIdsResponse.data
    let yourOtherParaId = allParaId.filter(para => para.user_id === userInfo.id);

    let ramdom_para_id = 0
    let currentItem = para.para_id
    if (userOption) {
        if (yourOtherParaId.length > 1) {
            let filteredList = yourOtherParaId.filter(item => item.para_id !== currentItem);
            ramdom_para_id = filteredList[Math.floor(Math.random() * filteredList.length)]
            window.location.href = `/practice/${ramdom_para_id.para_id}`
        }
    } else {
        if (allParaId.length > 1) {
            let filteredList = allParaId.filter(item => item.para_id !== currentItem);
            ramdom_para_id = filteredList[Math.floor(Math.random() * filteredList.length)]
            window.location.href = `/practice/${ramdom_para_id.para_id}`
        }
    }
};

export const wordCompletedColor = (level) => {
    if (level <= 3) {
        return "#2ECC71"
    } else if (level > 3 & level < 10) {
        return "#5DADE2"
    } else if (level >= 10 & level < 20) {
        return "#F4D03F"
    } else if (level >= 20 & level < 50) {
        return "#E67E22"
    } else if (level == 50) {
        return "#8E44AD"
    } else {
        return "#E74C3C"
    }
}



export function formatDuration (duration) {
    let formattedTime;
    duration = duration / 1000
    if (duration < 60) {
        formattedTime = duration.toFixed(2) + " seconds";
    } else {
        let minutes = Math.floor(duration / 60);
        let seconds = (duration % 60).toFixed(2);
        formattedTime = minutes + " minutes and " + seconds + " seconds";
    }
    return formattedTime;
}

export const saveSpeakingEvent = async (completed_word, word_level, word_duration, currentId, userInfo, para) => {
    const formData = {
        user_id: userInfo.id,
        para_id: para.para_id,
        duration: word_duration,
        word: completed_word,
        level: word_level,
        index_para: currentId
    }
    try {
        await axios.post('/add_speaking_event', formData);
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}


export const saveSpeakingWord = async (speaking_word, checking_word, index_para, userInfo, para) => {
    const formData = {
        user_id: userInfo.id,
        para_id: para.para_id,
        speaking_word: speaking_word,
        checking_word: checking_word,
        index_para: index_para
    }
    try {
        await axios.post('/add_speaking_word', formData);
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}

export const CustomTick = (props) => {
    const { x, y, payload, data } = props;

    // Find the corresponding data item
    const dataItem = data.find(item => item.username === payload.value);

    // Get the color from the data item
    const color = dataItem ? dataItem.fill : '#000'; // Default color if not found

    return (
        <g   transform={`translate(${x},${y})`}>
            <text x={-100} style={{"font-size":"12"}} textAnchor="left" class="px-0 mx-0" y={-10} dy={16} fill={color} >
                {dataItem.ranking}: {payload.value}
            </text>
        </g>
    );
};