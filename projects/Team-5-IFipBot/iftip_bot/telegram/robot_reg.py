import re

def intention_dbs():
    dbs = [
        {
            "reg": "^(介绍|开始|机器人|start)$",
            "key": "handle_start",
            "default": None,
            "dics": None,
        },
        # ---------------help--------------
        {
            "reg": "^(帮助|help)$",
            "key": "handle_help",
            "default": None,
            "dics": None,
        },
        {
            "reg": "^(我想|我要|怎么|如何)?(提现|提走|提币|withdraw)[ ]?([a-zA-Z0-9\-]{2,16})?$",
            "key": "handle_withdraw_help",
            "default": None,
            "dics": None,
        },
        {
            "reg": "^(充值|deposit)$",
            "key": "handle_deposit_help",
            "default": None,
            "dics": None,
        },
        {
            "reg": "^(钱包|wallet|wallets|钱包列表)$",
            "key": "handle_wallet_list",
            "default": None,
            "dics": None,
        },
        {
            "reg": "^(我想|我要|怎么|帮助|help)[ ]?(报价|充值|提现|提币|打赏|红包|发红包|红包雨|口令红包|兑换|交易对|绑定|绑定手机|验证|绑定验证|手机验证|切换钱包|price|deposit|withdraw|tip|rain|password|pair|swap|bind_mobile|verify_mobile|switch_wallet)$",
            "key": "handle_help",
            "default": None,
            "dics": [{
                "reg": "^(我想|我要|怎么|帮助|help)[ ]?(报价|充值|提现|提币|打赏|红包|发红包|红包雨|口令红包|兑换|交易对|绑定|绑定手机|验证|绑定验证|手机验证|切换钱包|price|deposit|withdraw|tip|rain|password|pair|swap|bind_mobile|verify_mobile|switch_wallet)$",
                "is_read_keys": True,
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "help", "default": None}
                ],
                "key": "handle_help",
                "keys": [
                    {"name": "报价", "key": "handle_price_help"},
                    {"name": "充值", "key": "handle_deposit_help"},
                    {"name": "提现", "key": "handle_withdraw_help"},
                    {"name": "提币", "key": "handle_withdraw_help"},
                    {"name": "打赏", "key": "handle_tip_help"},
                    {"name": "红包", "key": "handle_rain_help"},
                    {"name": "发红包", "key": "handle_rain_help"},
                    {"name": "红包雨", "key": "handle_rain_help"},
                    {"name": "口令红包", "key": "handle_password_help"},
                    {"name": "兑换", "key": "handle_swap_help"},
                    {"name": "交易对", "key": "handle_swap_pair_help"},
                    {"name": "绑定", "key": "handle_bind_mobile_help"},
                    {"name": "绑定手机", "key": "handle_bind_mobile_help"},
                    {"name": "验证", "key": "handle_verify_mobile_help"},
                    {"name": "绑定验证", "key": "handle_verify_mobile_help"},
                    {"name": "手机验证", "key": "handle_verify_mobile_help"},
                    {"name": "切换钱包", "key": "handle_switch_wallet_help"},
                    {"name": "price", "key": "handle_price_help"},
                    {"name": "deposit", "key": "handle_deposit_help"},
                    {"name": "withdraw", "key": "handle_withdraw_help"},
                    {"name": "tip", "key": "handle_tip_help"},
                    {"name": "rain", "key": "handle_rain_help"},
                    {"name": "password", "key": "handle_password_help"},
                    {"name": "pair", "key": "handle_swap_pair_help"},
                    {"name": "swap", "key": "handle_swap_help"},
                    {"name": "bind_mobile", "key": "handle_bind_mobile_help"},
                    {"name": "verify_mobile", "key": "handle_verify_mobile_help"},
                    {"name": "switch_wallet", "key": "handle_switch_wallet_help"},
                ],
            }]
        },
        {
            "reg": "^(我想|我要|怎么|帮助|help)?[ ]?(报价|充值|提现|提币|打赏|红包|口令红包|兑换|绑定|绑定手机|验证|绑定验证|手机验证|切换钱包|price|deposit|withdraw|tip|password|pair|swap|bind_mobile|verify_mobile|switch_wallet)$",
            "key": "handle_help",
            "default": None,
            "dics": [{
                "reg": "^(我想|我要|怎么|帮助|help)?[ ]?(报价|充值|提现|提币|打赏|红包|口令红包|兑换|交易对|绑定|绑定手机|验证|绑定验证|手机验证|切换钱包|price|deposit|withdraw|tip|password|pair|swap|bind_mobile|verify_mobile|switch_wallet)$",
                "is_read_keys": True,
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "help", "default": None}
                ],
                "key": "handle_help",
                "keys": [
                    {"name": "报价", "key": "handle_price_help"},
                    {"name": "充值", "key": "handle_deposit_help"},
                    {"name": "提现", "key": "handle_withdraw_help"},
                    {"name": "提币", "key": "handle_withdraw_help"},
                    {"name": "打赏", "key": "handle_tip_help"},
                    {"name": "红包", "key": "handle_rain_help"},
                    {"name": "口令红包", "key": "handle_password_help"},
                    {"name": "兑换", "key": "handle_swap_help"},
                    {"name": "交易对", "key": "handle_swap_pair_help"},
                    {"name": "绑定", "key": "handle_bind_mobile_help"},
                    {"name": "绑定手机", "key": "handle_bind_mobile_help"},
                    {"name": "验证", "key": "handle_verify_mobile_help"},
                    {"name": "绑定验证", "key": "handle_verify_mobile_help"},
                    {"name": "手机验证", "key": "handle_verify_mobile_help"},
                    {"name": "切换钱包", "key": "handle_switch_wallet_help"},
                    {"name": "price", "key": "handle_price_help"},
                    {"name": "deposit", "key": "handle_deposit_help"},
                    {"name": "withdraw", "key": "handle_withdraw_help"},
                    {"name": "tip", "key": "handle_tip_help"},
                    {"name": "password", "key": "handle_password_help"},
                    {"name": "pair", "key": "handle_swap_pair_help"},
                    {"name": "swap", "key": "handle_swap_help"},
                    {"name": "bind_mobile", "key": "handle_bind_mobile_help"},
                    {"name": "verify_mobile", "key": "handle_verify_mobile_help"},
                    {"name": "switch_wallet", "key": "handle_switch_wallet_help"},
                ],
            }]
        },
        # ------------balance-------------
        {
            "reg": "^(余额|balance)[ ]?([a-zA-Z0-9\-]{2,16})?$",
            "key": "handle_balance",
            "default": None,
            "dics": [{
                "reg": "^(余额|balance)[ ]?([a-zA-Z0-9\-]{2,16})?$",
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "coin", "default": None}
                ],
                "key": "handle_balance",
                "is_read_keys": False,
                "keys": []
            }],
        },
        {
            "reg": "^(查看我的|查看|我的|查|check)*[ ]?([a-zA-Z0-9\-]{2,16})?[ ]?(余额|balance)$",
            "key": "handle_balance",
            "default": None,
            "dics": [{
                "reg": "^(查看我的|查看|我的|查|check)*[ ]?([a-zA-Z0-9\-]{2,16})?[ ]?(余额|balance)$",
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "coin", "default": None},
                    {"field": "action", "default": None}
                ],
                "key": "handle_balance",
                "is_read_keys": False,
                "keys": []
            }],
        },
        # ---------------deposit---------------
        {
            "reg": "^(我要|我想)?(充值|充值|充入|地址|address|deposit)[ ]?([a-zA-Z0-9\-]{2,16})?$",
            "key": "handle_deposit",
            "default": None,
            "dics": [{
                "reg": "^(我要|我想)?(充值|充入|地址|address|deposit)[ ]?([a-zA-Z0-9\-]{2,16})?$",
                "slot_keys": [
                    {"field": "will", "default": None},
                    {"field": "fix", "default": None},
                    {"field": "coin", "default": "IFT"}
                ],
                "key": "handle_deposit",
                "is_read_keys": False,
                "keys": []
            }],
        },
        # --------------withdraw-------------
        {
            "reg": "^(我想|我要|怎么|如何)?(提现|提走|提币|withdraw)[ ]?",
            "key": None,
            "default": None,
            "dics": [{
                "reg": "^(我想|我要|怎么|如何)?(提现|提走|提币|withdraw)[ ]?([a-zA-Z0-9\-]{2,16})$",
                "slot_keys": [],
                "key": "handle_withdraw_help",
                "is_read_keys": False,
                "keys": []
                }, {
                "reg": "^(我想|我要)?(提现|提走|提币|withdraw)[ ]?([+-]?\d+[\.\d]*)[ ]?([a-zA-Z0-9\-]{2,16})?[ ]+([a-zA-Z0-9:]{30,66})[ ]+([a-z0-9A-Z]{1,30})?$",
                "slot_keys": [
                    {"field": "will", "default": None},
                    {"field": "fix", "default": None},
                    {"field": "amount", "default": None},
                    {"field": "coin", "default": None},
                    {"field": "address", "default": None},
                    {"field": "memo", "default": None},
                ],
                "key": "handle_withdraw",
                "is_read_keys": False,
                "keys": []
            },
            {
                "reg": "^(我想|我要)?(提现|提走|提币|withdraw)[ ]?(\d+[\.\d]*)[ ]?([a-zA-Z0-9\-]{2,16})[ ]?[到|到地址|to]?[ ]+([a-zA-Z0-9:]{30,66})[ ]?(memo|MEMO)?[ ]?([a-z0-9A-Z]{1,30})?$",
                "slot_keys": [
                    {"field": "will", "default": None},
                    {"field": "fix", "default": None},
                    {"field": "amount", "default": None},
                    {"field": "coin", "default": None},
                    {"field": "address", "default": None},
                    {"field": "memo_title", "default": None},
                    {"field": "memo", "default": None}
                ],
                "key": "handle_withdraw",
                "is_read_keys": False,
                "keys": []
            }]
        },
        # --------------tip-------------
        {
            "reg": "^(打赏|tip|\+)[ ]?[\w\W]+",
            "key": None,
            "default": None,
            "dics": [
                {
                    "reg": "^(打赏|tip|\+)[ ]?([+-]?\d+[\.\d]*)?[ ]?([a-zA-Z0-9\-]{2,16})?[ ]*$",
                    "slot_keys": [
                        {"field": "fix", "default": None},
                        {"field": "amount", "default": 1},
                        {"field": "coin", "default": 'IFT'},
                    ],
                    "key": "handle_reply_tip",
                    "is_read_keys": False,
                    "keys": []
                },
                {
                    "reg": "^(打赏|tip)[ ]?[@]?((?<!\ \d)[\w\W]*?)[ ]?([+-]?\d+[\.\d]*)?[ ]?([a-zA-Z0-9\-]{2,16})?[ ]*$",
                    "slot_keys": [
                        {"field": "fix", "default": None},
                        {"field": "users", "default": None},
                        {"field": "amount", "default": None},
                        {"field": "coin", "default": 'IFT'},
                    ],
                    "key": "handle_tip",
                    "is_read_keys": False,
                    "keys": []
                }
            ],
        },
        # --------------password-------------
        {
            "reg": "^(口令红包|password)[\w\W]+",
            "key": None,
            "default": None,
            "dics": [{
                "reg": "^(口令红包|password)[ ]*(\d+)?[ ]*(个|people| )?[ ]?([+-]?\d+[\.\d]*)?[ ]?([a-zA-Z0-9\-]{2,16})?[ ]?[#]([\w\W]+)$",
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "share", "default": None},
                    {"field": "share_name", "default": None},
                    {"field": "amount", "default": None},
                    {"field": "coin", "default": 'IFT'},
                    {"field": "password", "default": None},
                ],
                "key": "handle_password_red_packet",
                "is_read_keys": False,
                "keys": []
            }],
        },
        # --------------normal red packets-------------
        {
            "reg": "^(红包|发红包|红包雨|红包暴雨|airdrop|rain|storm)[\w\W]*",
            "key": None,
            "default": None,
            "dics": [{
                "reg": "^(红包|发红包|红包雨|红包暴雨|airdrop|rain|storm)[ ]?(\d+)?[ ]?(个|people|share| )?[ ]?(共|总共|总额|total)?[ ]?([+-]?\d+[\.\d]*)?[ ]?([a-zA-Z0-9\-]{2,16})?[ ]?$",
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "share", "default": 5},
                    {"field": "share_name", "default": None},
                    {"field": "total_name", "default": None},
                    {"field": "amount", "default": 10},
                    {"field": "coin", "default": 'IFT'},
                ],
                "key": "handle_rain",
                "is_read_keys": False,
                "keys": []
            }],
        },
        # --------------Grab-------------
        {
            "reg": "^#[\w\W]*$",
            "key": None,
            "default": None,
            "dics": [{
                "reg": "^#([\w\W]*)$",
                "slot_keys": [
                    {"field": "password", "default": None},
                ],
                "key": "handle_grab",
                "is_read_keys": False,
                "keys": []
            }]
        },
        {
            "reg": "^(Grab|grab|Claim|claim|Airdrop|airdrop)$",
            "key": None,
            "default": None,
            "dics": [{
                "reg": "^(Grab|grab|Claim|claim|Airdrop|airdrop)$",
                "slot_keys": [
                    {"field": "password", "default": None},
                ],
                "key": "handle_grab",
                "is_read_keys": False,
                "keys": []
            }]
        },
        # --------------coinlore-------------
        {
            "reg": "^[=＝]([a-zA-Z0-9\-]{2,16})$",
            "key": "handle_coin_lore",
            "default": None,
            "dics": [{
                "reg": "^[=＝]([a-zA-Z0-9\-]{2,16})$",
                "slot_keys": [
                    {"field": "symbol", "default": None}
                ],
                "key": "handle_coin_lore",
                "is_read_keys": False,
                "keys": []
            }],
        },
        # --------------last: price-------------
        {
            "reg": "^(报价|价格|price)[ ]?([a-zA-Z0-9\-]{2,16})$",
            "key": "handle_price",
            "default": None,
            "dics": [{
                "reg": "^(报价|价格|price)[ ]?([a-zA-Z0-9\-]{2,16})$",
                "slot_keys": [
                    {"field": "fix", "default": None},
                    {"field": "coin", "default": None},
                ],
                "key": "handle_price",
                "is_read_keys": False,
                "keys": []
            }],
        },
        {
            "reg": "^[\$]([a-zA-Z0-9\-]{2,16})$",
            "key": "handle_price",
            "default": None,
            "dics": [{
                "reg": "^[\$]([a-zA-Z0-9\-]{2,16})$",
                "slot_keys": [
                    {"field": "coin", "default": None}
                ],
                "key": "handle_price",
                "is_read_keys": False,
                "keys": []
            }],
        }
    ]
    return dbs


def parse_msg(msg):
    '''
    解析用户消息
    '''
    datas = {}
    ret = {"datas": None, "key": None}

    records = intention_dbs()
    for record in records:
        if not re.match(r''+record['reg'], msg, re.IGNORECASE):
            continue

        if not record["dics"]:
            ret["datas"] = record["default"]
            ret["key"] = record["key"]
            return ret

        ret["key"] = record["key"]
        for dic in record["dics"]:
            r = re.match(r''+dic['reg'], msg)
            if not r:
                continue

            items = r.groups()
            items_len = len(items)

            if not dic['slot_keys']: # 不要任何参数
                ret["key"] = dic["key"]
                break  # 已经匹配到

            slot_keys_len = len(dic['slot_keys'])
            if slot_keys_len != items_len:
                continue

            ret["key"] = dic["key"]
            if dic["is_read_keys"]:
                for s_key in dic["keys"]:
                    if s_key["name"] == items[1]:
                        ret["key"] = s_key["key"]
            else:
                for i in range(items_len):
                    slot_key_item = dic['slot_keys'][i]
                    datas[slot_key_item["field"]] = items[i] if items[i] else slot_key_item['default']
                ret["datas"] = datas

            return ret

        return ret

    return ret
