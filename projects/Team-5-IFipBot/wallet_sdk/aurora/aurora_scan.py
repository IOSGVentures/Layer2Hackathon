#!/usr/bin/python
# -*- coding: utf-8 -*-
import requests
import decimal
import time
from flask import current_app

from app.ext import cache

from ethtoken.abi import EIP20_ABI

def get_base_url():
    return current_app.config.get('AURORA_SCAN_API_BASE_URL', '')

@cache.memoize(timeout=3600)
def get_contract_abi(contract_address, token_type='20'):
    if token_type == '20':
        return EIP20_ABI

    url = '{base_url}/account/{contract_address}'.format(
            base_url=get_base_url(),
            contract_address=contract_address)

    rsp = requests.get(url).json()
    if 'code' not in rsp or not rsp['data']:
        return None
    return rsp['data']['contract']['Abi']
