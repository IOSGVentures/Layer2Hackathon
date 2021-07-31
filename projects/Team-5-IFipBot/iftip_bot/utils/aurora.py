#!/usr/bin/python
# -*- coding: utf-8 -*-

import time
import json
import base64
import requests

from flask import current_app
from app.ext import cache
from app.ext import db
from app.models import UserCredential
from app.models import CoinAddress
from app.utils.utils import quantize
from app.utils import ifwallet
from app.utils.coin_setting import get_coin_config


def get_aurora_balance(credential, coin_type):
    coin = get_coin_config(coin_type)
    property_key = coin['property_key']
    res = ifwallet.get_aurora_balance(credential.credential_id, property_key)

    balance = 0
    if res and 'balance' in res:
        balance = res['balance']
    return balance


def get_aurora_address(credential):
    res = ifwallet.get_aurora_address(credential.credential_id)

    address = ''
    if res and 'address' in res:
        address = res['address']
    return address


def send_aurora_tx(credential_id, receivers, coin_type, is_sync, memo):
    coin = get_coin_config(coin_type)
    property_key = coin['property_key']
    res = ifwallet.send_aurora_tx(credential_id, receivers, property_key, is_sync, memo)
    return res
