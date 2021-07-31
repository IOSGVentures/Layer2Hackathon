import re
import hashlib

from sqlalchemy import or_
from sqlalchemy import and_

from flask import current_app
from telegram.ext import Updater
from telegram.ext import CommandHandler
from telegram.ext import MessageHandler
from telegram.ext import Filters

from app.ext import db
from app.models import *
from app.utils import asset
from app.utils import ifwallet
from app.utils import reg as reg_utils
from app.utils.utils import *
from app.utils import cet
from app.utils import cet_dex
from app.utils import coin_exchange
from app.utils.cmc import get_price_cmc
from app.utils.telegram_sdk import get_chat_member_count
from app.utils.telegram_sdk import get_chat_administrators
from app.utils.exceptions import BusinessError

from app.utils.enums.coin_type import CoinType
from app.utils.enums.coin_type import Blockchain
from app.utils.enums.currency_type import CurrencyType

platform = 'telegram'
default_coin_type = 'ETH-AURORA'

def command_help(update, context):
    add_group_member(update)
    if len(context.args) == 1:
        topic = context.args[0]
        if topic == 'price':
            handle_price_help(update)
        elif topic == 'deposit':
            handle_deposit_help(update)
        elif topic == 'withdraw':
            handle_withdraw_help(update)
        elif topic == 'tip':
            handle_tip_help(update)
        elif topic == 'rain':
            handle_rain_help(update)
        elif topic == 'password':
            handle_password_help(update)
        elif topic == 'pair':
            handle_swap_pair_help(update)
        elif topic == 'swap':
            handle_swap_help(update)
        elif topic == 'bind_mobile':
            handle_bind_mobile_help(update)
        elif topic == 'verify_mobile':
            handle_verify_mobile_help(update)
        elif topic == 'switch_wallet':
            handle_switch_wallet_help(update)

        return

def command_deposit(update, context):
    add_group_member(update)

    if context.args:
        coin_type = context.args[0].upper()
        datas = {'coin': coin_type}
        handle_deposit(update, datas)
    else:
        handle_deposit_help(update)

def command_withdraw(update, context):
    add_group_member(update)
    if context.args:
        datas = {
            "amount": quantize(context.args[0], 8),
            "coin": context.args[1],
            "address": context.args[2],
            "memo": context.args[3] if len(context.args) == 4 else None
        }
        handle_withdraw(update, datas)
    else:
        handle_withdraw_help(update)

def command_balance(update, context):
    add_group_member(update)
    if context.args:
        datas = {'coin': context.args[0]}
        handle_balance(update, datas)
    else:
        handle_balance(update, datas={})

def command_tip(update, context):
    add_group_member(update)
    handle_tip_help(update)

def command_rain(update, context):
    try:
        add_group_member(update)
        if len(context.args) == 4:
            datas = {
                'share': context.args[0],
                'amount': context.args[2],
                'coin': context.args[3]
            }
            handle_rain(update, datas)
        else:
            handle_rain_help(update)
    except:
        current_app.logger.exception('command_rain fail')

def command_password_red_packet(update, context):
    add_group_member(update)
    if len(context.args) == 5:
        datas = {
            'share': context.args[0],
            'amount': context.args[2],
            'coin': context.args[3],
            'password': context.args[4].replace('#', '')
        }
        handle_password_red_packet(update, datas)
    else:
        handle_password_help(update)


