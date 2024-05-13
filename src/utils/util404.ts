import { v4 as uuidv4 } from 'uuid';
import BigNumber from 'bignumber.js';

export function uuid404(): string {
  return uuidv4().replace(/-/g, '');
}

export function generateRefCode(username: string): string {
  const uppercaseUsername = username.toUpperCase();
  let refCode = '';

  for (let i = 0; i < uppercaseUsername.length; i++) {
    const char = uppercaseUsername[i];
    let newChar = char;
    if (char >= 'A' && char <= 'Z') {
      const newCharCode = ((char.charCodeAt(0) - 65 + 2) % 26) + 65;
      newChar = String.fromCharCode(newCharCode);
    }

    refCode += newChar;
  }

  return 'T404_' + refCode;
}


export function addressTrim(str: string | undefined): string {
  if (!str) {
    return '';
  }
  if (str.length <= 8) {
    return str;
  } else {
    const start = str.substring(0, 2);
    const end = str.substring(str.length - 4);
    return `${start}...${end}`;
  }
}


export function calculateTotal(amount: any, unit: any): string {
  if (!amount || !unit) {
    return '';
  }

  if (typeof amount == 'number' && typeof unit == 'number') {
    let a = new BigNumber(amount);
    let u = new BigNumber(unit);
    let result = a.multipliedBy(u);
    return decimalFriendly(result.toNumber());
  } else {
    return '';
  }
}


export function decimalFriendly(input: number | string | undefined): string {
  if (!input) {
    return '';
  }
  try {
    const numValue: number = typeof input === 'string' ? parseFloat(input) : input;

    if (isNaN(numValue)) {
      return '';
    }

    if (Number.isInteger(numValue)) {
      return '' + numValue;
    }

    const stringValue = numValue.toString();
    const decimalIndex = stringValue.indexOf('.');
    if (decimalIndex !== -1) {
      const decimalPlaces = stringValue.length - decimalIndex - 1;
      if (decimalPlaces <= 4) {
        return '' + numValue;
      } else {
        const truncatedValue = stringValue.substr(0, decimalIndex + 5);
        return '' + parseFloat(truncatedValue);
      }
    }

    return '' + numValue;
  } catch (e) {
    console.error('decimalFriendly error:', input);
    return '';
  }
}

