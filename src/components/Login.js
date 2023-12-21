import { useRef, useState } from "react"
import { Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "./AuthContext"
import { Link, useNavigate } from 'react-router-dom'
import backgroundImg from "../background.jpg";

export default function Login() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setError('')
            setLoading(true)
            await login(emailRef.current.value, passwordRef.current.value)
            navigate("/")
        } catch {
            setError('Failed to sign in')
        }
        setLoading(false)
    }

    return (
        <div className="background-image-repeat">
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    backgroundImage: `url(${backgroundImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(5px)",
                    zIndex: -1  // Ensure it stays behind the content
                }}
            />
            <div class="container pt-5" >
                <div class="row pt-5 d-flex justify-content-center">
                    <div className="col-4">
                        <div class="card">
                            <div class="card-body">
                                <h2 className="text-center mb-4">Log In</h2>
                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form onSubmit={handleSubmit}>

                                    <Form.Group id="email">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" ref={emailRef} required />
                                    </Form.Group>

                                    <Form.Group id="password">
                                        <Form.Label className="mt-3">Password</Form.Label>
                                        <Form.Control type="password" ref={passwordRef} required />
                                    </Form.Group>
                                    <div class="text-center">
                                        <button disabled={loading} class="btn btn-dark mt-3" type="submit">
                                            Log In
                                        </button>
                                    </div>
                                </Form>

                                <div className="w-100 text-center mt-2">
                                    <Link to="/forgot-password">Forgot Password?</Link>
                                </div>
                                <div className="w-100 text-center mt-2">
                                    Need an account? <Link to="/signup">Sign Up</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    )
}