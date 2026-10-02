# WebSocket-Puppet
Creates a puppet that will repeat any words sent to it through a server connected using WebSockets. Server sends words sent through the terminal or through a twitch channel's chat

## Installation
Follow these steps to ensure the program functions as intended
1. Clone down every file in this project
2. Ensure that you have the latest version of Python installed on your computer
3. Install WebSockets for Python
    - For Windows 11, open the terminal and run this command: "py -m pip install websockets"
  
## Setup
When first downloading, the server will only send text to the client through the console. To allow for Twitch chat to be sent, the following steps must be followed:
1. Open Puppet.py
2. Inside this file, locate the "Tokens and Servers" section on line 11
3. Here there are a few variables that need to be filled in. Fill them in as follows:
    - CHANNEL: This will be your channel's login username. Enter as "#CHANNELNAME"
    - BOT_NICK: This is the name of the account that will read twitch chat. To fill this in, first create an account to be used as a bot. Input the username of this bot account here as "CHANNELNAME"
    - OAUTH_TOKEN: This will be the OAUTH token, which represents the permissions that the bot account has been given. To get this token, go to https://twitchtokengenerator.com
        - At this website, scroll down and enable "chat:read" under available token scopes, and then scroll down and click "generate token"
        - The website will then ask you to authorize, make sure you are logged into your bot account before clicking authorize
        - Once authorizing, you will get your token called "Access token". Make sure to never share this publicly
        - Once you have your token, fill it into the variable as "oauth:################"
     
4. Uncomment line 65 and lines 102 - 132
