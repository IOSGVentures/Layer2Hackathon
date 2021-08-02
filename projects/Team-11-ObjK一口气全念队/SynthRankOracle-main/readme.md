# Struct
1. cl_adapter, get the Synth data and transfer data to chainlink node. 
2. chainlink_job_spec, the job config in Chainlink node for getting the data of rank 1~5.
3. oracle_contract, the oracle contract of chainlink node.
4. client_contract, send the request and get the data of rank 1~5 of Synth from chainlink node.

# What we do?
We build a chainlink node on Ethereum Rinkeby testnet.
- Oracle Contract: 0x3D4e6c7D1de34BfF3e15F586D2a88f5BB844CF32
- Client Contract: 0x778307ECA558a33AbA4d85AD2cd0fefcC315fbDC
- JobID for rank1: a51eceb044fc43dd89fc5cd19bf9ef29
- JobID for rank2: 1b09b40415454cd6b5d67c7678838082
- JobID for rank3: 247d4dee83b148de80596e788cbc1322
- JobID for rank4: 02dd36b6c5a54ee4858207c5bcf27654
- JobID for rank5: 46bb8137330d43cca7cbac6d770f4ec9
  
One record for sending 5 requests
- https://rinkeby.etherscan.io/tx/0xed7827a7aa0156e5d4ba1a8160e26d0274faee7f6f666783a72851a5e7bf84e1
  
One record for getting the feedback
- https://rinkeby.etherscan.io/tx/0x5af0b207d7d52f54073f674126f3caef41cdd29cb44a44d26e4b8e917141da7a#eventlog
  
We can use tool to get the readable string 
- HEX format result: 0x734254432031332e353300000000000000000000000000000000000000000000
- Readable string: sBTC 13.53
  
# How to use?
1. Send a request by Client Contract to chainlink node.
2. Website can get the result from Client Contract - the data of first rank 5: rank0, rank1, rank2, rank3, rank4.
