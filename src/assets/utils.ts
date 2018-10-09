import fs from 'fs';

export function loadJson(path: string): any {
  return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

export function genEosName(basename: string, size = 10, start = 0, fn: (accountName: string) => void) {
  for (var i = start; i < size; i++) {
    let n = ((i - (i % 5)) / 5 + 1) * 10 + (i % 5) + 1;
    fn(basename + '' + n);
  }
}

export function dumpResult(result: any): void {
  console.log(result);
}
export function dumpError(e: any): void {
  if (e.json && e.json.code === 500 && e.json.error && typeof e.json.error.code === 'number') {
    console.log(e.json.error);
  } else {
    console.error(e);
  }
}

export function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export function parseBalance(allBalances: string[], symbol: string): number {
  let balance = 0;
  try {
    for (var b of allBalances) {
      if (b.indexOf(symbol) > 0) {
        return parseAmount(b, symbol);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return balance;
}

export function parseAmount(amount: string, symbol = 'EOS'): number {
  if (amount.indexOf(symbol) > 0) {
    return Number(amount.substring(0, amount.indexOf(' ')));
  }
  return 0;
}
export function amount(amount: any, symbol = 'EOS') {
  return (
    Number(amount)
      .toFixed(4)
      .toString() +
    ' ' +
    symbol
  );
}

export function explainActResult(act: any) {
  let actText = '';
  let actKey = act.account + ':' + act.name;
  if (actKey === 'eosio.token:transfer') {
    if (act.data.to === 'eosio.ram') {
      if (act.data.memo === 'buy ram') actText = `[EOS购买RAM]from:${act.data.from}, quantity:${act.data.quantity}`;
    } else if (act.data.to === 'eosio.ramfee') {
      actText = `[EOS购买RAM费用]from:${act.data.from}, quantity:${act.data.quantity}, memo:${act.data.memo}`;
    } else if (act.data.to === 'eosio.stake') {
      if (act.data.memo === 'stake bandwidth') actText = `[EOS抵押带宽]from:${act.data.from}, quantity:${act.data.quantity}`;
    } else if (act.data.to === 'betdiceadmin' && act.data.memo.indexOf('action:bet,') === 0) {
      actText = `[BetDice下注]from:${act.data.from}, quantity:${act.data.quantity}, memo:${act.data.memo}`;
    } else {
      actText = `[代币转帐]from:${act.data.from}, to:${act.data.to}, quantity:${act.data.quantity}, memo:${act.data.memo}`;
    }
  } else if (actKey === 'eosio:delegatebw') {
    actText = `[EOS抵押]from:${act.data.from}, receiver:${act.data.receiver}, stake_net_quantity:${act.data.stake_net_quantity}, stake_cpu_quantity:${act.data.stake_cpu_quantity}, transfer:${
      act.data.transfer
    }`;
  } else if (actKey === 'eosio:undelegatebw') {
    actText = `[EOS赎回]from:${act.data.from}, receiver:${act.data.receiver}, unstake_net_quantity:${act.data.unstake_net_quantity}, unstake_cpu_quantity:${act.data.unstake_cpu_quantity}`;
  } else if (actKey === 'eosio:buyram') {
    actText = `[EOS购买RAM]payer:${act.data.payer}, receiver:${act.data.receiver}, quant:${act.data.quant}`;
  } else if (actKey === 'eosio:sellram') {
    actText = `[EOS出售RAM]account:${act.data.account}, bytes:${act.data.bytes}`;
  } else if (actKey === 'eosio:voteproducer') {
    actText = `[BP投票]voter:${act.data.voter},proxy:${act.data.proxy}, producers:[${act.data.producers.join(', ')}]`;
  } else if (actKey === 'eosio:refund') {
    actText = `[EOS退还]owner:${act.data.owner}`;
  } else {
    actText = JSON.stringify(act);
  }
  return actText;
}
