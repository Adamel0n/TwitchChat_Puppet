import asyncio
import time
import threading
import websockets
import logging

connection = None
is_connected = False
hasRun = False

# Tokens and servers
TWITCH_SERVER = "wss://irc-ws.chat.twitch.tv:443"
CHANNEL = "#CHANNELNAME"
BOT_NICK = "BOTNAME"
OAUTH_TOKEN = "oauth:#################"
#endregion


# WebSocket server handler

async def handle_connection(websocket):
    global connection, is_connected
    print("New connection established")
    is_connected = True
    connection = websocket
    try:
        async for message in websocket:
            print(f"Received message: {message}")
            await websocket.send(f"Echo: {message}")
            
    except websockets.ConnectionClosed:
        print("Connection closed by client")
        is_connected = False

    except Exception as e:
        print("Connection closed cleanly")

    finally:
        await websocket.close()
        is_connected = False
        print("Connection closed")

# Function that handles sending messages to the client

async def send_message(message):
    global connection
    if connection is not None :
        await asyncio.sleep(0.3)  # slight delay to ensure connection stability
        await connection.send(message)

# Main function to start the WebSocket server and handle console input

async def main():
    logging.getLogger("websockets.server").setLevel(logging.CRITICAL)
    print(">>> Starting WebSocket server...")
    loop = asyncio.get_running_loop()

    async with websockets.serve(handle_connection, "localhost", 8765):
        print("Server started on ws://localhost:8765")

        # Start console input thread
        threading.Thread(target=input_Thread, args=(loop,), daemon=True).start()

        # Start Twitch reader loop
        # await twitch_reader()
        
        # asyncio.create_task(test_Loop())    
        await asyncio.Future()  # run forever

# Test loop to send messages at intervals (May be used for twitch chat)

async def test_Loop():
    global is_connected, connection
    while True:
        await asyncio.sleep(1)
        try:
            if is_connected:
                message = await asyncio.to_thread(input, "Enter message to send: ")
                json_String = '{"type": "talk_start", "message": "' + message + '"}'
                await send_message(json_String)

        except websockets.exceptions.ConnectionClosed:
            print("Connection lost during message send")
            is_connected = False
            connection = None

# Thread function to handle console input without blocking the main event loop

def input_Thread(loop):
    while True:
        if (not is_connected):
            time.sleep(0.1)
            continue

        message = input("Enter a message to send: ")
        json_String = '{"type": "talk_start", "message": "' + message + '"}'
        asyncio.run_coroutine_threadsafe(send_message(json_String), loop)
        time.sleep(0.3) # slight delay to ensure good messaging flow

# Read Twitch chat messages

"""
async def twitch_reader():
    uri = TWITCH_SERVER
    async with websockets.connect(uri) as ws:
        await ws.send(f"PASS {OAUTH_TOKEN}")
        await ws.send(f"NICK {BOT_NICK}")
        await ws.send(f"JOIN {CHANNEL}")

        while True:
            try:
                message = await ws.recv()
                if connection is not None :
                    # Respond to Twitch's PING messages to maintain the connection alive
                    if message.startswith("PING"):
                        print("Received PING from Twitch, sending PONG...")
                        await ws.send("PONG :tmi.twitch.tv")
                        continue

                    # Only sending messages that are Chat messages, which contain "PRIVMSG" in the Twitch IRC protocol
                    if "PRIVMSG" in message:
                        # Parsing the Twitch chat message to extract the actual chat content
                        message = message.split(":")[2].strip()

                        # Twitch chat is converted to a json and sent to client
                        json_String = '{"type": "talk_start", "message": "' + message + '"}'
                        await send_message(json_String)
            except Exception as e:
                print (f"Error in Twitch reader: {e}")
                await asyncio.sleep(2)  # Wait before trying to reconnect

"""
                
# Entry point of the script

if __name__ == "__main__":
    asyncio.run(main())
