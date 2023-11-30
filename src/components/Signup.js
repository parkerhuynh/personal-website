import React, { useRef, useState, useEffect } from "react"
import { Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "./AuthContext"
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';

export default function Signup() {
  const emailRef = useRef()
  const nameRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userNames, setUsernames] = useState([])
  const [userEmails, setUserEmails] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await axios.get('/get_user_list');
    // console.log(response.data["username"])
    setUsernames(response.data["username"])
    setUserEmails(response.data["email"])
  };

  async function handleSubmit(e) {
    e.preventDefault()

    if ((userNames.includes(nameRef.current.value)) || (userEmails.includes(emailRef.current.value))) {
      if (userNames.includes(nameRef.current.value)) {
        return setError('The username is already taken. Please try a different username.')
      } else {
        return setError('The email is already taken. Please try a different username.')
      }

    } else {
      if (passwordRef.current.value !== passwordConfirmRef.current.value) {
        return setError('Passwords do not match')
      }
      try {
        setError('')
        setLoading(true)
        await signup(emailRef.current.value, passwordRef.current.value)

        axios.post('create_user', {
          "email": emailRef.current.value,
          "password": passwordRef.current.value,
          "name": nameRef.current.value
        }).then(() => {
          navigate("/")
        })
      } catch (err) {
        console.log((err))
        setError('Failed to create an account')
      }
      setLoading(false)

    }
  }


  return (
    <div class="container">
      <div class="row d-flex justify-content-center my-5">
        <div class="col-4">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Sign Up</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form.Group id="name">
                <Form.Label>Name</Form.Label>
                <Form.Control type="name" ref={nameRef} required />
              </Form.Group>
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" ref={emailRef} required />
                </Form.Group>

                <Form.Group id="password">
                  <Form.Label className="w-100 mt-3">Password</Form.Label>
                  <Form.Control type="password" ref={passwordRef} required />
                </Form.Group>

                <Form.Group id="password-confirm">
                  <Form.Label className="w-100 mt-3">Password Confirmation</Form.Label>
                  <Form.Control type="password" ref={passwordConfirmRef} required />
                </Form.Group>
                <div class="text-center">
                  <button disabled={loading} class="btn btn-dark mt-3" type="submit">
                    Sign Up
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  )
}