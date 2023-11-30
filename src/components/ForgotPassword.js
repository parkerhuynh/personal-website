import React, { useRef, useState } from "react"
import { Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "./AuthContext"
import { Link } from 'react-router-dom'
import backgroundImg from "../background.jpg";
export default function ForgotPassword() {
  const emailRef = useRef()
  const { resetPassword } = useAuth()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setMessage('')
      setError('')
      setLoading(true)
      await resetPassword(emailRef.current.value)
      setMessage("Check your inbox for further instructions!")
    } catch {
      setError('Failed to reset password')
    }

    setLoading(false)
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      {/* Background div with blur */}
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
      <div class="container">
        <div class="row d-flex justify-content-center py-5">
          <div class="col-4 py-5">
            <Card>
              <Card.Body>
                <h2 className="text-center mb-4">Reset Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="danger">{message}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group id="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" ref={emailRef} required />
                  </Form.Group>
                  <div class="text-center my-3">
                    <button disabed={loading} class="btn btn-dark mt-3" type="submit">
                      Reset Password
                    </button>
                  </div>
                </Form>

                <div className="w-100 text-center mt-2">
                  <Link to="/login">Login</Link>
                </div>
                <div className="w-100 text-center mt-2">
                  Need an account? <Link to="/signup">Sign Up</Link>
                </div>
              </Card.Body>
            </Card>


          </div>
        </div>
      </div>
    </div>
  )
}