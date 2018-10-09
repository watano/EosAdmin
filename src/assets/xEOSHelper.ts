import EosJs from 'eosjs';
const EosEcc = require('eosjs-ecc');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');
import * as utils from './utils';

const TestNet = {
  httpEndpoint: 'https://api.kylin-testnet.eospace.io',
  chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
};
const MainNet = {
  // httpEndpoint: 'https://nodes.get-scatter.com',
  httpEndpoint: 'https://api.eosnewyork.io',
  // httpEndpoint: 'https://api.eoslaomao.com',
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
};

export default class xEOSHelper {
  protected _xeosType = 'eos';
  protected _xeosSymbol = 'EOS';
  protected _xeosChainId: string = '';
  public _xeos: any = null;
  protected _xeosEcc: any = null;

  constructor(account: string[] = ['', '', '', ''], permission = 'active', network = MainNet) {
    this._xeosEcc = EosEcc;
    let eosOption = {
      httpEndpoint: network.httpEndpoint,
      chainId: network.chainId,
      keyProvider: permission === 'active' ? account[1] : account[3],
      expireInSeconds: 60,
      broadcast: true,
      // debug: true,
      // verbose: true,
      logger: {
        //  log: console.log,
        error: console.error,
      },
    };
    //console.log(eosOption);
    //this._xeos = EosJs(eosOption);

    const rpc = new EosJs.Rpc.JsonRpc(network.httpEndpoint, { fetch });
    const signatureProvider = new EosJs.SignatureProvider(eosOption.keyProvider !== '' ? [eosOption.keyProvider] : []);
    this._xeos = new EosJs.Api({ rpc, signatureProvider, chainId: network.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  }

  protected _errorHandler(e: any, errorBack: (e: any) => void) {
    if (typeof errorBack === 'function') {
      console.error(e);
      errorBack(e);
    } else {
      if (e.isError && e.message) {
        console.log(e.message);
      }
    }
  }
  public getInfo(): any {
    return this._xeos.rpc.get_info({});
  }

  public privateToPublic(privateKey: string): string {
    return this._xeosEcc.privateToPublic(privateKey);
  }
  public validPrivateKey(privateKey: string) {
    return this._xeosEcc.isValidPrivate(privateKey);
  }
  public validPublicKey(publicKey: string) {
    return this._xeosEcc.isValidPublic(publicKey);
  }
  public randomPrivateKey(): Promise<string> {
    return this._xeosEcc.randomKey();
  }
  public getAccount(accountName: string) {
    return this._xeos.getAccount(accountName);
  }
  public parseBalances(res: any): any {
    let fn: any = null;
    if ('fibos' === this._xeosType) {
      fn = (row: any) => row.balance.quantity.split(' ').reverse();
    } else {
      fn = (row: any) => row.balance.split(' ').reverse();
    }
    return res.rows.map(fn);
  }
  public getAccountBalance(accountName: string) {
    return this._xeos.rpc.get_table_rows({
      code: 'eosio.token',
      scope: accountName,
      table: 'accounts',
      limit: 100,
      json: true,
    });
  }
  public newaccount(trx: any, creator: string, newaccount: string, oPubKey: string, aPubKey: string) {
    return trx.newaccount({
      creator: creator,
      name: newaccount,
      owner: oPubKey,
      active: aPubKey,
    });
  }
  public buyram(trx: any, creator: string, receiver: string, ram = 8) {
    return trx.buyram({
      payer: creator,
      receiver: receiver,
      quant: utils.amount(ram, this._xeosSymbol),
    });
  }
  public buyRambytes(trx: any, payer: string, receiver: string, bytes: string) {
    return trx.buyrambytes({
      payer: payer,
      receiver: receiver,
      bytes: bytes,
    });
  }
  public sellram(trx: any, account: string, bytes: string) {
    return trx.sellram({
      account: account,
      bytes: bytes,
    });
  }
  public claimrewards(trx: any, owner: string) {
    return trx.claimrewards({
      owner: owner,
    });
  }
  public refund(trx: any, owner: string) {
    return trx.refund({
      owner: owner,
    });
  }
  public bidname(trx: any, bidder: string, newname: string, bid: string) {
    return trx.bidname({
      bidder: bidder,
      newname: newname,
      bid: bid,
    });
  }
  public linkauth(trx: any, account: string, code: string, type: string, requirement: string) {
    return trx.linkauth({
      account: account,
      code: code,
      type: type,
      requirement: requirement,
    });
  }
  public updateauth(trx: any, account: string, permission: string, parent: string, auth: string) {
    return trx.updateauth({
      account: account,
      permission: permission,
      parent: parent,
      auth: auth,
    });
  }
  public setabi(trx: any, account: string, abi: string) {
    return trx.setabi({
      account: account,
      abi: abi,
    });
  }
  public setcode(trx: any, account: string, vmtype: string, vmversion: string, code: string) {
    return trx.setcode({
      account: account,
      vmtype: vmtype,
      vmversion: vmversion,
      code: code,
    });
  }
  public regproducer(trx: any, producer: string, producer_key: string, url: string, location: string) {
    return trx.regproducer({
      producer: producer,
      producer_key: producer_key,
      url: url,
      location: location,
    });
  }
  public unregprod(trx: any, producer: string) {
    return trx.unregprod({
      producer: producer,
    });
  }
  public delegatebw(trx: any, creator: string, receiver: string, net = 1, cpu = 1) {
    return trx.delegatebw({
      from: creator,
      receiver: receiver,
      stake_net_quantity: utils.amount(net, this._xeosSymbol),
      stake_cpu_quantity: utils.amount(cpu, this._xeosSymbol),
      transfer: 0,
    });
  }
  public undelegatebw(trx: any, payer: string, receiver: string, net = 1, cpu = 1) {
    return trx.undelegatebw({
      from: payer,
      receiver: receiver,
      unstake_net_quantity: utils.amount(net, this._xeosSymbol),
      unstake_cpu_quantity: utils.amount(cpu, this._xeosSymbol),
      transfer: 0,
    });
  }
  /**
   * 创建xEOS新账号，新账号购买4xEOS内存，各抵押1个xEOS的CPU/NET，请保证账号中有至少6xEOS
   */
  public createAccount(creator: string, newaccount: string, oPubKey: string, aPubKey: string, ram = 8, net = 1, cpu = 1) {
    return this._xeos.transaction('eosio', (trx: any) => {
      this.newaccount(trx, creator, newaccount, oPubKey, aPubKey);
      //为新账号充值RAM
      this.buyram(trx, creator, newaccount, ram);
      //为新账号抵押CPU和NET资源
      this.delegatebw(trx, creator, newaccount, net, cpu);
    });
  }
  public buyAccountResource(creator: string, newaccount: string, ram = 8, net = 1, cpu = 1) {
    return this._xeos.transaction('eosio', (trx: any) => {
      //为新账号充值RAM
      this.buyram(trx, creator, newaccount, ram);
      //为新账号抵押CPU和NET资源
      this.delegatebw(trx, creator, newaccount, net, cpu);
    });
  }
  public contract(
    code = 'eosio.token',
    options = {
      accounts: [
        {
          blockchain: this._xeosType,
          chainId: this._xeosChainId,
        },
      ],
    }
  ) {
    return this._xeos.rpc.contract(code, options);
  }
  public transfer(code = 'eosio.token', fromAccount: string, toAccount: string, amount: string, memo: string) {
    let jsonData = {
      actions: [
        {
          account: code,
          name: 'transfer',
          authorization: [
            {
              actor: fromAccount,
              permission: 'active',
            },
          ],
          data: {
            from: fromAccount,
            to: toAccount,
            quantity: amount,
            memo: memo,
          },
        },
      ],
    };
    //console.log(jsonData);
    return this._xeos.transact(jsonData, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
  }

  public getActions(account: string, pos = -1, offset = -1): Promise<any> {
    //console.log(account, pos, offset);
    return this._xeos.rpc.history_get_actions(account, pos, offset);
  }

  public tokenBalance(code = 'eosio.token', account: string) {
    return this._xeos.rpc.get_currency_balance(code, account);
  }
  public tokenStats(code = 'eosio.token', symbol: string) {
    let data = {
      code: code,
      symbol: symbol,
    };
    console.log(data);
    return this._xeos.getCurrencyStats(data);
  }
  public tokenContract(code = 'eosio.token', fn: (trx: any) => Promise<any>) {
    return this.contract(code, {
      accounts: [
        {
          blockchain: this._xeosType,
          chainId: this._xeosChainId,
        },
      ],
    });
  }
  public tokenTransfer(tokenCode: string, fromAccount: string, toAccount: string, amount: any, memo: string) {
    this.tokenContract(tokenCode, (contract: any) => {
      return contract.transfer(fromAccount, toAccount, amount, memo);
    });
  }
  public tokenExchange(tokenCode: string, fromAccount: string, toSymbol: string, amount: any, memo: string) {
    this.tokenContract(tokenCode, (contract: any) => {
      return contract.exchange(fromAccount, amount, toSymbol, memo);
    });
  }
  public deloyContract(account: string, wasm: string, abi: string) {
    return [this._xeos.setcode(account, 0, 0, wasm), this._xeos.setabi(account, JSON.parse(abi))];
  }
  public actionContract(contractName = 'eosio.token', action: string, actionData: any, actor: string, permission = 'active') {
    let jsonData = {
      account: contractName,
      name: action,
      authorization: [
        {
          actor: actor,
          permission: permission,
        },
      ],
      data: actionData,
    };
    console.log(jsonData);
    return jsonData;
  }
  public transaction(actions: any, options: any = { broadcast: true }) {
    console.log(actions);
    return this._xeos.transact(
      {
        actions: actions,
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      }
    );
  }
}
