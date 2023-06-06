import './App.css'
import React, { useEffect, useState } from 'react'
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition'

const healthConditions = [
  'Cold',
  'Flu',
  'Headache',
  'Allergies',
  'Stomachache'
  // Add more health conditions as needed
]

const severityLevels = ['Low', 'Medium', 'High']

function App () {
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition()
  const [listening, setListening] = useState(false)
  const [isAudio, setIsAudio] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('')
  const [start, setStart] = useState(true)

  const handleMessageSubmit = async event => {
    setLoading(true)
    event.preventDefault()
    const message = event.target.elements.message.value
    event.target.elements.message.value = ''
    const sentMessage = isAudio ? transcript : message

    setMessages(prevMessages => [
      ...prevMessages,
      { content: sentMessage, sender: 'user' }
    ])
    // Send message and selected condition/severity to backend for processing
    const response = await fetch(`${process.env.REACT_APP_PROXY_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: sentMessage,
        condition: selectedCondition,
        severity: selectedSeverity
      })
    })
    const data = await response.json()

    // Update messages with bot's response
    setMessages(prevMessages => [
      ...prevMessages,
      { content: data.response, sender: 'bot' }
    ])

    setStart(false)
    setLoading(false)
  }

  useEffect(() => {
    if (listening) {
      SpeechRecognition.startListening({ continuous: true })
      setTimeout(() => {
        SpeechRecognition.stopListening()
        setListening(false)
        setIsAudio(true)
      }, 10000)
    }
  }, [listening])

  const handleStartListening = () => {
    resetTranscript()
    setListening(true)
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>
  }

  return (
    <>
      <div className='App'>
        <h1>Health Chatbot</h1>
        <div className='message-container'>
          {start ? (
            <></>
          ) : loading ? (
            <div className='spinner-container'>
              <div className='spinner'></div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === 'user' ? 'user' : 'bot'
                }`}
              >
                <h3>{message.sender}</h3>
                <p>{message.content}</p>
              </div>
            ))
          )}
        </div>
        <br />
        {browserSupportsSpeechRecognition ? (
          <>
            <div>
              <span>
                You can either use Microphone or textbox below to describe your
                situation better.
              </span>
              <p>Microphone: {listening ? 'on' : 'off'}</p>
              <button onClick={handleStartListening}>
                {listening ? 'Stop' : 'Start'}
              </button>
              &nbsp;
              <button onClick={resetTranscript}>Reset</button>
              {listening ? null : <p>{transcript}</p>}
            </div>

            <form onSubmit={handleMessageSubmit}>
              <div>
                <label htmlFor='condition'>Health Condition:</label>
                &nbsp;
                <select
                  id='condition'
                  name='condition'
                  value={selectedCondition}
                  onChange={event => setSelectedCondition(event.target.value)}
                >
                  <option value=''>Select a condition</option>
                  {healthConditions.map((condition, index) => (
                    <option key={index} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
              <br />
              <div>
                <label htmlFor='severity'>Severity:</label>
                &nbsp;
                <select
                  id='severity'
                  name='severity'
                  value={selectedSeverity}
                  onChange={event => setSelectedSeverity(event.target.value)}
                >
                  <option value=''>Select severity</option>
                  {severityLevels.map((severity, index) => (
                    <option key={index} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>
              <br />
              <input
                type='text'
                name='message'
                placeholder='Enter your message'
              />
              &nbsp;
              <br />
              <br />
              <span>Submit your query here.</span>
              <br />
              <button type='submit'>Send</button>
            </form>
          </>
        ) : (
          <form onSubmit={handleMessageSubmit}>
            <div>
              <label htmlFor='condition'>Health Condition:</label>
              &nbsp;
              <select
                id='condition'
                name='condition'
                value={selectedCondition}
                onChange={event => setSelectedCondition(event.target.value)}
              >
                <option value=''>Select a condition</option>
                {healthConditions.map((condition, index) => (
                  <option key={index} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
            <br />
            <div>
              <label htmlFor='severity'>Severity:</label>
              &nbsp;
              <select
                id='severity'
                name='severity'
                value={selectedSeverity}
                onChange={event => setSelectedSeverity(event.target.value)}
              >
                <option value=''>Select severity</option>
                {severityLevels.map((severity, index) => (
                  <option key={index} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>
            <br />
            <input
              type='text'
              name='message'
              placeholder='Enter your message'
            />
            &nbsp;
            <br />
            <br />
            <span>Submit your query here.</span>
            <br />
            <button type='submit'>Send</button>
          </form>
        )}
      </div>
    </>
  )
}

export default App
