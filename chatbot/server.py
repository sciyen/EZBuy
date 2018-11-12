#! python3
# coding: utf-8
from flask import Flask, request, render_template
from fbmessenger_api import Messenger, QuickReply, ActionButton
from datetime import datetime, timedelta
from pprint import pprint
import requests, json, csv, ssl, os

app = Flask(__name__)

SERVER_HOST = '0.0.0.0'
SERVER_PORT = 2236
SSL_CTX = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
SSL_CTX.load_cert_chain('ssl/ssl_bundle.crt', 'ssl/private.key')

with open('token.json', 'r') as fin:
    token_info = json.load(fin)
    fin.close()
ACCESS_TOKEN = token_info['access_token']
VERIFY_TOKEN = token_info['verify_token']

GET_STARTED_TEXT = 'get_started_text'
HELP_TEXT = 'help_text'

def addToShoppingCar():
    pass

def showShoppingCar():
    pass

bot = Messenger(ACCESS_TOKEN)

@app.route('/messenger_webhook', methods=['GET'])
def handleVerification():
    if request.args['hub.verify_token'] == VERIFY_TOKEN:
        return request.args['hub.challenge']
    else:
        return 'Invalid verification token'

@app.route('/messenger_webhook', methods=['POST'])
def handleIncomingPostEvents():
    data = request.json
    messaging_section = data['entry'][0]['messaging'][0]
    client_id = messaging_section['sender']['id']
    bot.send_typing_status(sender_id, 3)
    
    client_info = requests.get('https://graph.facebook.com/{psid}'.format(psid = client_id),
                               params = {
                                  'fields': 'name',
                                  'access_token': ACCESS_TOKEN
                               }).json()
    client_name = client_info['name']
    print(client_id, client_name)
    
    # Firstly, check if this is a "messaging_postbacks" Webhook event
    # (This event is triggered when clients press "Get Started", "Shopping Car", & "Help Me" buttons)
    if 'postback' in messaging_section:
        payload = messaging_section['postback']['payload']
        if payload == 'GET_STARTED':
            bot.send_text(client_id, GET_STARTED_TEXT)
        elif payload == 'HELP':
            bot.send_text(client_id, HELP_TEXT)
        elif payload == 'SHOW_SHOPPING_CAR':
            pass
    
    # Secondly, check if this is a "Quick Reply" message
    # (Chatbot received this message when clients remove an item in "Shopping Car" by clicking quick-reply buttons)
    elif 'quick_reply' in messaging_section['message']:
        pass # do something
    
    # Finally, check if this is a general text message
    # (Chatbot received this message when clients add an item to "Shopping Car" by typing in the item's name)
    elif 'quick_reply' not in messaging_section['message'] and 'text' in messaging_section['message']:
        pass # do something
    
    return 'ok', 200

if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, ssl_context=SSL_CTX, debug=True)