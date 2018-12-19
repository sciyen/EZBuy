#! python3
# coding: utf-8
from fbmessenger_api import Messenger
import json

with open('config/page_token.json', 'r') as fin:
    token_info = json.load(fin)
    fin.close()
ACCESS_TOKEN = token_info['access_token']
VERIFY_TOKEN = token_info['verify_token']

bot = Messenger(ACCESS_TOKEN)
bot.set_greeting_text('你好，{{user_full_name}}，我們是NCKU EZbuy！\n')
bot.set_get_started_button_payload("GET_STARTED")