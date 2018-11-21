#! python3
# coding: utf-8
import logging, requests, json
from pprint import pprint
from enum import Enum

URL_BASE = "https://graph.facebook.com/v3.2/"
logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

# send message fields
MESSAGING_TYPE_FIELD = "messaging_type"
TAG_FIELD = "tag"
RECIPIENT_FIELD = "recipient"
MESSAGE_FIELD = "message"
ATTACHMENT_FIELD = "attachment"
TYPE_FIELD = "type"
TEMPLATE_TYPE_FIELD = "template_type"
TEXT_FIELD = "text"
TITLE_FIELD = "title"
SUBTITLE_FIELD = "subtitle"
IMAGE_FIELD = "image_url"
BUTTONS_FIELD = "buttons"
PAYLOAD_FIELD = "payload"
URL_FIELD = "url"
ELEMENTS_FIELD = "elements"
QUICK_REPLIES_FIELD = "quick_replies"
CONTENT_TYPE_FIELD = "content_type"

# received message fields
POSTBACK_FIELD = "postback"


class Recipient(Enum):
    PHONE_NUMBER = "phone_number"
    ID = "id"


class MessageType(Enum):
    TEXT = "text"
    ATTACHMENT = "attachment"


class AttachmentType(Enum):
    IMAGE = "image"
    TEMPLATE = "template"


class TemplateType(Enum):
    GENERIC = "generic"
    BUTTON = "button"
    RECEIPT = "receipt"


class ButtonType(Enum):
    WEB_URL = "web_url"
    POSTBACK = "postback"


class ContentType(Enum):
    TEXT = "text"
    LOCATION = "location"


class SenderActionType(Enum):
    TYPING_ON = "typing_on"
    TYPING_OFF = "typing_off"
    MARK_SEEN = "mark_seen"


class ActionButton:
    def __init__(self, button_type, title, url=None, payload=None):
        self.button_type = button_type
        self.title = title
        self.url = url
        self.payload = payload

    def to_dict(self):
        button_dict = {TYPE_FIELD: self.button_type.value}
        if self.title:
            button_dict[TITLE_FIELD] = self.title
        if self.url:
            button_dict[URL_FIELD] = self.url
        if self.payload:
            button_dict[PAYLOAD_FIELD] = self.payload
        return button_dict


class GenericElement:
    def __init__(self, title, subtitle, image_url, buttons):
        self.title = title
        self.subtitle = subtitle
        self.image_url = image_url
        self.buttons = buttons

    def to_dict(self):
        element_dict = {BUTTONS_FIELD: [
            button.to_dict() for button in self.buttons]}
        if self.title:
            element_dict[TITLE_FIELD] = self.title
        if self.subtitle:
            element_dict[SUBTITLE_FIELD] = self.subtitle
        if self.image_url:
            element_dict[IMAGE_FIELD] = self.image_url
        return element_dict


class QuickReply:
    def __init__(self, title, payload,
                 image_url=None,
                 content_type=ContentType.TEXT):
        self.title = title
        self.payload = payload
        self.image_url = image_url
        if content_type=='location': self.content_type = ContentType.LOCATION
        else: self.content_type = content_type

    def to_dict(self):
        reply_dict = {CONTENT_TYPE_FIELD: self.content_type.value,
                      PAYLOAD_FIELD: self.payload}
        if self.title:
            reply_dict[TITLE_FIELD] = self.title
        if self.image_url:
            reply_dict[IMAGE_FIELD] = self.image_url
        logger.debug(reply_dict)
        return reply_dict


