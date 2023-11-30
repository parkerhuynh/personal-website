import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactLoading from 'react-loading';
import { Link } from 'react-router-dom';
import OpenAI from 'openai';

const ChatGPT = () => {
    const [text, setText] = useState(''); // Use useState hook to manage textarea content
    const [response, setResponse] = useState('');
    const [processing, setProcessing] = useState(false);


    const openai = new OpenAI({
        apiKey: "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",
        dangerouslyAllowBrowser: true // This is also the default, can be omitted
    });
    
    const main = async () => {
        setProcessing(true)
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: text}],
            model: "gpt-3.5-turbo",
          });
        setResponse(completion.choices[0].message.content);
        setProcessing(false)
    }
    const handleTextChange = (e) => {
        setText(e.target.value); // Update text state with the textarea value
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        main()

    };

    
    return (
        <div className="container mt-5">
            <h1>ChatGPT</h1>
            <div class="mt-5">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="textarea" className="form-label">Type Here:</label>
                        <textarea
                            className="form-control"
                            id="textarea"
                            value={text}
                            rows="15"
                            onChange={handleTextChange}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
            <div class="my-3">
            {processing ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ReactLoading type="spin" color="#212529" height={100} width={100} />
                    </div>
                ) : (
                <div class="row">
                    <div class="col-12" >
                        <pre style={{ "text-align": "justify","white-space": "pre-wrap"}}>{response}</pre>
                        </div>
                    </div>)}
                
            </div>
        </div>

    );
};

export default ChatGPT;