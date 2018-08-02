export default function (params) {
  if (params === null || typeof params === 'undefined') {
    return '';
  }

  let cents = parseInt(params, 10);

  const debitCredit = cents < 0 ? '-' : '';

  cents = Math.abs(cents);
  const dollars = Math.floor(cents / 100);
  cents %= 100;

  let currencyString = `$${dollars}`;
  currencyString += '.';
  if (cents < 10) {
    currencyString += `0${cents}`;
  } else {
    currencyString += cents;
  }

  return `${debitCredit}${currencyString}`;
}