class Messenger(object):
    def __init__(self, access_token):
        self.access_token = access_token
    
    ####
    #def subscribe_to_page(self):
    #    fmt = URL_BASE + "me/subscribed_apps?access_token={token}"
    #    return requests.post(fmt.format(token=self.access_token))
    ####

    # Edited by FlyingPuppy
    def set_greeting_text(self, text):
        #data = {"setting_type": "greeting", "greeting": {"text": text}}
        #fmt = URL_BASE + "thread_settings?access_token={token}"
        data = {"greeting": [{"locale":"default","text": text}]}        
        fmt = URL_BASE + "me/messenger_profile?access_token={token}"
        r = requests.post(fmt.format(token=self.access_token),
                headers={"Content-Type": "application/json"},
                json=data)
        print(self.set_greeting_text.__name__,":", r.text)
        
    # Edited by FlyingPuppy
    def set_get_started_button_payload(self, payload):        
        #data = {"setting_type": "call_to_actions",
        #        "thread_state": "new_thread",
        #        "call_to_actions": [{"payload": payload}]}
        #fmt = URL_BASE + "thread_settings?access_token={token}"       
        data = {"get_started": {"payload": payload}}
        fmt = URL_BASE + "me/messenger_profile?access_token={token}"
        r = requests.post(fmt.format(token=self.access_token),
                headers={"Content-Type": "application/json"},
                json=data)
        print(self.set_get_started_button_payload.__name__,":", r.text)

    ###
    #def get_user_name(self, user_id):
    #    fmt = URL_BASE + user_id + "?fields=first_name"
    #    print(fmt)
    #    data = requests.get(fmt)
    #    print(data)
    ###

    def send_text(self, user_id, text, is_response=True):
        messaging_type = "RESPONSE" if is_response else "MESSAGE_TAG"
        message_content = {MESSAGING_TYPE_FIELD: messaging_type,
                           RECIPIENT_FIELD: self._build_recipient(user_id),
                           MESSAGE_FIELD: {MessageType.TEXT.value: text}}
        if not is_response: message_content[TAG_FIELD] = "NON_PROMOTIONAL_SUBSCRIPTION"
        self._send(message_content)

    def send_image(self, user_id, image, is_response=True):
        messaging_type = "RESPONSE" if is_response else "MESSAGE_TAG"
        message_content = {MESSAGING_TYPE_FIELD: messaging_type,
                           RECIPIENT_FIELD: self._build_recipient(user_id),
                           MESSAGE_FIELD: {
                               ATTACHMENT_FIELD: {
                                   TYPE_FIELD: AttachmentType.IMAGE.value,
                                   PAYLOAD_FIELD: {
                                       URL_FIELD: image
                                   }
                               }
                           }}
        if not is_response: message_content[TAG_FIELD] = "NON_PROMOTIONAL_SUBSCRIPTION"
        self._send(message_content)

    def send_buttons(self, user_id, title, button_list, is_response=True):
        buttons = [button.to_dict() for button in button_list]
        messaging_type = "RESPONSE" if is_response else "MESSAGE_TAG"
        message_content = {MESSAGING_TYPE_FIELD: messaging_type,
                           RECIPIENT_FIELD: self._build_recipient(user_id),
                           MESSAGE_FIELD: {
                               ATTACHMENT_FIELD: {
                                   TYPE_FIELD: AttachmentType.TEMPLATE.value,
                                   PAYLOAD_FIELD: {
                                       TEMPLATE_TYPE_FIELD: TemplateType.BUTTON.value,
                                       TEXT_FIELD: title,
                                       BUTTONS_FIELD: buttons
                                   }
                               }
                           }}
        if not is_response: message_content[TAG_FIELD] = "NON_PROMOTIONAL_SUBSCRIPTION"
        self._send(message_content)

    def send_generic(self, user_id, element_list, is_response=True):
        elements = [element.to_dict() for element in element_list]
        messaging_type = "RESPONSE" if is_response else "MESSAGE_TAG"
        message_content = {MESSAGING_TYPE_FIELD: messaging_type,
                           RECIPIENT_FIELD: self._build_recipient(user_id),
                           MESSAGE_FIELD: {
                               ATTACHMENT_FIELD: {
                                   TYPE_FIELD: AttachmentType.TEMPLATE.value,
                                   PAYLOAD_FIELD: {
                                       TEMPLATE_TYPE_FIELD: TemplateType.GENERIC.value,
                                       ELEMENTS_FIELD: elements
                                   }
                               }
                           }}
        if not is_response: message_content[TAG_FIELD] = "NON_PROMOTIONAL_SUBSCRIPTION"
        self._send(message_content)

    def send_quick_replies(self, user_id, title, reply_list, is_response=True):
        replies = list(dict())
        for r in reply_list:
            replies.append(r.to_dict())
        messaging_type = "RESPONSE" if is_response else "MESSAGE_TAG"
        message_content = {MESSAGING_TYPE_FIELD: messaging_type,
                           RECIPIENT_FIELD: self._build_recipient(user_id),
                           MESSAGE_FIELD: {
                               TEXT_FIELD: title,
                               QUICK_REPLIES_FIELD: replies
                           }}
        if not is_response: message_content[TAG_FIELD] = "NON_PROMOTIONAL_SUBSCRIPTION"
        self._send(message_content)

    def send_typing_status(self, user_id, sender_action):
        if isinstance(sender_action, SenderActionType): sender_action = sender_action.value
        messaging_type = "RESPONSE"
        data = {MESSAGING_TYPE_FIELD: messaging_type,
                RECIPIENT_FIELD: self._build_recipient(user_id),
                "sender_action": sender_action}
        fmt = URL_BASE + "me/messages?access_token={token}"
        return requests.post(fmt.format(token=self.access_token),
                             headers={"Content-Type": "application/json"},
                             json=data)

    @staticmethod
    def _build_recipient(user_id):
        return {Recipient.ID.value: user_id}

    def _send(self, message_data):
        post_message_url = URL_BASE + "me/messages?access_token={token}"
        response_message = json.dumps(message_data)
        logger.debug(response_message)
        req = requests.post(post_message_url.format(token = self.access_token),
                            headers = {"Content-Type": "application/json"},
                            data = response_message)
        fmt = "[{status}/{reason}/{text}] Reply to {recipient}: {content}"
        logger.debug(fmt.format(status = req.status_code,
                                reason = req.reason,
                                text = req.text,
                                recipient = message_data[RECIPIENT_FIELD],
                                content = message_data[MESSAGE_FIELD]))
