import { Decimal } from "decimal.js";

import type { customBigNumber } from "./types/main";
import { HUNDREDS, ONES, TENS, UNDER_THIRTY } from "./assets/static";

const removeVowel = (text: string): string => {
  if (["a", "e", "i", "o", "u"].includes(text.slice(-1))) {
    text = text.slice(0, -1);
  }

  return text;
};

// Methods needed:
// toNamed()
export class BigNumber {
  base: customBigNumber["base"];
  exponent: customBigNumber["exponent"];

  constructor(base: Decimal.Value, exponent: customBigNumber["exponent"]) {
    this.base = new Decimal(base);
    this.exponent = exponent;
  }

  toScientific(): string {
    return `${this.base.toString()}e${this.exponent.toString()}`;
  }

  toNamed(): string {
    if (this.exponent < 3n) {
      return `${this.base.toNumber() * Math.pow(10, Number(this.exponent))}`;
    }

    if (this.exponent <= 30n) {
      const mult =
        this.exponent % 3n === 1n ? 10 : this.exponent % 3n === 2n ? 100 : 1;

      return `${this.base.mul(mult).toString()} ${UNDER_THIRTY[Math.floor(Number(this.exponent) / 3) - 1]}`;
    }

    let namedNumber = "";
    const numberList = Math.floor(Number((this.exponent - 3n) / 3n))
      .toString()
      .split("") as unknown as number[];
    const remainderOfList = numberList.length % 3;

    if (remainderOfList === 1)
      namedNumber += UNDER_THIRTY[numberList[0]].slice(0, -2);

    if (remainderOfList === 2) {
      namedNumber += ONES[numberList[0]][1];
      namedNumber += TENS[numberList[1]][1];

      removeVowel(namedNumber);
      namedNumber += "illi";
    }

    const listWithoutRemainders = numberList.slice(
      remainderOfList,
      numberList.length,
    );
    for (let i = 0; i < listWithoutRemainders.length; i += 3) {
      const ones = listWithoutRemainders[i + 2];
      const tens = listWithoutRemainders[i + 1];
      const hundreds = listWithoutRemainders[i];

      if (ones === 0 && tens === 0 && hundreds === 0) namedNumber += "nilli";

      if (ones !== 0) namedNumber += ONES[ones][1];
      if (tens !== 0) namedNumber += TENS[tens][1];
      if (hundreds !== 0) namedNumber += HUNDREDS[hundreds][1];

      if (i + 3 < listWithoutRemainders.length) {
        removeVowel(namedNumber);
        namedNumber += "illi";
      }
    }

    removeVowel(namedNumber);
    namedNumber += "illion";

    return namedNumber;
  }

  multiply(number: BigNumber): BigNumber {
    return new BigNumber(
      this.base.mul(number.base),
      this.exponent + number.exponent,
    );
  }

  // These might lose precision if the larger exponent is picked
  add(number: BigNumber): BigNumber {
    if (this.exponent === number.exponent) {
      return new BigNumber(this.base.add(number.base), this.exponent);
    }

    const exponentDifference = this.exponent - number.exponent;
    let newBase: Decimal;

    if (exponentDifference > 0n) {
      const scale = new Decimal(10).pow(exponentDifference.toString());
      newBase = this.base.add(number.base.div(scale));
    } else {
      const scale = new Decimal(10).pow(-exponentDifference.toString());
      newBase = this.base.div(scale).add(number.base);
    }

    return new BigNumber(newBase, this.exponent);
  }

  subtract(number: BigNumber): BigNumber {
    if (this.exponent === number.exponent) {
      return new BigNumber(this.base.minus(number.base), this.exponent);
    }

    const exponentDifference = this.exponent - number.exponent;
    let newBase: Decimal;

    if (exponentDifference > 0n) {
      const scale = new Decimal(10).pow(exponentDifference.toString());
      newBase = this.base.minus(number.base.div(scale));
    } else {
      const scale = new Decimal(10).pow(-exponentDifference.toString());
      newBase = this.base.div(scale).minus(number.base);
    }

    return new BigNumber(newBase, this.exponent);
  }

  lessThan(number: BigNumber): boolean {
    if (
      (this.base.lessThanOrEqualTo(number.base) &&
        this.exponent < number.exponent) ||
      (this.base.lessThan(number.base) && this.exponent <= number.exponent)
    )
      return true;

    return false;
  }

  lessThanOrEqualTo(number: BigNumber): boolean {
    if (
      this.base.lessThanOrEqualTo(number.base) &&
      this.exponent <= number.exponent
    )
      return true;

    return false;
  }

  greaterThan(number: BigNumber): boolean {
    if (
      (this.base.greaterThanOrEqualTo(number.base) &&
        this.exponent > number.exponent) ||
      (this.base.greaterThan(number.base) && this.exponent >= number.exponent)
    )
      return true;

    return false;
  }

  greaterThanOrEqualTo(number: BigNumber): boolean {
    if (
      this.base.greaterThanOrEqualTo(number.base) &&
      this.exponent >= number.exponent
    )
      return true;

    return false;
  }
}
