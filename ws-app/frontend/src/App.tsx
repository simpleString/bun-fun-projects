import { useEffect, useState } from "react";
import "./App.css";

const ws = new WebSocket("ws://localhost:3000/ws");
let i = 0;

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    ws.onmessage = (event) => {
      console.log("Received message:", event);
      setMessages(JSON.parse(event.data));
      // ws.send("hi");
    };

    ws.onopen = (event) => {
      console.log("Connected to WebSocket server", event);
    };
  }, []);

  function addMessage() {
    ws.send("hi" + i);
    i++;
  }

  return (
    <div>
      {messages.map((message) => (
        <div>{message}</div>
      ))}
      <button onClick={addMessage}>Add message</button>
    </div>
  );
}

export default App;
