#!/usr/bin/python
# -*- coding: utf-8 -*-

from web3 import Web3
from flask import current_app

from app.utils.utils import quantize
from app.utils.utils import current_timestamp
from app.utils.enums.coin_type import CoinType
from app.utils.enums.coin_type import Slip44CoinType

from app.models import HDCredentialWallet
from app.models import UserAddress
from app.models import HDCredential

from app.schedules.hd_wallet import init_wallets_task
from app.utils.enums.network import NetCode
from app.utils.bitcoinify.mnemonic import get_node_from_mnemonic

from app.utils.aurora.aurora_scan import get_contract_abi

class AuroraCli():
    w3 = None

    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(current_app.config.get('AURORA_RPC_BASE_URL', '')))

    def get_token_decimal(self, contract_address):
        abi = get_contract_abi(contract_address)
        contract_address = Web3.toChecksumAddress(contract_address)
        contract = self.w3.eth.contract(abi=abi, address=contract_address)
        decimal = int(contract.functions.decimals().call())
        return decimal

    def get_balance(self, address):
        balance = 0
        try:
            balance = quantize(self.w3.eth.getBalance(self.w3.toChecksumAddress(address)) / (10 ** 18), 8)
        except:
            current_app.logger.exception('get_aurora_balance failed')
        return balance

    def get_aurora20_token_balance(self, contract_address, address):
        abi = get_contract_abi(contract_address)
        address = Web3.toChecksumAddress(address)
        contract_address = Web3.toChecksumAddress(contract_address)
        contract = self.w3.eth.contract(abi=abi, address=contract_address)
        print(contract.functions)
        decimal = int(contract.functions.decimals().call())
        balance = contract.functions.balanceOf(address).call()
        balance = quantize(balance / (10 ** decimal), 8)
        return balance

    def send_raw_transaction(self, private_key, to, amount, gas=100000):
        try:
            account = self.w3.eth.account.privateKeyToAccount(private_key)
            tx = self.w3.eth.account.signTransaction(
                dict(
                    nonce=self.w3.eth.getTransactionCount(account.address),
                    gasPrice=self.w3.eth.gasPrice,
                    gas=gas,
                    to=self.w3.toChecksumAddress(to),
                    value=int(float(amount) * (10 ** 18))
                ),
                account.privateKey
            )
            tx = self.w3.eth.sendRawTransaction(tx.rawTransaction)
            tx = self.w3.toHex(tx).replace('0x', '', 1)
            return tx
        except:
            current_app.logger.exception('aurora send_raw_transaction failed')

        return None


    def send_token_raw_transaction(self, contract_address, private_key, to, amount, gas=500000):
        try:
            abi = get_contract_abi(contract_address)
            account = self.w3.eth.account.privateKeyToAccount(private_key)
            decimal = self.get_token_decimal(contract_address)

            code = self.w3.eth.getCode(self.w3.toChecksumAddress(contract_address))
            contract = self.w3.eth.contract(abi=abi, bytecode=code, address=self.w3.toChecksumAddress(contract_address))

            current_app.logger.debug('aurora send token amount %s %s %s', contract_address, to, amount)
            transaction = contract.functions.transfer(self.w3.toChecksumAddress(to), int(float(amount) * (10 ** decimal)))
            transaction = transaction.buildTransaction({
                "gas": gas,
                'nonce': self.w3.eth.getTransactionCount(
                    self.w3.toChecksumAddress(account.address))
            })
            tx = self.w3.eth.account.signTransaction(transaction, account.privateKey)
            tx = self.w3.eth.sendRawTransaction(tx.rawTransaction)
            tx = self.w3.toHex(tx).replace('0x', '', 1)
            n_t = current_timestamp()
            status = self.w3.eth.waitForTransactionReceipt(tx).status
            current_app.logger.debug("Aurora等待上链耗时: {t}".format(t=current_timestamp() - n_t))
            if not status:
                current_app.logger.debug("交易失败: {txid}; 状态: {status}".format(txid=tx, status=status))
                return None

            return tx
        except:
            current_app.logger.exception('aurora send_token_raw_transaction failed')

        return None

    def get_account_by_mnemonic(self, mnemo_words, network='MAINNET'):
        strategy = 44
        account = 0
        netcode = NetCode.get_netcode(CoinType.BTC, network) # use BTC instead
        coin_slip_num = Slip44CoinType.AURORA
        hd_node = get_node_from_mnemonic(mnemo_words, netcode=netcode)
        wallet_node = hd_node.subkey(strategy, is_hardened=True).\
            subkey(coin_slip_num, is_hardened=True).\
            subkey(account, is_hardened=True)

        key = wallet_node.subkey_for_path('0/0')
        private_key = "{:064x}".format(key.secret_exponent())
        account = self.w3.eth.account.privateKeyToAccount(private_key)
        return account.address

    def get_address_by_credential_id(self, credential_id, key):
        private_key = self.get_private_key_by_credential_id(credential_id, key)
        account = self.w3.eth.account.privateKeyToAccount(private_key)
        return account.address

    def get_private_key_by_credential_id(self, credential_id, key):
        credential = get_credential(credential_id)

        strategy = 44
        account = 0
        netcode = NetCode.get_netcode(CoinType.BTC, credential.network) # use BTC instead
        coin_slip_num = Slip44CoinType.AURORA
        mnemo_words = HDCredential.decrypt_mnemonic(credential.mnemonic, key)
        hd_node = get_node_from_mnemonic(mnemo_words, netcode=netcode)
        wallet_node = hd_node.subkey(strategy, is_hardened=True).\
            subkey(coin_slip_num, is_hardened=True).\
            subkey(account, is_hardened=True)

        key = wallet_node.subkey_for_path('0/0')
        private_key = "{:064x}".format(key.secret_exponent())
        return private_key

