import React, { useState, useEffect, CSSProperties, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../components/AuthContext.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { SpeakingPracticeData } from './SpeakingPracticeData.js';
import SpeakingHelp from './SpeakingHelp.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt, faPenToSquare, faTable, faFloppyDisk, faForward, faPlus, faInfo,
    faBan, faGlobe, faUser, faShuffle, faMicrophone, faRetweet, faChartSimple, faVolumeHigh
} from '@fortawesome/free-solid-svg-icons';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

import { useHotkeys } from 'react-hotkeys-hook';
import { normalizeAndProcessWord, skipwords, CustomTick, wordCompletedColor, formatDuration, saveSpeakingEvent } from './Utils.js'
import { onDelete, calculateDuration, breakingWordProcessing, handleRandom, saveSpeakingWord } from './Utils.js'

function SpeakingPractice() {
    const { para_id } = useParams();
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const { userInfo, isLoading, setIsLoading, para, 
        setPara, topUser, setTopUser, trials, setTrials,
         breakingWords, setBreakingWords, skipPassWords, diffPassWords } = SpeakingPracticeData(currentUser, para_id);
    const initialFormState = {
        user_id: userInfo.id,
        topic: '',
        title: '',
        content: ''
    };
    const [state, setState] = useState(false)
    const [finish, setFinish] = useState(false)
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [startTime, setStartTime] = useState(0)
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
    const containerRef = useRef(null);
    const [helpShow, setHelpShow] = useState(false);
    const [temForm, setTemForm] = useState(initialFormState);
    const [userOption, setUserOption] = useState(true);

    const {
        transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
    } = useSpeechRecognition()
    // Edit PARAGRAPH
    const saveEdit = async () => {
        setStartTime(performance.now())
        try {
            setIsEditing(false);
            var jsonbody = {
                ...temForm, content: temForm.content
            }
            setBreakingWords(breakingWordProcessing(jsonbody.content))
            setPara(jsonbody)
            await axios.post(`/update_speaking_para`, jsonbody).then(async () => {
                console.log('successful!')
            })
            setTemForm(initialFormState);
        } catch (error) {
            console.error('Error updating deadline:', error);
        }
    };



    const handleParaTableClick = () => {
        window.location.href = `/speaking_para`
    }
    const handleEdit = () => {
        setIsEditing(true);
        setTemForm(para)

        if (state) {
            const duration = calculateDuration(performance.now(), startTime, timeElapsed);
            setTimeElapsed(duration);
        }
    };

    const cancel = async () => {
        setStartTime(performance.now())
        setIsEditing(false);
    };

    const handleUserOption = () => {
        setUserOption(!userOption)
    };


    const handleProfile = async () => {
        window.location.href = `/speaking_statistic`
    };

    function handleStartPause() {
        setState(!state);
        if (finish) {
            setTimeElapsed(0)
            setFinish(false)
        }
        if (state) {
            SpeechRecognition.stopListening()
            let temp_duration = performance.now() - startTime
            setTimeElapsed(prevValue => prevValue + temp_duration)
        } else {
            setStartTime(performance.now())
            if (transcript == "") {
                setSkipcount(0)
            }
            SpeechRecognition.startListening({ continuous: true })
        }
    };

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

    const reset = () => {
        setTimeElapsed(0)
        setFinish(false)
        resetTranscript()
        setCurrentId(0)
        setCompletedWords([])
        setSkipcount(0)
        setState(false)
        setFailTime(0)
        setshowDropdown(false)
    }

    const handleCurrentword = (checkingWord, durationWord, completedpart, fail_time) => {
        setCompletedWords(completedpart);
        saveSpeakingEvent(checkingWord, fail_time, durationWord, currentId, userInfo, para)
        setWordDuration(performance.now())
        setFailTime(0)
        setshowDropdown(false)
    }

    const handleFailedTime = (checking_word) => {
        setFailTime(failTime + 1)
        if (failTime >= 1) {
            if (!showDropdown) {
                fetchPronunciation(checking_word)
                setshowDropdown(true)
            }
        }
    }
    const handleFinish = (duration, warningSkip) => {
        

        setTimeElapsed(duration)
        setFinish(true)
        resetTranscript()
        setCurrentId(0)
        setCompletedWords([])
        setState(false)
        setshowDropdown(false)
        if (warningSkip == false) {
            saveCompletedSpeaking(duration)
            
            const index = topUser.findIndex(item => item.user_id === userInfo.id);
            let topUser_update;
            let new_duration = (duration/1000).toFixed(4)
            if (index === -1) {
                // User ID not found, add a new item
                topUser_update = [...topUser, {
                    user_id: userInfo.id,
                    duration: new_duration,
                    fill: "#28B463",
                    username: userInfo.username}]
                setTopUser(topUser_update)
            } else if ((index !== -1) & (topUser[index].duration > new_duration)) {
                topUser_update = topUser
                topUser_update[index].duration = new_duration;
                setTopUser(topUser_update)
            }


            let trialsUpdate = [...trials, {index: trials.length +1, duration: new_duration}]
            setTrials(trialsUpdate)

        }
        setSkipWanring(warningSkip)
        
    }


    const handleSkip = () => {
        if (state) {
            let newSkipCount = skipcount + 1
            setSkipcount(newSkipCount)

            const currentWordToCheck = breakingWords[currentId];
            processCorrectWord(currentWordToCheck, false);
        }
    };

    const STEPWISE = () => {
        if (breakingWords.length <= 1 || transcript === "" || !state) {
            return;
        }
        const lastWordSpoken = transcript.split(' ').pop().toLocaleLowerCase();
        const currentWordToCheck = breakingWords[currentId];
        saveSpeakingWord(lastWordSpoken, currentWordToCheck, currentId, userInfo, para);

        if (lastWordSpoken !== currentWordToCheck || lastWordSpoken === "") {
            handleFailedTime(currentWordToCheck);
            return;
        }
        processCorrectWord(currentWordToCheck, true);
    };

    const processCorrectWord = (word, isSuccess) => {
        let fail_time;
        if (isSuccess) {
            fail_time = failTime
        } else {
            fail_time = 100
        }
        const newCompletedWord = {
            word: word,
            id: currentId,
            level: fail_time
        };

        const durationWord = performance.now() - startWordDuration;
        const completedPart = [...completedWords, newCompletedWord];


        handleCurrentword(word, durationWord, completedPart, fail_time);

        if (completedPart.length === breakingWords.length) {
            finalizeSpeakingSession();
            return;
        }
        prepareForNextWord(completedPart);
    }

    const finalizeSpeakingSession = () => {
        const tempDuration = performance.now() - startTime;
        const duration = timeElapsed + tempDuration;
        const warningSkip = skipcount > (breakingWords.length / 2) || skipcount > 30;

        handleFinish(duration, warningSkip);
    }

    const prepareForNextWord = (completedPart) => {
        let nextId = currentId + 1;
        setCurrentId(nextId);

        for (let k = nextId; k < breakingWords.length; k++) {
            const nextWordToCheck = normalizeAndProcessWord(breakingWords[k]);
            if (!skipwords.includes(nextWordToCheck)) {
                break;
            }

            const newCompletedWord = {
                word: nextWordToCheck,
                id: k,
                level: 50
            };
            completedPart.push(newCompletedWord);
            setCompletedWords(completedPart);
            setFailTime(0);
            setshowDropdown(false);
            setCurrentId(k + 1);

            if (completedPart.length === breakingWords.length) {
                finalizeSpeakingSession();
            }
        }
    }

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

    let uncompletedWords = breakingWords.slice(currentId)
    const processedUncompletedWords = uncompletedWords.map(word => uncompletedWordProcessing(word))

    const dropdownTranscript = transcript.split(' ').slice(Math.max(transcript.split(' ').length - 3, 0)).join(" ")


    function uncompletedWordProcessing (word) {
        if (skipPassWords.includes(word)) {
            return {word: word, color:"#FFA07A"}
        } else if (diffPassWords.includes(word)) {
            return {word: word, color:"#CCCCFF"}
        } else {
            return {word: word, color:"#FDFEFE"}
        }
    }

    const textSpeech = async (word) => {
        return new Promise((resolve, reject) => {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.onend = () => resolve(); // Resolve when speech ends
                utterance.onerror = (e) => reject(e); // Reject on error
                speechSynthesis.speak(utterance);
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
            setPronunciation(word)
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            let data = await response.json();

            data = data[0]
            let phonetic = data["phonetic"]
            if (phonetic) {
                setPronunciation(phonetic); // Adjust according to API response structure
            }
        } catch (error) {
            setPronunciation(word);
        }
    };


    useHotkeys('ctrl',
        () => { handleSpeechClick(breakingWords[currentId]) },
    )
    useHotkeys('enter',
        () => {
            handleStartPause()
        }
    )
    useHotkeys('shift',
        () => { handleSkip() },
    )
    useHotkeys('r',
        () => { reset() },
    )

    var updateTopUsers = topUser.sort((a, b) => a.duration - b.duration);
    updateTopUsers.forEach((item, index) => {
        item.ranking = index + 1;
    });

    function wordDisplay (word) {
        if (skipwords.includes(word)) {
            return word
        } else {
            return " " + word
        }

    }
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
                        <h1 class="text-center py-5 text-light"> Speaking Practice</h1>
                        {isLoading ? (null) : (
                            <div>
                                <div ref={containerRef} class="card" style={{ backgroundColor: 'rgb(0, 1, 2, 0.5)' }}>
                                    <div class="row m-0">
                                        <div class="col-2 p-3">
                                            {/* -----------------------------Help button-------------------- */}
                                            <SpeakingHelp helpShow={helpShow} setHelpShow={setHelpShow} />
                                        </div>
                                        <div class="col-8 p-3">
                                            {isEditing ? (
                                                <>
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
                                                </>
                                            ) : (
                                                <>
                                                    <h4 class="card-title text-light text-center">{para.title}</h4>
                                                    <h5 class="card-title text-light text-center">{para.topic}</h5>
                                                    <h6 class="card-title text-light text-center">{para.level}</h6>
                                                </>
                                            )}
                                        </div>
                                        <div class="col-2 p-3">
                                            <div class="d-flex justify-content-end">
                                                <button onClick={handleParaTableClick} className="btn btn-sm btn-light text-center m-1">
                                                    <FontAwesomeIcon icon={faTable} />
                                                </button>
                                                {(para.user_id !== userInfo.id) ? (
                                                    <>
                                                        <button className="btn btn-sm btn-danger text-center m-1" disabled>
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                        </button>
                                                        <button className="btn btn-sm btn-danger text-center m-1" disabled>
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={saveEdit} className="btn btn-sm btn-light text-center m-1">
                                                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                                                </button>
                                                                <button onClick={cancel} className="btn btn-sm btn-light text-center m-1">
                                                                    <FontAwesomeIcon icon={faBan} />
                                                                </button>

                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={handleEdit} className="btn btn-sm btn-light text-center m-1">
                                                                    <FontAwesomeIcon icon={faPenToSquare} />
                                                                </button>
                                                                <button onClick={(e) => { onDelete(para.para_id) }} className="btn btn-sm btn-light text-center m-1">
                                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                                </button>
                                                            </>
                                                        )
                                                        }
                                                    </>
                                                )}
                                            </div>
                                            <div class="d-flex justify-content-end">
                                                <button onClick={handleProfile} className="btn btn-sm btn-light text-center m-1">
                                                    <FontAwesomeIcon icon={faChartSimple} />
                                                </button>
                                                {userOption ? (
                                                    <button onClick={handleUserOption} className="btn btn-sm btn-light text-center m-1">
                                                        <FontAwesomeIcon icon={faUser} />
                                                    </button>
                                                ) : (
                                                    <button onClick={handleUserOption} className="btn btn-sm btn-light text-center m-1">
                                                        <FontAwesomeIcon icon={faGlobe} />
                                                    </button>
                                                )}
                                                <button onClick={(e) => { handleRandom(para, userInfo, userOption) }} className="btn btn-sm btn-light text-center m-1">
                                                    <FontAwesomeIcon icon={faShuffle} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        {isEditing ? (
                                            <div class="p-5">
                                                <label htmlFor="content" className="text-light"><p class="text-center"> Content:</p></label>
                                                <textarea
                                                    id="content"
                                                    name="content"
                                                    className="form-control p"
                                                    value={temForm.content}
                                                    onChange={(e) => setTemForm({ ...temForm, content: e.target.value })}
                                                    rows={20}
                                                    placeholder="Enter Content"
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div class="px-5 py-2">
                                                <div>
                                                    <pre  style={{ "text-align": "justify", "white-space": "pre-wrap" }} class="card-text text-light m-5">
                                                        {completedWords.map((word, index) => {
                                                            return (
                                                                <span key={index}
                                                                onClick={(e) => {handleSpeechClick(word["word"])}}
                                                                    style={{ color: wordCompletedColor(word["level"]), "fontSize": "24px"}}
                                                                    ref={(index === (completedWords.length - 1)) ? currWord : null}>
                                                                        <b>{wordDisplay(word["word"])}</b>
                                                                    

                                                                </span>
                                                            )
                                                        })}
                                                        {processedUncompletedWords.map((word, index) => {
                                                            return (
                                                                <span key={index}
                                                                    style={{ color: word["color"], "fontSize": "24px"}}
                                                                    onClick={(e) => {handleSpeechClick(word["word"])}}
                                                                    ref={(index === 0) ? nextWord : null}>
                                                                    {wordDisplay(word["word"])}
                                                                    {(<div style={{
                                                                        "display": displayStyle,
                                                                        "position": "absolute",
                                                                        "top": dropboxTop,
                                                                        "left": dropboxLeft - 130,
                                                                        "z-index": "1",
                                                                        "background-color": 'rgb(250, 250, 250, 0.9)',
                                                                        "height": "80px",
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

                                            </div>
                                        )}

                                    </div>
                                    <div class="row">
                                        {finish ? (<div> {skipWanring ? (<pre class="text-light text-center">You skipped too much</pre>) : (
                                            <pre class="text-light text-center">You have completed with {formatDuration(timeElapsed)} with {skipcount} skip words</pre>
                                        )}</div>) :
                                            (<div style={{ height: "38px" }}></div>)}
                                    </div>
                                    <div class="row p-5">
                                        <div class="d-flex justify-content-center">
                                            {state ? (
                                                <button type="button" onClick={() => handleStartPause()} class="btn btn-outline-danger mx-2" >
                                                    <FontAwesomeIcon icon={faMicrophone} style={{ color: "#DC4C64", }} />
                                                </button>
                                            ) : (
                                                <button type="button" onClick={() => handleStartPause()} class="btn btn-outline-success mx-2">
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
                                </div>
                                {(updateTopUsers.length > 0 || topUser.length > 0) ? (
                                    <div class="row mx-0 my-5 pt-5 px-0 d-flex justify-content-center" style={{ backgroundColor: 'rgb(0, 1, 2, 0.5)' }}>
                                    <h3 class="text-center text-light">Statistic</h3>
                                        {updateTopUsers.length > 0 ? (
                                            <div class="col-4 mx-0">
                                            <h5 class="text-center text-light">Top Speakers</h5>
                                            <ResponsiveContainer width="100%" height={Math.max(100, updateTopUsers.length * 50)}>
                                                <BarChart data={updateTopUsers} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                    <XAxis height={50} type="number" tick={{ fill: 'white', fontSize: '12px'}}
                                                        label={{ fontSize: '14px', value: 'Seconds', color: "white", position: 'insideBottom', style: { fill: 'white' } }} />
                                                    <YAxis dataKey="username" type="category" tick={<CustomTick data={updateTopUsers} />} width={120}
                                                        interval={0} // Ensures all ticks are rendered
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'rgb(23, 32, 42)',
                                                            borderColor: 'black',
                                                            color: 'white'
                                                        }}
                                                    />
                                                    <Bar dataKey="duration" fill="#F2F3F4" barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
    
                                        ):(null)}
                                        {topUser.length > 0 ? (
                                        <div class="col-8 mx-0 ps-0 pe-2">
                                         
                                        <h5 class="text-center text-light">Your Pass Trails</h5>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={trials} >
                                                    <CartesianGrid strokeDasharray="2 20" stroke="#ccc" />
                                                    <XAxis dataKey="index" stroke="white" height={90} tick={false} />
                                                    <YAxis tick={{ fill: 'white', fontSize: '12px'}} stroke="white" yAxisId="left"
                                                        label={{ value: 'Seconds', fontSize: '14px',angle: -90, fill: 'white' }} />
                                                    <Tooltip />
                                                    <Line type="monotone" name="Completed Time" dataKey="duration" yAxisId="left" stroke="#28B463" activeDot={{ r: 8 }} strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>):(null)}
    
                                    </div>
                                ): (null)}
                                
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default SpeakingPractice;