
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import mic from "../../microphone.png"
import un_mic from "../../dis_microphone.png"
import reset_logo from "../../reset.png"
import skip_logo from "../../skip.png"
import OpenAI from 'openai';
import ReactLoading from 'react-loading';
import axios from 'axios';
import {ordinalToNumber} from "./ordinalToNumber"
import {wordToNumber} from "./wordToNumber"


function App() {
  const {
    transcript,
    finalTranscript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()
  const [text, setText] = useState("")
  const [state, setState] = useState(false)
  const [option, setOption] = useState("your")
  const [para, setPara] = useState("")
  const [topic, setTopic] = useState("")
  const [processing, setProcessing] = useState(false);
  const [correct_id, setCorret_id] = useState(0)
  const [inputPara, setInputPara] = useState("")
  const [wordTime, setWordTime] = useState({})
  const [startTime, SetStarTime] = useState(0)
  const [editingInputPara, setEditingInputPara] = useState(true)
  const [totaltime, setTotalTime] = useState(0)
  const [finish, setFinish] = useState(false)

  const MICSIZE = 50
  const IMG_MIC_SIZE = MICSIZE * .8
  const reset = () => {
    resetTranscript()
    setCorret_id(0)

    setInputPara("")
    

  }

  useEffect(() => {
    STEPWISE()
  }, [transcript, resetTranscript])

  const mic_handle = (tem_state) => {
    setFinish(false)
    if (tem_state) {
      setState(false)
      SpeechRecognition.stopListening()
    } else {
      setState(true)
      SetStarTime(performance.now())
      SpeechRecognition.startListening({ continuous: true })
      setWordTime({})
      
    }
  };

  function normalizeWord(word) {
    const lowerCaseWord = word.toLowerCase();
    console.log(wordToNumber)
    return wordToNumber[lowerCaseWord] || ordinalToNumber[lowerCaseWord] || word;
  }

  const para_processing = async (text) => {
    var text = text.replace(/\n/g, '.')
    var text = text.replace(/\.\./g, '')
    var text = text.replace(/\.([^\s])/g, '. $1');
    // var raw_para = inputPara.replace(/\n\n/g, ' ')
    axios.get('/para_process/' + text)
    .then(response => {
      setPara(response.data.text)
    })
    
  };

  const handleOption = (event) => {
    const value = event.target.value
    reset()
    setOption(value)
    setFinish(false)
  };

  const handleTopic = (event) => {
    const value = event.target.value
    reset()
    setTopic(value);
    setFinish(false)
  };

  const handleInputPara = (event) => {
    const value = event.target.value
    // reset()
    setInputPara(value)
    setFinish(false)
  };


  const handleSubmitPara = () => {
    // reset()
    if (inputPara === "") {
      alert("Enter your paragraph please!")
    } else {
      para_processing(inputPara)
      setEditingInputPara(false)
      setFinish(false)
      setCorret_id(0)
    }
  };
  const handleEditPara = () => {
    setEditingInputPara(true)
    setFinish(false)
  };

  const handleSkip = () => {
    var current_word_tem = normalizeWord(word_processsing(words[correct_id]))
    SetStarTime(performance.now())
    addWordTime(current_word_tem, 10000)
    setCorret_id(correct_id + 1)
  };
  const openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true // This is also the default, can be omitted
  });

  const ChatGPT = async (message) => {
    setProcessing(true)
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: message }],
      model: "gpt-3.5-turbo",
    });
    var message = completion.choices[0].message.content.replace(/Sure!/g, '')
    para_processing(message)
    setProcessing(false)
  }

  const handleGenerate = () => {
    if (topic != "") {
      var message = "can you give me  a band 7 answer of this IELST speaking task 2. start with 'Sure!'" + topic
      reset()
      setPara("")
      setFinish(false)
      ChatGPT(message)
    } else {
      alert("Enter your topic please!")
    }
  };

  const word_processsing = (raw_word) => {
    var raw_word = raw_word.replace(/,^[^a-zA-Z0-9]*|/mg, "").toLowerCase()
    var raw_word = raw_word.replace(/\./g, '')
    var raw_word = raw_word.replace(/:/g, '');

    return raw_word
  }

  const addWordTime = (word, time) => {
    setWordTime(prevWordTimes => {
      const existingWord = prevWordTimes[word];

      if (existingWord) {
        // Word already exists in the dictionary
        return {
          ...prevWordTimes,
          [word]: {
            total: existingWord.total + time,
            count: existingWord.count + 1,
          },
        };
      } else {
        // Word does not exist in the dictionary
        return {
          ...prevWordTimes,
          [word]: {
            total: time,
            count: 1,
          },
        };
      }
    });
  };

  const SKIP_WORD = [""]
  // console.log(para)


  const words = para.split(' ')
  const STEPWISE = () => {
    var last_word_speak = normalizeWord(word_processsing(transcript.split(' ').pop()))
    var current_word = normalizeWord(word_processsing(words[correct_id]))
    console.log(current_word, last_word_speak)
    if (words.length === correct_id) {
      reset()
    } else {
      if (SKIP_WORD.includes(current_word)) {
        setCorret_id(correct_id + 1)
      } else {
        // if ((performance.now() - startTime) > 10000) {
        //   setCorret_id(correct_id + 1)
        // }
        if (current_word === last_word_speak) {
          var endTime = performance.now();
          SetStarTime(performance.now())
          addWordTime(current_word, (endTime - startTime))

          setCorret_id(correct_id + 1)
          if (words.length === correct_id + 1) {
            resetTranscript()
            setCorret_id(0)
            SetStarTime(performance.now())
            SpeechRecognition.stopListening()
            setState(false)
            setTotalTime(Object.values(wordTime).reduce((acc, { total }) => acc + total, 0))
            setFinish(true)
          }
        }
        
      }
    }
  };

  const firstPart = words.slice(0, correct_id).join(' ');
  const secondPart = words.slice(correct_id).join(' ');
  return (
    <div class="container">
      {/* --------------------------------------------------------------------------------------- */}
      <div class="d-flex justify-content-between align-items-center" >
        <div>
          <h1 class="my-5">Speaking</h1>
        </div>
        <div>
          <select
            class="form-select form-select-sm"
            aria-label=".form-select-sm example"
            value={option}
            onChange={handleOption}>
            <option value="your">Your Paragraph</option>
            <option value="our">Our Paragraph</option>
            <option value="generated">Generated Paragraph</option>
          </select>
        </div>
      </div>
      {/* --------------------------------------------------------------------------------------- */}


      <div>
        {option === "your" ? (
          <div class="row my-3">

            {editingInputPara == true ? (<div>
              <textarea
                class="form-control"
                rows="20" value={inputPara}
                placeholder="Enter your paragraph here..."
                onChange={(e) => handleInputPara(e)}>
              </textarea>
              <div class="text-center"><button type="button" class="btn btn-secondary btn-sm my-2" style={{ "width": "150px" }} onClick={() => handleSubmitPara()}>Import</button> </div>
            </div>) : (
              <div>
                <pre style={{ "text-align": "justify", "white-space": "pre-wrap" }}><span class="text-success" ><b>{firstPart}</b></span> <span>{secondPart}</span></pre>
                {finish ? (<div class="text-center text-success"> <p>You completed this paragraph in {(totaltime / 1000).toFixed(2)} seconds</p></div>) : (null)}
                <div class="text-center "><button type="button" class="btn btn-secondary btn-sm my-2" style={{ "width": "150px" }} onClick={() => handleEditPara()}>Edit</button> </div>
              </div>)}
            <div >
            </div>
          </div>
        ) : option === "our" ? (
          <p><div class="row my-3"><textarea class="form-control" rows="3" value={para} readonly style={{ "pointer-events": "none;" }}></textarea></div></p>
        ) : option === "generated" ? (
          <div class="row my-3 text-center">
            <textarea
              class="form-control"
              rows="5"
              value={topic}
              placeholder="Enter your topic here ..."
              onChange={(e) => handleTopic(e)}></textarea>
            <div class="text-center">
              {processing ? (<div class="d-flex justify-content-center"><ReactLoading type="bubbles" color="#212529" height={100} width={100} /></div>) : (<button type="button" class="btn btn-secondary btn-sm my-2" style={{ "width": "150px" }} onClick={() => handleGenerate()}>Generate</button>)}

            </div>
            <div class="row m-0 my-3 p-0">
              <pre style={{ "text-align": "justify", "white-space": "pre-wrap" }}><span class="text-success" ><b>{firstPart}</b></span> <span>{secondPart}</span></pre>
              {finish ? (<div class="text-center text-success"> <p>You completed this paragraph in {(totaltime / 1000).toFixed(2)} seconds</p></div>) : (null)}
            </div>

          </div>
        ) : (null)}
      </div>


      {/* --------------------------------------------------------------------------------------- */}
      <div class="row d-flex justify-content-center">
        {state ? (
          <button type="button" onClick={() => mic_handle(true)} class="btn btn-outline-danger p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": MICSIZE, "height": MICSIZE }}>
            <img src={un_mic} style={{ "border-radius": "50%", "width": IMG_MIC_SIZE, "height": IMG_MIC_SIZE }} />
          </button>
        ) : (
          <button type="button" onClick={() => mic_handle(false)} class="btn btn-outline-success p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": MICSIZE, "height": MICSIZE }}>
            <img src={mic} style={{ "border-radius": "50%", "width": IMG_MIC_SIZE, "height": IMG_MIC_SIZE }} />
          </button>
        )}
        <button type="button" onClick={() => reset()} class="btn btn-outline-warning p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": MICSIZE, "height": MICSIZE }}>
          <img src={reset_logo} style={{ "border-radius": "50%", "width": IMG_MIC_SIZE, "height": IMG_MIC_SIZE }} />
        </button>
        <button type="button" onClick={() => handleSkip()} class="btn btn-outline-danger p-0 m-0 mx-1 d-flex align-items-center justify-content-center" style={{ "border-radius": "50%", "width": MICSIZE, "height": MICSIZE }}>
          <img src={skip_logo} style={{ "border-radius": "50%", "width": IMG_MIC_SIZE, "height": IMG_MIC_SIZE }} />
        </button>
      </div>

      {/* --------------------------------------------------------------------------------------- */}
      <div class="row my-3">
        <textarea class="form-control" rows="20" value={transcript} readonly style={{ "pointer-events": "none;" }}></textarea>
      </div>
    </div>
  );
}

export default App;