const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Replace these with your actual API details
const NAVANA_API_KEY = process.env.API_KEY;
const NAVANA_CUSTOMER_ID = process.env.CUSTOMER_ID;

function connectNavana(ws) {
  const navanaWs = new WebSocket('wss://bodhi.navana.ai', {
    headers: {
      'API-Key': "HxzJLXX1moRGYzupqscDH4WigoQ36SviCwRUAlOh",
      'Customer-ID': "b23d9d81-7c8f-4fd3-803f-160271661fce",
      'Language-Model': 'en-general-v2-8khz'
    }
  });

  navanaWs.on('open', () => {
    console.log('Connected to Navana WebSocket');
  });

  navanaWs.on('message', (message) => {
    ws.send(JSON.stringify(message));
  });

  navanaWs.on('close', () => {
    console.log('Navana WebSocket connection closed. Reconnecting...');
    setTimeout(() => connectNavana(ws), 5000); // Retry connection after 5 seconds
  });

  navanaWs.on('error', (error) => {
    console.error('Navana WebSocket error:', error);
    ws.close(); // Close the client WebSocket connection on error
  });

  ws.on('message', (message, isRecording) => {
    if (navanaWs.readyState === WebSocket.OPEN) {
      navanaWs.send(message, { recording: isRecording });
    }
  });

  ws.on('error', (error) => {
    console.error('Client WebSocket error:', error);
    navanaWs.close(); // Close the Navana WebSocket connection on client error
  });

  ws.on('close', () => {
    navanaWs.close();
  });
}

wss.on('connection', (ws) => {
  connectNavana(ws);
});

server.listen(5000, () => {
  console.log('WebSocket server listening on ws://localhost:5000');
});
