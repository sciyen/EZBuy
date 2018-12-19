#! python3
# coding: utf-8
from flask import Flask, request, render_template
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId
from urllib import parse
from fbmessenger_api import Messenger, QuickReply, ActionButton, SenderActionType, ButtonType
from datetime import datetime, timedelta
from enum import Enum, IntEnum
from pprint import pprint
import requests, json, csv, ssl, os
import hashlib, hmac

app = Flask(__name__)

SERVER_HOST = '0.0.0.0'
SERVER_PORT = 2236
SSL_CTX = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
SSL_CTX.load_cert_chain('ssl/ssl_bundle.crt', 'ssl/private.key')

with open('config/page_token.json', 'r') as fin:
    token_info = json.load(fin)
    fin.close()
ACCESS_TOKEN = token_info['access_token']
VERIFY_TOKEN = token_info['verify_token']
APP_SECRET = token_info['app_secret']

with open('config/db_config.json', 'r') as fin:
    db_login_info = json.load(fin)
    fin.close()

DB_NAME = db_login_info['db_name']
DB_USERNAME = parse.quote_plus(db_login_info['db_username'])
DB_PASSWORD = parse.quote_plus(db_login_info['db_password'])
db_conn = MongoClient('mongodb://{uid}:{psd}@luffy.ee.ncku.edu.tw:27017/{db_name}'
                      .format(uid=DB_USERNAME, psd=DB_PASSWORD, db_name=DB_NAME))
db = db_conn[DB_NAME]['user_info']

class ConstantVariable(IntEnum):
    ITEM_NUM_LIMIT = 9

class ReplyTemplate(Enum):    
#     GET_STARTED = 'get_started_text'
    GET_STARTED = ('歡迎使用EZBuy聊天機器人\\(ΦωΦ)/\n'
                   '如果不知道要怎麼使用，請先按下「查看使用說明」來了解怎麼使用> <~')
    HELP = ('＊ 直接在訊息欄中輸入想要在成大二手版v2.0裡追蹤的商品名稱，我們會24小時不眠不休替你關注，一發現符合的商品就立刻發訊息通知你喔\\(ΦωΦ)/\n'
    '＊ 如果忘了自己追蹤了哪些東西，或是不想再追蹤了，透過「我的追蹤清單」就可以檢視並刪除自己已經追蹤的物品~\n'
    '＊ 突然失憶忘記要怎麼用EZBuy，可以按「查看使用說明」來重新查看使用說明~\n'
    '＊ 最後最後，如果使用上遇到任何問題或是有話要和我們說，按下「問題/意見回饋」就可以連到官方網頁和我們聯絡喔> <')
#     HELP = '你可以直接在訊息欄中輸入想要在我們的資料庫中追蹤的關鍵字，或是按下「我的追蹤清單」來檢視並修改自己已經追蹤的關鍵字喔~'
    ADD_TO_CART_SUCCESS = '成功將「{item_name}」加入追蹤清單囉！我們將會持續替你關注二手版v2.0中的相關商品~\n（目前你已追蹤了{item_num}/9個商品）'
#     ADD_TO_CART_SUCCESS = '成功將「{item_name}」加入追蹤清單囉！我們將會持續替你關注有沒有相關字詞的出現~\n（目前你已追蹤了{item_num}/9組關鍵字）'
    ADD_TO_CART_FULL = '不好意思，你的追蹤清單滿了耶> <\n先將清單中不想繼續追蹤的商品移除後，再來加入新的商品吧！'
#     ADD_TO_CART_FULL = '不好意思，你的追蹤清單已經滿了> <\n先將清單中不想繼續追蹤的關鍵字移除後，再來加入新的關鍵字吧！'
    ADD_TO_CART_EXISTED = '你之前已經有追蹤這項商品囉^^\n要試試看加入其它的商品嗎> <？'
#     ADD_TO_CART_EXISTED = '你之前已經有追蹤這個關鍵字囉^^\n要試試看加入其它的關鍵字嗎？'
    SHOW_CART_HEAD = '下面是目前你正在追蹤的商品清單~想要移除掉哪個商品呢^^？\n'
#     SHOW_CART_HEAD = '以下是目前你正在追蹤的關鍵字。想要移除掉某個關鍵字嗎？\n'
    SHOW_CART_EMPTY = '你的追蹤清單裡空空如也T_T\n趕快加入第一個想追蹤的商品吧> <！'
