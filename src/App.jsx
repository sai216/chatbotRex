// App.jsx
import React, { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import BarChartComponent from './Activity/BarChartComponent';
import PieChartComponent from './Activity/PieChartComponent';

const API_KEY = process.env.REACT_OPENAI_API_KEY;

const systemMessage = {
  role: "system",
  content: "Explain things like you're talking to a software professional with 2 years of experience."
};

let lastRequestTime = 0;
const requestInterval = 1000; // 1 second

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processMessageToChatGPT(apiRequestBody) {
  const currentTime = Date.now();
  if (currentTime - lastRequestTime < requestInterval) {
    await delay(requestInterval - (currentTime - lastRequestTime));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded. Waiting to retry...");
        await delay(requestInterval); // Wait before retrying
        return await processMessageToChatGPT(apiRequestBody); // Retry the request
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log(data); // Log the response to understand its structure

    const messageContent = data.choices[0]?.message?.content || "Error: No response from API";
    return messageContent;

  } catch (error) {
    console.error("Error:", error);
    return "Sorry, something went wrong.";
  } finally {
    lastRequestTime = Date.now(); // Update the last request time
  }
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: new Date().toISOString().split('T')[0], // current date
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const handleSend = async (message) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user",
      sentTime: currentDate
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    
    setIsTyping(true);
    const responseMessage = await processMessageToChatGPT({
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...newMessages.map(msg => ({ role: msg.sender === "ChatGPT" ? "assistant" : "user", content: msg.message }))
      ]
    });

    const newChatMessages = [...newMessages, {
      message: responseMessage,
      sender: "ChatGPT",
      sentTime: new Date().toISOString().split('T')[0] // Get current date
    }];
    setMessages(newChatMessages);
    setIsTyping(false);

    // Update statistics data for BarChart
    const messageCountByDate = newChatMessages.reduce((acc, msg) => {
      const date = msg.sentTime;
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    setStatsData(Object.entries(messageCountByDate).map(([date, count]) => ({ name: date, value: count })));

    // Update data for PieChart
    const messageCountBySender = newChatMessages.reduce((acc, msg) => {
      if (!acc[msg.sender]) acc[msg.sender] = 0;
      acc[msg.sender]++;
      return acc;
    }, {});

    setPieData(Object.entries(messageCountBySender).map(([sender, count]) => ({ name: sender, value: count })));
  };

  return (
    <div className="App">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "50%" }}>
          <div style={{ position: "relative", height: "800px", width: "100%" }}>
            <MainContainer>
              <ChatContainer>
                <MessageList
                  scrollBehavior="smooth"
                  typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
                >
                  {messages.map((message, i) => (
                    <Message key={i} model={message} />
                  ))}
                </MessageList>
                <MessageInput placeholder="Type message here" onSend={handleSend} />
              </ChatContainer>
            </MainContainer>
          </div>
        </div>
        <div style={{ width: "50%" }}>
          <BarChartComponent data={statsData} />
          <PieChartComponent data={pieData} />
        </div>
      </div>
    </div>
  );
}

export default App;
