import xEOSHelper from './assets/xEOSHelper';
import * as utils from './assets/utils';

// const allEOSAccounts: any = utils.loadJson('./allEOSAccounts.json');
const allEOSAccounts: any = utils.loadJson('./allEOSAccountsLive.json');

export function initEOSApi(accountName: string = ''): xEOSHelper {
  if (accountName && accountName !== '') {
    return new xEOSHelper(allEOSAccounts[accountName]);
  } else {
    return new xEOSHelper();
  }
}

export function eachAccount(fn: (accountName: string) => void) {
  for (let accountName in allEOSAccounts) {
    fn(accountName);
  }
}

export function validAllAccountsKeys() {
  eachAccount((account: string) => {
    const eosapi = initEOSApi(account);
    let keys = allEOSAccounts[account];
    if (keys[0] !== '' && keys[1] !== '') {
      if (!eosapi.validPublicKey(keys[0])) console.error(account + '@active PublicKey is error!');
      if (!eosapi.validPrivateKey(keys[1])) console.error(account + '@active PrivateKey is error!');
      if (!eosapi.privateToPublic(keys[1]) === keys[0]) console.error(account + '@active PrivateKey is not match PublicKey!');
    }
    if (keys[2] !== '' && keys[3] !== '') {
      if (!eosapi.validPublicKey(keys[2])) console.error(account + '@owner PublicKey is error!');
      if (!eosapi.validPrivateKey(keys[3])) console.error(account + '@owner PrivateKey is error!');
      if (!eosapi.privateToPublic(keys[3]) === keys[2]) console.error(account + '@owner PrivateKey is not match PublicKey!');
    }
  });
}

export function getAccount(accountName: string) {
  const eosapi = new xEOSHelper();
  return eosapi
    .getAccount(accountName)
    .then(utils.dumpResult)
    .catch(utils.dumpError);
}

export function getAccountBalance(accountName: string) {
  const eosapi = new xEOSHelper();
  eosapi
    .getAccountBalance(accountName)
    .then((res: any) => {
      console.log(accountName, eosapi.parseBalances(res));
    })
    .catch(utils.dumpError);
}

export function createAccount(creator: string, newaccount: string) {
  const eosapi = new xEOSHelper(allEOSAccounts[creator]);
  let keys: string[] = [];
  //owner keys
  eosapi.randomPrivateKey().then((privKey: string) => {
    let pubKey = eosapi.privateToPublic(privKey);
    if (eosapi.validPrivateKey(privKey) && eosapi.validPublicKey(pubKey)) {
      keys.push(pubKey, privKey);
    }
    //active keys
    eosapi.randomPrivateKey().then((privKey: string) => {
      let pubKey = eosapi.privateToPublic(privKey);
      if (eosapi.validPrivateKey(privKey) && eosapi.validPublicKey(pubKey)) {
        keys.push(pubKey, privKey);
      }

      console.log(`"${newaccount}": ["${keys[0]}","${keys[1]}","${keys[2]}","${keys[3]}"],`);
      eosapi
        .createAccount(creator, newaccount, keys[0], keys[2])
        .then((res: any) => {
          if (res.transaction_id && res.processed) {
            console.log(res.transaction_id);
          } else {
            console.error(res);
          }
        })
        .catch(utils.dumpError);
    });
  });
}

export function transfer(code = 'eosio.token', fromAccount: string, toAccount: string, amount: any, memo: string): Promise<any> {
  const eosapi = initEOSApi(fromAccount);
  return eosapi.transfer(code, fromAccount, toAccount, amount, memo);
}

export function betDiceDraw(account: string) {
  const eosapi = initEOSApi(account);
  eosapi
    .getInfo()
    .then((result: any) => {
      let e: number = result.last_irreversible_block_num;
      let o = 1;
      for (let a = 0; a < 5651; a++) {
        o *= e;
        o %= 8633;
      }
      console.log('e=' + e + ', o=' + o);
      eosapi
        .transaction('betdicelucky', [
          eosapi.actionContract(
            'betdicelucky',
            'draw',
            {
              from: account,
              b: e,
              c: o,
            },
            account
          ),
        ])
        .then(utils.dumpResult)
        .catch(utils.dumpError);
    })
    .catch(utils.dumpError);
}
