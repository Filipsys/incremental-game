import { Decimal } from "decimal.js";
import { useStore } from "./store/mainStore";
import { HUNDREDS, ONES, TENS, UNDER_THIRTY } from "./assets/static";

import type { customBigNumber } from "./types/main";

const removeEndVowel = (text: string) => {
  if (["a", "e", "i", "o", "u"].includes(text.slice(-1))) {
    return text.slice(0, -1);
  }

  return text;
};

export class BigNumber {
  base: customBigNumber["base"];
  exponent: customBigNumber["exponent"];

  constructor(base: Decimal.Value, exponent = 1n, _normalised = false) {
    this.base = new Decimal(base);
    this.exponent = exponent;

    if (!_normalised) {
      const normalised = BigNumber.createNormalised(this.base, this.exponent);

      this.base = normalised.base;
      this.exponent = normalised.exponent;
    }
  }

  static createNormalised(base: Decimal.Value, exponent = 1n): BigNumber {
    let decimalBase = new Decimal(base);
    let adjustedExponent = exponent;

    while (decimalBase.greaterThanOrEqualTo(10)) {
      decimalBase = decimalBase.div(10);

      adjustedExponent += 1n;
    }

    return new BigNumber(decimalBase, adjustedExponent, true);
  }

  toScientific(): string {
    if (this.exponent <= 6n)
      return `${this.base.mul(Math.pow(10, Number(this.exponent)))}`;

    return `${this.base.toString().slice(0, 5)}e${this.exponent.toString()}`;
  }

  toEngineering(): string {
    if (this.exponent <= 6n)
      return `${this.base.mul(Math.pow(10, Number(this.exponent)))}`;

    const exponentRemainder = this.exponent % 3n;
    const engineeringExponent = this.exponent - exponentRemainder;
    const engineeringBase = this.base.mul(
      Math.pow(10, Number(exponentRemainder)),
    );

    return `${engineeringBase.toString().slice(0, 5)}e${engineeringExponent}`;
  }

  toNamed(): string {
    if (this.exponent <= 6n) {
      return this.base.pow(Number(this.exponent)).toString();
    }

    if (this.exponent <= 30n) {
      const mult =
        this.exponent % 3n === 1n ? 10 : this.exponent % 3n === 2n ? 100 : 1;

      return `${this.base.mul(mult).toString().slice(0, 5)} ${UNDER_THIRTY[Math.floor(Number(this.exponent) / 3) - 1]}`;
    }

    let namedNumber = "";
    let lastConnectors: string[] | undefined = undefined;
    const numberArray = Math.floor(Number((this.exponent - 3n) / 3n))
      .toString()
      .split("") as unknown as number[];
    const arrayRemainder = numberArray.length % 3;

    const addFragment = (
      currentString: string,
      newFragment: [string, string[]],
    ): string => {
      if (lastConnectors === undefined) {
        lastConnectors = newFragment[1];

        return currentString + newFragment[0];
      }

      if (
        lastConnectors.includes("*") &&
        (newFragment[1].includes("s") || newFragment[1].includes("x"))
      ) {
        lastConnectors = newFragment[1];
        return currentString + "s" + newFragment[0];
      }

      let connector = "";
      for (const frag of lastConnectors) {
        for (const frag2 of newFragment[1]) {
          if (frag === frag2) connector = frag;
        }
      }

      lastConnectors = newFragment[1];
      return currentString + connector + newFragment[0];
    };

    if (arrayRemainder === 1)
      namedNumber += UNDER_THIRTY[numberArray[0]].slice(0, -2);

    if (arrayRemainder === 2) {
      namedNumber = addFragment(namedNumber, ONES[numberArray[0]]);
      namedNumber = addFragment(namedNumber, TENS[numberArray[1]]);

      namedNumber = removeEndVowel(namedNumber);
      if (numberArray.length > arrayRemainder) namedNumber += "illi";
    }

    const listWithoutRemainders = numberArray.slice(
      arrayRemainder,
      numberArray.length,
    );

    for (let i = 0; i < listWithoutRemainders.length; i += 3) {
      const ones = Number(listWithoutRemainders[i + 2]);
      const tens = Number(listWithoutRemainders[i + 1]);
      const hundreds = Number(listWithoutRemainders[i]);

      if (ones === 0 && tens === 0 && hundreds === 0) {
        namedNumber += "nilli";
      } else {
        if (ones !== 0) namedNumber = addFragment(namedNumber, ONES[ones]);
        if (tens !== 0) namedNumber = addFragment(namedNumber, TENS[tens]);
        if (hundreds !== 0)
          namedNumber = addFragment(namedNumber, HUNDREDS[hundreds]);

        if (i + 3 < listWithoutRemainders.length) {
          namedNumber = removeEndVowel(namedNumber);
          namedNumber += "illi";
        }
      }
    }

    namedNumber = removeEndVowel(namedNumber);
    return `${this.base.toString().slice(0, 5)} ${(namedNumber += "illion")}`;
  }

