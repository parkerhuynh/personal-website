import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext.js';
import axios from 'axios';
import ReactLoading from 'react-loading';
import { Link } from 'react-router-dom';
import { private_members } from "../../private_members";
import OpenAI from 'openai';

const ChatGPT = () => {
    const [text, setText] = useState(''); // Use useState hook to manage textarea content
    const [response, setResponse] = useState('');
    const [processing, setProcessing] = useState(false);
    const { currentUser } = useAuth();



    const openai = new OpenAI({
        apiKey: "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",
        dangerouslyAllowBrowser: true // This is also the default, can be omitted
    });

    const main = async () => {
        setProcessing(true)
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: text }],
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
        <div className={'background-image-repeat'}>
            <div className="container pt-5">
                <div className="container">
                    {!currentUser ? (
                        <div className="pt-5 text-center">
                            <h1 className="text-danger pb-5">Warning!</h1>
                            <h5 className="text-light">Access Restricted: Please log in to view this content. This area is exclusive to registered users.</h5>
                            <h5 className="text-light"> If you don't have an account, you can <a href="/signup">sign up</a> to access special features and content.</h5>

                        </div>
                    ) : (
                        <>
                            {private_members.includes(currentUser.email) ? (
                                <>
                                    <h3 class="text-light text-center">ChatGPT</h3>
                                    <div class="mt-5">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <textarea
                                                    style={{ backgroundColor: "transparent" }}
                                                    className="form-control text-light"
                                                    id="textarea"
                                                    value={text}
                                                    rows="15"
                                                    onChange={handleTextChange}
                                                    required
                                                ></textarea>
                                            </div>
                                            <div class="text-center">
                                                <button type="submit" className="btn btn-outline-light">Submit</button>
                                            </div>

                                        </form>
                                    </div>
                                    <div class="my-3">
                                        {processing ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <ReactLoading type="spin" color="#212529" height={100} width={100} />
                                            </div>
                                        ) : (
                                            <>
                                                {(response === "") ? (null) : (
                                                    <>
                                                        <div class="row py-5" style={{ backgroundColor: 'rgb(0, 1, 2, 0.7)' }}>
                                                            <div class="col-12" >
                                                                <pre class="text-light" style={{ "text-align": "justify", "white-space": "pre-wrap" }}>{response}</pre>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="pt-5 text-center">
                                    <h1 className="text-danger pb-5">Warning!</h1>
                                    <h5 className="text-light">Access Denied: Your account does not have permission to view this page.</h5>
                                    <h5 className="text-light">Please contact the administrator to request access. 
                                    <span class="text-info"> Email them at dunghuynh110496@gmail.com</span> for further assistance.</h5>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>

    );
};

export default ChatGPT;