#     SHOW_CART_EMPTY = 'show_shopping_cart_empty_text'
    REMOVE_ONE_FROM_CART = '成功將「{item_name}」從追蹤清單移除囉！\n（Tips：想追蹤其它商品，直接在訊息欄輸入商品名稱就可以了~）'
#     REMOVE_ONE_FROM_CART = '成功將「{item_name}」從追蹤清單移除囉！\n（Tips：想追蹤其它關鍵字，直接在訊息欄輸入關鍵字名稱就可以了~）'
    REMOVE_ALL_FROM_CART = '成功將追蹤清單中所有商品移除囉！\n（Tips：想追蹤其它商品，直接在訊息欄輸入商品名稱就可以了~）'
#     REMOVE_ALL_FROM_CART = '成功將追蹤清單中所有關鍵字移除囉！\n（Tips：想追蹤其它關鍵字，直接在訊息欄輸入關鍵字就可以了~）'
    REMOVE_NONE_FROM_CART = '感謝你使用EZBuy，記得隨時關注我們的新消息喔> <'
    ITEM_MATCH = '野生的商品出現了！立刻點擊網址去捕獲它吧\\(ΦωΦ)/\n'
    BUTTON_GROUP = [
        ActionButton(ButtonType.POSTBACK, '我的追蹤清單', payload='SHOW_SHOPPING_CART'),
        ActionButton(ButtonType.POSTBACK, '查看使用說明', payload='SHOW_HELP'),
        ActionButton(ButtonType.WEB_URL, '問題/意見回饋', url='https://www.facebook.com/EZBuy-245463649459051/')
    ]

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
        {"item": "最多9個"}
    ]
    "posts_notified":
    [
        {"post_object_id": "Object_id instance 1"}, 
        {"post_object_id": "Object_id instance 2"}
    ]
}
'''
def checkEventValidity(data_raw, xhub_signature):
    signature = hmac.new(APP_SECRET, data_raw, hashlib.sha1).hexdigest()
    if hmac.compare_digest(signature, xhub_signature.split('=')[1]):
        return True
    else:
        return False
def showUsualButtons(client_id, text):
    '''
    傳送文字&常用的三個按鈕給使用者
    '''
    return bot.send_buttons(client_id, text, ReplyTemplate.BUTTON_GROUP.value)
    
def addToShoppingCart(client_id, client_name, item_name):
    '''
    If the client is a new user of our system, create a new document in mongoDB for the client, 
    and push the item into shopping_cart as the first item; if the client has used our system before, 
    find their document in mongoDB and push the item into shopping_cart. Note that the maximum number 
    of items per client is 9. Thus, a checking procedure is needed.
    '''
    query = {'client_id': client_id}
    client_data_old = db.find_one(query)
    if client_data_old is None:
        item_num_old = 0
        client_data = {
            'client_id': client_id,
            'client_name': client_name,
            'shopping_cart': [{'item': item_name}],
            'posts_notified': []
        }
        db.insert_one(client_data)
    else:
        item_num_old = len(client_data_old['shopping_cart'])
        if item_num_old == ConstantVariable.ITEM_NUM_LIMIT:
            return showUsualButtons(client_id, ReplyTemplate.ADD_TO_CART_FULL.value)       
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
        reply_message = ReplyTemplate.ADD_TO_CART_EXISTED.value
    else:
        reply_message = ReplyTemplate.ADD_TO_CART_SUCCESS.value.format(item_name=item_name, item_num=item_num)
    return showUsualButtons(client_id, reply_message)

def showShoppingCart(client_id):
    '''
    If the client is a new user or the client doesn't have any item in their shopping cart, reply with SHOW_CART_EMPTY.
    Else, query DB and return the item list & quick-reply buttons.
    '''
    query = {'client_id': client_id}
    client_data = db.find_one(query)
    if client_data is None:
        return showUsualButtons(client_id, ReplyTemplate.SHOW_CART_EMPTY.value)
    shopping_cart = client_data['shopping_cart']
    if len(shopping_cart) == 0:
        return showUsualButtons(client_id, ReplyTemplate.SHOW_CART_EMPTY.value)
    quick_replies = []
    reply_message = ReplyTemplate.SHOW_CART_HEAD.value
    for idx, item in enumerate(shopping_cart):
        reply_message += '{num}. {item}\n'.format(num=idx+1, item=item['item'])
        quick_replies.append(QuickReply('第{}項'.format(idx+1), 'REMOVE_ITEM,{}'.format(idx)))
    quick_replies.extend([QuickReply('全部取消', 'REMOVE_ITEM,-1'), QuickReply('沒事了~', 'REMOVE_ITEM,-2')])
    return bot.send_quick_replies(client_id, reply_message, quick_replies)

def removeFromShoppingCart(client_id, item_idx):
    query = {'client_id': client_id}
    if item_idx >= 0:
        client_data_old = db.find_one(query)
        object_id = client_data_old['_id']
        item_name = client_data_old['shopping_cart'][item_idx]['item']
        query = {'_id': object_id}
        update = {
            '$pull': {'shopping_cart': {'item': item_name}}
        }
        client_data = db.find_one_and_update(query, update, return_document=ReturnDocument.AFTER)
        pprint(client_data)
        return showUsualButtons(client_id, ReplyTemplate.REMOVE_ONE_FROM_CART.value.format(item_name=item_name))
    elif item_idx == -1:
        update = {
            '$set': {'shopping_cart': []}
        }
        client_data = db.find_one_and_update(query, update, return_document=ReturnDocument.AFTER)
        pprint(client_data)
        return showUsualButtons(client_id, ReplyTemplate.REMOVE_ALL_FROM_CART.value)
    elif item_idx == -2:
        return showUsualButtons(client_id, ReplyTemplate.REMOVE_NONE_FROM_CART.value)

    
bot = Messenger(ACCESS_TOKEN)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/messenger_webhook', methods=['GET'])
def handleVerification():
    if request.args['hub.verify_token'] == VERIFY_TOKEN:
        return request.args['hub.challenge']
    else:
        return 'Invalid verification token'

@app.route('/messenger_webhook', methods=['POST'])
def handleIncomingPostEvents():
    data = request.json
#     data_raw = json.dumps(request.json)
#     print(request.headers)
#     pprint(data)
#     signature = hmac.new(APP_SECRET, data_raw, hashlib.sha1).hexdigest()
#     print(signature)
    messaging_section = data['entry'][0]['messaging'][0]
    client_id = messaging_section['sender']['id']    
    client_info = requests.get('https://graph.facebook.com/{psid}'.format(psid=client_id),
                               params={
                                  'fields': 'name',
                                  'access_token': ACCESS_TOKEN
                               }).json()
    client_name = client_info['name']
    bot.send_typing_status(client_id, SenderActionType.MARK_SEEN)
    pprint(messaging_section)
    
    # Firstly, check if this is a "messaging_postbacks" Webhook event
    # (This event is triggered when clients press "Get Started", "Shopping Cart", & "Help Me" buttons)
    if 'postback' in messaging_section:
        payload = messaging_section['postback']['payload']
        if payload == 'GET_STARTED':
            print('Incoming event: press button "get started"')
            print('From: {}, psid = {}'.format(client_name, client_id))
            showUsualButtons(client_id, ReplyTemplate.GET_STARTED.value)
        elif payload == 'SHOW_HELP':
            print('Incoming event: press button "help"')
            print('From: {}, psid = {}'.format(client_name, client_id))
            showUsualButtons(client_id, ReplyTemplate.HELP.value)
        elif payload == 'SHOW_SHOPPING_CART':
            print('Incoming event: press button "show shopping cart"')
            print('From: {}, psid = {}'.format(client_name, client_id))
            showShoppingCart(client_id)
    
    # Secondly, check if this is a "Quick Reply" message
    # (Chatbot received this message when clients remove an item in "Shopping Cart" by clicking quick-reply buttons)
    elif 'quick_reply' in messaging_section['message']:
        payload = messaging_section['message']['quick_reply']['payload']
        item_idx = int(payload.split(',')[-1])
        removeFromShoppingCart(client_id, item_idx)
    
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

# @app.route('/match', methods=['POST'])
# def match():
#     data = request.json
#     pprint(data)
#     with open('garbage/test.json', 'w', encoding='utf-8') as fout:
#         json.dump(data, fout, sort_keys=True, indent=4, separators=(',', ':'))
#         fout.close()
#     for client_id in data:
#         item_list = data[client_id]
#         reply_message = ReplyTemplate.ITEM_MATCH.value
#         for item in item_list:
#             reply_message += 'https://www.facebook.com/{}\n'.format(item['post_id'])
#         showUsualButtons(client_id, reply_message)
#     return 'ok', 200

if __name__ == '__main__':
    app.run(host=SERVER_HOST, port=SERVER_PORT, ssl_context=SSL_CTX, debug=True)