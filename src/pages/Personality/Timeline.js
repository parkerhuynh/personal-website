
import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import mic from "../../microphone.png"
import un_mic from "../../dis_microphone.png"
import reset_logo from "../../reset.png"
import OpenAI from 'openai';
import ReactLoading from 'react-loading';

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
  
  

  const MICSIZE = 50
  const IMG_MIC_SIZE = MICSIZE * .8
  const reset = () => {
    resetTranscript()
    setCorret_id(0)
    setPara("")
    setInputPara("")
    setTopic("")

  }

  useEffect(() => {
    

    STEPWISE()


  }, [transcript, resetTranscript])

  const mic_handle = (tem_state) => {
    if (tem_state) {
      setState(false)

      SpeechRecognition.stopListening()

    } else {
      setState(true)
      SpeechRecognition.startListening({ continuous: true })
    }
  };
  const handleOption = (event) => {
    const value = event.target.value
    reset()
    
    setOption(value);

  };

  const handleTopic = (event) => {
    const value = event.target.value
    reset()
    setTopic(value);
  };

  const handleInputPara = (event) => {
    const value = event.target.value
    reset()
    setInputPara(value)
  };

  const handleSubmitPara = () => {
    reset()
    setPara(inputPara)

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
    setPara(completion.choices[0].message.content.replace(/Sure!/g, ''));
    setProcessing(false)
  }

  const handleGenerate = () => {
    if (topic != "") {
      var message = "can you give me  a band 7 answer of this IELST speaking task 2. start with 'Sure! '" + topic
      reset()
      ChatGPT(message)
    } else {
      alert("Enter your topic please!")

    }

  };
  const word_checking = (para_word, speaking_word) => {
    
    var para_word = para_word.replace(/,^[^a-zA-Z0-9]*|/mg, "").toLowerCase()
    var para_word = para_word.replace(/,/g, '')
    var para_word = para_word.replace(/\./g, '')
    var para_word = para_word.replace('“', '')
    var para_word = para_word.replace('”', '')
    console.log(para_word)
    var speaking_word = speaking_word.replace(/^[^a-zA-Z0-9]*,|/mg, "").toLowerCase()

    
    // console.log(speaking_word)
    if (speaking_word === para_word) {
      return true
    } else {
      return false
    }
  };


  const words = para.split(' ')
  const STEPWISE = () => {
    var last_word_speak = transcript.split(' ').pop()
    if (words.length === correct_id) {
      reset()
    } else {
      if (last_word_speak != ""  && words[correct_id] != ""  && (word_checking(words[correct_id], last_word_speak))) {
        setCorret_id(correct_id+1)
        if (words.length === correct_id +1) {
          reset()
          setCorret_id(0)
        }
      } 

    }
    
    
    
  };
  
  const firstPart = words.slice(0, correct_id).join(' ');
  const secondPart = words.slice(correct_id).join(' ');
  return (
    <div class="container">
      {/* -----------------------------------HEADER--------------------------------------------- */}
      <div class="row my-5" >
        <h1>Timeline</h1>
      </div>
      {/* --------------------------------------------------------------------------------------- */}
    </div>
  );
}

export default App;