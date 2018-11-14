#! python3
# coding: utf-8
from flask import Flask, request, render_template
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId
from urllib import parse
from fbmessenger_api import Messenger, QuickReply, ActionButton, SenderActionType
from datetime import datetime, timedelta
from enum import Enum, IntEnum
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

with open('db_login_info.json', 'r') as fin:
    db_login_info = json.load(fin)
    fin.close()

DB_NAME = db_login_info['db_name']
DB_USERNAME = parse.quote_plus(db_login_info['db_username'])
DB_PASSWORD = parse.quote_plus(db_login_info['db_password'])
db_conn = MongoClient('mongodb://{uid}:{psd}@luffy.ee.ncku.edu.tw:27017/{db_name}'
                      .format(uid=DB_USERNAME, psd=DB_PASSWORD, db_name=DB_NAME))
db = db_conn[DB_NAME]['user_info']

class ConstantVariable(IntEnum):
    ITEM_NUM_LIMIT = 10

class TextTemplate(Enum):    
    GET_STARTED = 'get_started_text'
    HELP = 'help_text'
    ADD_TO_CART_SUCCESS = '成功將「{item_name}」加入追蹤清單囉！我們將會持續替你關注有沒有相關的貼文~\n（目前你已經追蹤了{item_num}個商品，最多10個）'
    ADD_TO_CART_FULL = '不好意思，你的追蹤清單已經滿了> <\n先將清單中不想繼續追蹤的商品移除後，再來加入新的商品吧！'
    ADD_TO_CART_EXISTED = '你之前已經有追蹤這項商品囉^^\n要試試看加入其它的商品嗎？'
    SHOW_CART_HEAD = 'show_shopping_cart_head_text'
    SHOW_CART_TAIL = 'show_shopping_cart_tail_text'
    SHOW_CART_EMPTY = 'show_shopping_cart_empty_text'
    REMOVE_ITEM_FROM_CART = 'remove_item_from_cart_text'

'''
database(collection) document example:
{
    "client_id": "12345678",
    "client_name": "空條承太郎",
    "shopping_cart": 
    [
        {"item": "衣服"},
        {"item": "球拍"},
        {"item": "有的沒的"},
        {"item": "最多10個"}
    ]
}
'''

def addToShoppingCart(client_id, client_name, item_name):
    '''
    If the client is a new user of our system, create a new document in mongoDB for the client, 
    and push the item into shopping_cart as the first item; if the client has used our system before, 
    find their document in mongoDB and push the item into shopping_cart. Note that the maximum number 
    of items per client is 10 (-> 8, maybe?). Thus, a checking procedure is needed.
    '''
    query = {'client_id': client_id}
    client_data_old = db.find_one(query)
    if client_data_old is None:
        insert_data = {
            'client_id': client_id,
            'client_name': client_name,
            'shopping_cart': [{'item': item_name}]
        }
        db.insert_one(insert_data)
        item_num = 1
    else:
        item_num_old = len(client_data_old['shopping_cart'])
        if item_num_old == ConstantVariable.ITEM_NUM_LIMIT.value:
            bot.send_text(client_id, TextTemplate.ADD_TO_CART_FULL.value)
            return        
        object_id = client_data_old['_id']
        query = {'_id': object_id}
        update = {
            '$addToSet': {
                'shopping_cart': {'$each': [{'item': item_name}]}
            },
            '$set': {
                'client_name': client_name
            }
        }
        client_data = db.find_one_and_update(query, update, return_document=ReturnDocument.AFTER)
        item_num = len(client_data['shopping_cart'])
        if item_num == item_num_old:
            bot.send_text(client_id, TextTemplate.ADD_TO_CART_EXISTED.value)
            return
    bot.send_text(client_id, TextTemplate.ADD_TO_CART_SUCCESS.value.format(item_name=item_name, item_num=item_num))
    return
#     print('Reply')

def showShoppingCart(client_id):
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
    client_info = requests.get('https://graph.facebook.com/{psid}'.format(psid=client_id),
                               params={
                                  'fields': 'name',
                                  'access_token': ACCESS_TOKEN
                               }).json()
    client_name = client_info['name']
    bot.send_typing_status(client_id, SenderActionType.MARK_SEEN)
    
    # Firstly, check if this is a "messaging_postbacks" Webhook event
    # (This event is triggered when clients press "Get Started", "Shopping Cart", & "Help Me" buttons)
    if 'postback' in messaging_section:
        payload = messaging_section['postback']['payload']
        if payload == 'GET_STARTED':
            bot.send_text(client_id, TextTemplate.GET_STARTED.value)
        elif payload == 'HELP':
            bot.send_text(client_id, TextTemplate.HELP.value)
        elif payload == 'SHOW_SHOPPING_CART':
            pass # do something
    
    # Secondly, check if this is a "Quick Reply" message
    # (Chatbot received this message when clients remove an item in "Shopping Cart" by clicking quick-reply buttons)
    elif 'quick_reply' in messaging_section['message']:
        pass # do something
    
    # Finally, check if this is a general text message
    # (Chatbot received this message when clients add an item to "Shopping Car" by typing in the item's name)
    elif 'quick_reply' not in messaging_section['message'] and 'text' in messaging_section['message']:
        item_name = messaging_section['message']['text']
        print('Incoming event: general text message')
        print('From: {}, psid = {}'.format(client_name, client_id))
        print('Message text:', item_name)
        bot.send_typing_status(client_id, SenderActionType.TYPING_ON)
        addToShoppingCart(client_id, client_name, item_name)
    else: pass

    return 'ok', 200

if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, ssl_context=SSL_CTX, debug=True)