  /** @description Returns the current notation string according to the store. */
  currentNotation(): string {
    const notation = useStore.getState().notation;

    if (notation === "standard") return this.toNamed();
    if (notation === "scientific") return this.toScientific();
    if (notation === "engineering") return this.toEngineering();

    return this.toNamed();
  }

  multiply(number: BigNumber | Decimal | number): BigNumber {
    if (!(number instanceof BigNumber)) {
      return BigNumber.createNormalised(this.base.mul(number), this.exponent);
    }

    if (this.exponent === number.exponent) {
      return new BigNumber(this.base.mul(number.base), this.exponent);
    }

    return new BigNumber(
      this.base.mul(number.base),
      this.exponent + number.exponent,
    );
  }

  // These might lose precision if the larger exponent is picked
  add(number: BigNumber | Decimal | number): BigNumber {
    if (!(number instanceof BigNumber)) {
      return new BigNumber(this.base.add(number), this.exponent);
    }

    if (this.exponent === number.exponent) {
      return new BigNumber(this.base.add(number.base), this.exponent);
    }

    let newBase: Decimal;
    const exponentDifference = this.exponent - number.exponent;

    if (exponentDifference > 0n) {
      const scale = new Decimal(10).pow(exponentDifference.toString());
      newBase = this.base.add(number.base.div(scale));
    } else {
      const scale = new Decimal(10).pow(-exponentDifference.toString());
      newBase = this.base.div(scale).add(number.base);
    }

    return new BigNumber(newBase, this.exponent);
  }

  subtract(number: BigNumber | Decimal | number): BigNumber {
    if (number instanceof Decimal || typeof number === "number") {
      return new BigNumber(this.base.sub(number), this.exponent);
    }

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

  /** @description Check if a number is less than the number passed through the method */
  lessThan(number: BigNumber | Decimal | number): boolean {
    if (!(number instanceof BigNumber)) number = new BigNumber(number);

    if (this.exponent < number.exponent) return true;
    if (this.exponent > number.exponent) return false;

    return this.base.lessThan(number.base);
  }

  /** @description Check if a number is less than or equal to the number passed through the method */
  lessThanOrEqualTo(number: BigNumber | Decimal | number): boolean {
    if (!(number instanceof BigNumber)) number = new BigNumber(number);

    if (this.exponent < number.exponent) return true;
    if (this.exponent > number.exponent) return false;

    return this.base.lessThanOrEqualTo(number.base);
  }

  /** @description Check if a number is greater than the number passed through the method */
  greaterThan(number: BigNumber | Decimal | number): boolean {
    if (!(number instanceof BigNumber)) number = new BigNumber(number);

    if (this.exponent < number.exponent) return false;
    if (this.exponent > number.exponent) return true;

    return this.base.greaterThan(number.base);
  }

  /** @description Check if a number is greater than or equal to the number passed through the method */
  greaterThanOrEqualTo(number: BigNumber | Decimal | number): boolean {
    if (!(number instanceof BigNumber)) number = new BigNumber(number);

    if (this.exponent < number.exponent) return false;
    if (this.exponent > number.exponent) return true;

    return this.base.greaterThanOrEqualTo(number.base);
  }
}
