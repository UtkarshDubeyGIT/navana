import websocket
import json
import os
import pyaudio
import time

API_KEY = os.getenv('API_KEY')
CUSTOMER_ID = os.getenv('CUSTOMER_ID')

def on_message(ws, message):
    data = json.loads(message)
    print(f"Received message: {data}")

def on_error(ws, error):
    print(f"WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket connection closed. Reconnecting...")

def on_open(ws):
    print("WebSocket connection opened")

def connect():
    ws = websocket.WebSocketApp(
        "wss://bodhi.navana.ai",
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        header={
            'API-Key': API_KEY,
            'Customer-ID': CUSTOMER_ID
        }
    )
    ws.on_open = on_open

    audio = pyaudio.PyAudio()
    stream = audio.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=16000,
        input=True,
        frames_per_buffer=1024
    )

    try:
        while True:
            data = stream.read(1024)
            ws.send(data)
    except KeyboardInterrupt:
        pass
    finally:
        stream.stop_stream()
        stream.close()
        audio.terminate()
        ws.close()

def main():
    while True:
        try:
            connect()
        except Exception as e:
            print(f"Connection failed: {e}. Retrying in 2 seconds...")
            time.sleep(2)

if __name__ == "__main__":
    main()
