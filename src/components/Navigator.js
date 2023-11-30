import { Nav, Navbar, Container, Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from "./AuthContext"
import { useState } from 'react';
import axios from 'axios'

export default function Navigator() {
  const { currentUser, logout } = useAuth()
  const [feedbackShow, setFeedbackShow] = useState(false);
  const [shortcutShow, setShortcutShow] = useState(false);

  async function handleLogout(e) {
    e.preventDefault()
    await logout()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    axios.post('submit_feedback', {
      email: e.target.email.value,
      name: e.target.name.value,
      content: e.target.content.value,
    }).then(res => {
      setFeedbackShow(false)
    })
  }

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand href="/practice">LeetSpec</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/practice">Practice</Nav.Link>
          <Nav.Link href="/stats">Stats</Nav.Link>
          <Nav.Link href="/paragraphs">Paragraphs</Nav.Link>
          <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
          <Nav.Link onClick={() => setFeedbackShow(true)}>Feedback</Nav.Link>
          <Nav.Link onClick={() => setShortcutShow(true)}>Shortcuts</Nav.Link>
        </Nav>
        <Nav>
          {
            (currentUser === null) ? (
              <Nav>
                <Nav.Link href="login">Login</Nav.Link>
                <Nav.Link href="signup">Signup</Nav.Link>
              </Nav>
            ) : (
              <Nav>
                <Nav.Link href="/stats">{currentUser["email"]}</Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </Nav>
            )
          }
        </Nav>
        <Modal
          show={feedbackShow}
          centered
          onHide={() => setFeedbackShow(false)}
        >
          <Modal.Header>
            <Modal.Title>
              Feedback
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <div>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control as="input" placeholder="Enter email" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control as="input" placeholder="Enter name" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="content">
                  <Form.Label>Describe your feedback</Form.Label>
                  <Form.Control as="textarea" placeholder=""  rows={5}/>
                </Form.Group>
              </div>
              <div style={{textAlign: "right"}}>
                <Button onClick={() => setFeedbackShow(false)} style={{marginRight: 10}}>
                  Close
                </Button>

                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
        <Modal
          show={shortcutShow}
          centered
          onHide={() => setShortcutShow(false)}
        >
          <Modal.Header>
            <Modal.Title>
              Shortcuts
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Row>
            <Col sm>Speak next 3 words</Col>
            <Col sm>press Space</Col>
          </Row>
          <Row style={{paddingBottom:20}}>
            <Col sm>Reset paragraph</Col>
            <Col sm>press Enter</Col>
          </Row>
          <Button onClick={() => setShortcutShow(false)} style={{marginRight: 10}}>
            Close
          </Button>
          </Modal.Body>
        </Modal>
      </Container>
    </Navbar>
  );
}