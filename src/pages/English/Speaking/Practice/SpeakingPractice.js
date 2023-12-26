import React, { useState, useEffect, CSSProperties, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../components/AuthContext.js';
import axios from 'axios';
import { SpeakingPracticeData } from './SpeakingPracticeData.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt, faPenToSquare, faTable, faFloppyDisk, faForward,
    faBan, faGlobe, faUser, faShuffle, faMicrophone, faRetweet, faChartSimple
} from '@fortawesome/free-solid-svg-icons';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { ordinalToNumber } from "./ordinalToNumber"
import { wordToNumber } from "./wordToNumber"
import { useHotkeys } from 'react-hotkeys-hook';

function SpeakingPractice() {
    const { para_id } = useParams();
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const { userInfo, isLoading, setIsLoading, para, setPara, allParaId } = SpeakingPracticeData(currentUser, para_id);
    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };
    const [state, setState] = useState(false)
    const [finish, setFinish] = useState(false)
    const [startTime, SetStarTime] = useState(0)
    const [duration, setDuration] = useState()
    const [currentId, setCurrentId] = useState(0)
    const [dropboxTop, setDropboxTop] = useState(203)
    const [dropboxLeft, setDropboxLeft] = useState(0)
    const [showDropdown, setshowDropdown] = useState(false)
    const nextWord = useRef(null);
    const currWord = useRef(null)
    const [completedWords, setCompletedWords] = useState([]);
    const [failTime, setFailTime] = useState(0);
    const [skipcount, setSkipcount] = useState(0);
    const [skipWanring, setSkipWanring] = useState(false);
    const [startWordDuration, setWordDuration] = useState(performance.now());
    const [pronunciation, setPronunciation] = useState('');




    const reset = () => {
        setFinish(false)
        resetTranscript()
        setCurrentId(0)
        setCompletedWords([])
        setSkipcount(0)
        setState(false)
        setFailTime(0)
    }

    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
    } = useSpeechRecognition()

    // Edit PARAGRAPH
    const saveEdit = async () => {
        try {
            setIsEditing(false);
            var jsonbody = {
                ...temForm, content: para_processing(temForm.content)
            }
            setPara(jsonbody)
            await axios.post(`/update_speaking_para`, jsonbody).then(async () => {
                console.log('successful!')
            })
            setTemForm(initialFormState);
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };

    const onDelete = async () => {
        try {
            await axios.post(`/delete_speaking_pata/${para.para_id}`).then(
                window.location.href = `/speaking_para`
            )
        } catch (error) {
            console.error('Error deleting deadline:', error);
        }
    };

    const mic_handle = () => {
        setFinish(false)
        if (state) {
            setState(false)
            SpeechRecognition.stopListening()
        } else {
            setWordDuration(performance.now())
            setState(true)
            if (transcript == "") {
                SetStarTime(performance.now())
                setDuration(0)
                setSkipcount(0)
            }
            SpeechRecognition.startListening({ continuous: true })
        }
    };


    const [temForm, setTemForm] = useState(initialFormState);
    const [userOption, setUserOption] = useState(true);

    const handleParaTableClick = () => {
        window.location.href = `/speaking_para`
    }
    const handleEdit = () => {
        setIsEditing(true);
        setTemForm(para)
    };

    const cancel = async () => {
        setIsEditing(false);
    };
    const para_processing = (text) => {
        // var text = text.replace(/\n/g, '.')
        var text = text.replace(/\.\./g, '')
        var text = text.replace(/\.([^\s])/g, '. $1');
        var text = text.replace(`'s`, '');
        var text = text.replace(`'`, '');
        return text
    };

    const word_processsing = (raw_word) => {
        var raw_word = raw_word.replace(/,^[^a-zA-Z0-9]*|/mg, "").toLowerCase()
        var raw_word = raw_word.replace(/\./g, '')
        var raw_word = raw_word.replace(/:/g, '');
        var raw_word = raw_word.replace(",", '');
        var raw_word = raw_word.replace(".", '');
        var raw_word = raw_word.replace(";", '');

        return raw_word
    }

    const handleUserOption = () => {
        setUserOption(!userOption)
    };

    function normalizeWord(word) {
        const lowerCaseWord = word.toLowerCase();
        return wordToNumber[lowerCaseWord] || ordinalToNumber[lowerCaseWord] || word;
    }


    const yourOtherParaId = allParaId.filter(para => para.user_id === userInfo.id);
    const skipwords = ["\n\n", "\n"]
    const wordlist = para.content.split(" ")
    var breaking_Words = []
    if (wordlist.length > 1) {
        for (let i = 0; i <= (wordlist.length - 1); i++) {
            let words = separateString(wordlist[i]);
            for (let j = 0; j <= (words.length - 1); j++) {
                breaking_Words.push(words[j])
            }
        }
    } else {
        breaking_Words = []
    }
    const handleRandom = async () => {
        var ramdom_para_id = 0
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
    const handleProfile = async () => {
        window.location.href = `/speaking_statistic`
    };

    const saveSpeakingEvent = async (completed_word, word_level, word_duration, currentId) => {
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

    const saveSpeakingWord = async (speaking_word, checking_word, index_para) => {
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

    const saveCompletedSpeaking = async (completed_duration) => {
        const formData = {
            user_id: userInfo.id,
            para_id: para.para_id,
            duration: completed_duration,
            transcript: transcript,
            skip: skipcount,
        }
        try {
            await axios.post('/save_completed_speaking', formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }
    // useEffect(() => {
    //     const closeDropdown = () => setSelectedWord('');
    //     document.addEventListener('click', closeDropdown);
    //     return () => document.removeEventListener('click', closeDropdown);
    // }, []);

    const handleSkip = () => {

        if (state) {
            let newSkipCount = skipcount + 1
            setSkipcount(newSkipCount)
            let checking_word = normalizeWord(word_processsing(breaking_Words[currentId]))
            let newcompletedWord = { word: breaking_Words[currentId], id: currentId, level: 100 };
            let durationWord = (performance.now() - startWordDuration)
            let completedpart = [...completedWords, newcompletedWord]
            setCompletedWords(completedpart);
            saveSpeakingEvent(checking_word, 100, durationWord, currentId)
            setWordDuration(performance.now())
            setFailTime(0)
            setshowDropdown(false)

            if (completedpart.length === breaking_Words.length) {
                let duration = (performance.now() - startTime) / 1000;
                setFinish(true)
                resetTranscript()
                setCurrentId(0)
                setCompletedWords([])
                setDuration(duration)
                setState(false)
                let warningSkip = newSkipCount > (breaking_Words.length / 2) || newSkipCount > 20
                if (warningSkip == false) {
                    saveCompletedSpeaking(duration)
                }
                setSkipWanring(warningSkip)
            } else {
                var next_id = currentId + 1
                setCurrentId(next_id)

                for (let k = next_id; k <= (breaking_Words.length - 1); k++) {
                    var checking_next_word = normalizeWord(word_processsing(breaking_Words[k]))
                    if (skipwords.includes(checking_next_word)) {
                        let newcompletednewWord = { word: checking_next_word, id: k, level: 50 };

                        completedpart = [...completedpart, newcompletednewWord];
                        setCompletedWords(completedpart);
                        setFailTime(0)
                        setshowDropdown(false)
                        setCurrentId(k + 1)

                        if (completedpart.length === breaking_Words.length) {
                            let duration = (performance.now() - startTime) / 1000;
                            setFinish(true)
                            resetTranscript()
                            setCurrentId(0)
                            setCompletedWords([])
                            setDuration(duration)

                            setState(false)

                            let warningSkip = skipcount > (breaking_Words.length / 2) || skipcount > 20
                            if (warningSkip == false) {
                                saveCompletedSpeaking(duration)
                            }
                            setSkipWanring(warningSkip)
                        }
                    } else {
                        break
                    }
                }
            }
        }
    };

    const STEPWISE = () => {
        if (breaking_Words.length > 1 & transcript !== "" & state == true) {
            var last_word_speak = normalizeWord(word_processsing(transcript.split(' ').pop()))
            var checking_word = normalizeWord(word_processsing(breaking_Words[currentId]))

            saveSpeakingWord(last_word_speak, checking_word, currentId)
            if ((last_word_speak == checking_word) & (last_word_speak !== "")) {
                let newcompletedWord = { word: breaking_Words[currentId], id: currentId, level: failTime };
                let durationWord = (performance.now() - startWordDuration);
                let completedpart = [...completedWords, newcompletedWord];
                setCompletedWords(completedpart);
                saveSpeakingEvent(checking_word, failTime, durationWord, currentId)
                setWordDuration(performance.now())
                setFailTime(0)
                setshowDropdown(false)

                if (completedpart.length === breaking_Words.length) {
                    let duration = (performance.now() - startTime) / 1000;
                    setFinish(true)
                    resetTranscript()
                    setCurrentId(0)
                    setCompletedWords([])
                    setDuration(duration)
                    saveCompletedSpeaking(duration)
                    setState(false)

                    let warningSkip = skipcount > (breaking_Words.length / 2) || skipcount > 10
                    setSkipWanring(warningSkip)

                } else {
                    var next_id = currentId + 1
                    setCurrentId(next_id)

                    for (let k = next_id; k <= (breaking_Words.length - 1); k++) {
                        var checking_next_word = normalizeWord(word_processsing(breaking_Words[k]))

                        if (skipwords.includes(checking_next_word)) {
                            let newcompletednewWord = { word: checking_next_word, id: k, level: 50 };

                            completedpart = [...completedpart, newcompletednewWord];
                            setCompletedWords(completedpart);
                            setFailTime(0)
                            setshowDropdown(false)
                            setCurrentId(k + 1)

                            if (completedpart.length === breaking_Words.length) {
                                let duration = (performance.now() - startTime) / 1000;
                                setFinish(true)
                                resetTranscript()
                                setCurrentId(0)
                                setCompletedWords([])
                                setDuration(duration)
                                saveCompletedSpeaking(duration)
                                setState(false)

                                let warningSkip = skipcount > (breaking_Words.length / 2) || skipcount > 20
                                if (warningSkip == false) {
                                    saveCompletedSpeaking(duration)
                                }
                                setSkipWanring(warningSkip)
                            }
                        } else {
                            break
                        }
                    }
                }
            } else {
                setFailTime(failTime + 1)
                if (failTime >= 1) {
                    fetchPronunciation(checking_word)
                    setshowDropdown(true)
                }
            }
        }

    };

    useEffect(() => {
        STEPWISE()
    }, [transcript, resetTranscript])




    const updateDropboxPosition = () => {
        if (nextWord.current) {
            const { offsetTop, offsetLeft, offsetHeight } = nextWord.current
            setDropboxTop(offsetTop + offsetHeight + 3)
            setDropboxLeft(offsetLeft - 100)
        } else if (currWord.current) {
            const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = currWord.current
            setDropboxTop(+ offsetHeight + 3)
            setDropboxLeft(offsetLeft + offsetWidth - 100)
        }

    }
    useEffect(() => {
        updateDropboxPosition()
    }, [currentId]);
    let displayStyle;

    // if (dropboxTop > 0 && dropboxLeft > 0 && transcript !== "") {
    if (transcript !== "" && showDropdown) {
        displayStyle = "block";
    } else {
        displayStyle = "none";
    }
    function separateString(str) {
        // Regular expression with capturing groups for \n\n, \n, and -
        const regex = /(\n\n|\n)/;
        return str.split(regex).filter(s => s); // filter out empty strings
    }
    const uncompletedWords = breaking_Words.slice(currentId)
    const dropdownTranscript = transcript.split(' ').slice(Math.max(transcript.split(' ').length - 3, 0)).join(" ")

    let formattedTime;
    if (duration < 60) {
        formattedTime = duration.toFixed(2) + " seconds";
    } else {
        let minutes = Math.floor(duration / 60);
        let seconds = (duration % 60).toFixed(2);
        formattedTime = minutes + " minutes and " + seconds + " seconds";
    }

    const wordColor = (level) => {
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

    const textSpeech = (word) => {
        return new Promise((resolve, reject) => {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.onend = () => resolve(); // Resolve when speech ends
                utterance.onerror = (e) => reject(e); // Reject on error
                speechSynthesis.speak(utterance);
                // fetchPronunciation(word); // Uncomment if this function is defined
            } else {
                reject('Speech synthesis not supported');
            }
        });
    };

    const handleSpeechClick = async (word) => {
        try {
            SpeechRecognition.stopListening()
            updateDropboxPosition()
            await textSpeech(word);
            SpeechRecognition.startListening({ continuous: true })
        } catch (error) {
            console.error("Error during speech synthesis:", error);
            setState(true); // Consider setting state back to true even on error
        }
    };


    const fetchPronunciation = async (word) => {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            let data = await response.json();
            data = data[0]
            let phonetics = data["phonetics"]
            phonetics = phonetics.filter(item => item.text && item.text.trim().length > 0)[0]
            setPronunciation(phonetics.text); // Adjust according to API response structure
        } catch (error) {
            setPronunciation(word);
        }
    };


    useHotkeys('space',
        () => { handleSpeechClick(breaking_Words[currentId]) },
    )
    useHotkeys('enter',
        () => {
            mic_handle()
        }
    )
    useHotkeys('ctrl',
        () => { handleSkip() },
    )
    useHotkeys('r',
        () => { reset() },
    )
    return (
        <div className={'background-image-repeat'}>
            <div class="container pb-5">
                {!currentUser ? (
                    <div className="container">
                        <div className="pt-5 text-center">
                            <h1 className="text-danger pb-5">Warning!</h1>
                            <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
                            <h5 className="text-light"> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 class="text-center py-5 text-light "> Speaking Practice</h1>
                        {isLoading ? (null) : (
                            <div>
                                <div class="card" style={{ backgroundColor: 'rgb(0, 1, 2, 0.5)' }}>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-1"> </div>
                                            <div class="col-10">
                                                {isEditing ? (
                                                    <div class="d-flex justify-content-center">
                                                        <label htmlFor="title" className="text-light me-2">Title:</label>
                                                        <input
                                                            style={{ width: "700px" }}
                                                            type="text"
                                                            className="form-control"
                                                            value={temForm.title}
                                                            onChange={(e) => setTemForm({ ...temForm, title: e.target.value })}
                                                        />
                                                    </div>
                                                ) : (
                                                    <h4 class="card-title text-light text-center">{para.title}</h4>
                                                )}
                                            </div>
                                            <div class="col-1 d-flex justify-content-end">
                                                {(para.user_id !== userInfo.id) ? (
                                                    <div class="d-flex justify-content-around  m-0 p-0">
                                                        <button onClick={handleParaTableClick} className="btn btn-sm btn-light text-center me-3">
                                                            <FontAwesomeIcon icon={faTable} style={{ color: "#000000", }} />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger text-center me-3" disabled>
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger text-center" disabled>
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div class="d-flex justify-content-around  m-0 p-0">
                                                        <button onClick={handleParaTableClick} className="btn btn-sm btn-light text-center me-3">
                                                            <FontAwesomeIcon icon={faTable} style={{ color: "#000000", }} />
                                                        </button>
                                                        {isEditing ? (
                                                            <div class="d-flex justify-content-around  m-0 p-0">
                                                                <button onClick={saveEdit} className="btn btn-sm btn-light text-center me-3">
                                                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                                                </button>
                                                                <button onClick={cancel} className="btn btn-sm btn-light text-center">
                                                                    <FontAwesomeIcon icon={faBan} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div class="d-flex justify-content-around  m-0 p-0">
                                                                <button onClick={handleEdit} className="btn btn-sm btn-light text-center me-3">
                                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                                </button>
                                                                <button onClick={onDelete} className="btn btn-sm btn-light text-center">
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isEditing ? (
                                            <div >
                                                <div class="d-flex justify-content-center align-items-center m-2">
                                                    <label htmlFor="topic" className="text-light me-2">Topic:</label>
                                                    <input
                                                        style={{ width: "700px" }}
                                                        type="text"
                                                        className="form-control"
                                                        value={temForm.topic}
                                                        onChange={(e) => setTemForm({ ...temForm, topic: e.target.value })} />
                                                </div>
                                                <div class="m-2 d-flex justify-content-center align-items-center m-2">
                                                    <label htmlFor="level" name="level" className="text-light">Level:</label>
                                                    <select value={temForm.level} style={{ width: "700px" }} name="level" class="form-select"
                                                        onChange={(e) => setTemForm({ ...temForm, level: e.target.value })}
                                                        aria-label="Default select example">
                                                        <option value="very easy">Very Easy</option>
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                        <option value="very hard">Very Hard</option>
                                                    </select>
                                                </div>
                                                <div class="m-5">
                                                    <label htmlFor="content" className="text-light my-2">Content:</label>
                                                    <textarea
                                                        id="content"
                                                        name="content"
                                                        className="form-control"
                                                        value={temForm.content}
                                                        onChange={(e) => setTemForm({ ...temForm, content: e.target.value })}
                                                        rows={20}
                                                        placeholder="Enter Content"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div class="row my-2">
                                                    <div class="col-1"> </div>
                                                    <div class="col-10">
                                                        <h5 class="card-title text-light text-center">{para.topic}</h5>
                                                    </div>
                                                    <div class="col-1 d-flex justify-content-end">
                                                        <button onClick={handleProfile} className="btn btn-sm btn-light text-center me-3">
                                                            <FontAwesomeIcon icon={faChartSimple} />
                                                        </button>
                                                        {userOption ? (
                                                            <button onClick={handleUserOption} className="btn btn-sm btn-light text-center me-3">
                                                                <FontAwesomeIcon icon={faUser} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={handleUserOption} className="btn btn-sm btn-light text-center me-3">
                                                                <FontAwesomeIcon icon={faGlobe} />
                                                            </button>
                                                        )}
                                                        <button onClick={handleRandom} className="btn btn-sm btn-light text-center">
                                                            <FontAwesomeIcon icon={faShuffle} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="row my-2 text-center"> <h5 class="card-title text-light text-center">{para.level}</h5></div>
                                                <div>
                                                    <pre style={{ "text-align": "justify", "white-space": "pre-wrap" }} class="card-text text-light m-5">
                                                        {completedWords.map((word, index) => {
                                                            return (
                                                                <span key={index}
                                                                    style={{ color: wordColor(word["level"]) }}
                                                                    ref={(index === (completedWords.length - 1)) ? currWord : null}>
                                                                    {word["word"] + " "}

                                                                </span>
                                                            )
                                                        })}
                                                        {uncompletedWords.map((word, index) => {
                                                            return (
                                                                <span key={index} 
                                                                // onClick={(e) => handleWordClick(word, e)} 
                                                                class="text-light" ref={(index === 0) ? nextWord : null}>
                                                                    {word + " "}
                                                                    {(<div style={{
                                                                        "display": displayStyle,
                                                                        "position": "absolute",
                                                                        "top": dropboxTop,
                                                                        "left": dropboxLeft - 130,
                                                                        "z-index": "1",
                                                                        "background-color": 'rgb(250, 250, 250, 0.9)',
                                                                        "height": "50px",
                                                                        "width": "500px",
                                                                        "border-radius": "25px"
                                                                    }} class="text-primary text-center" >
                                                                        <p class="m-0 p-0"><b>Pronunciation: {pronunciation}</b></p>
                                                                        <p><b>{dropdownTranscript}</b></p>

                                                                    </div>
                                                                    )}

                                                                </span>
                                                            )
                                                        })}
                                                    </pre>
                                                </div>
                                                {finish ? (<div> {skipWanring ? (<pre class="text-light text-center">You skipped too much</pre>) : (
                                                    <pre class="text-light text-center">You have completed with {formattedTime} with {skipcount} skip words</pre>
                                                )}</div>) :
                                                    (<div style={{ height: "38px" }}></div>)}
                                                <div class="d-flex justify-content-center">
                                                    {state ? (
                                                        <button type="button" onClick={() => mic_handle()} class="btn btn-outline-danger mx-2" >
                                                            <FontAwesomeIcon icon={faMicrophone} style={{ color: "#DC4C64", }} />
                                                        </button>
                                                    ) : (
                                                        <button type="button" onClick={() => mic_handle()} class="btn btn-outline-success mx-2">
                                                            <FontAwesomeIcon icon={faMicrophone} />
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => reset()} class="btn btn-outline-warning mx-2">
                                                        <FontAwesomeIcon icon={faRetweet} />
                                                    </button>
                                                    <button type="button" onClick={() => handleSkip()} class="btn btn-outline-info mx-2">
                                                        <FontAwesomeIcon icon={faForward} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default SpeakingPractice;