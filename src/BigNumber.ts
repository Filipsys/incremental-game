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

  constructor(base: Decimal.Value, exponent = 1n) {
    this.base = new Decimal(base);
    this.exponent = exponent;

    this.normaliseBase();
  }

  normaliseBase(): BigNumber {
    if (this.base.lessThan(10)) return this;

    const divider = Math.floor(this.base.toNumber()).toString().length - 1;

    return new BigNumber(
      this.base.div(Math.pow(10, divider)),
      this.exponent + BigInt(divider),
    );
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
    if (this.exponent <= 6n)
      return `${this.base.mul(Math.pow(10, Number(this.exponent)))}`;

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

  multiply(number: BigNumber): BigNumber {
    return new BigNumber(
      this.base.mul(number.base),
      this.exponent + number.exponent,
    ).normaliseBase();
  }

  // These might lose precision if the larger exponent is picked
  add(number: BigNumber): BigNumber {
    if (this.exponent === number.exponent) {
      return new BigNumber(
        this.base.add(number.base),
        this.exponent,
      ).normaliseBase();
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

    return new BigNumber(newBase, this.exponent).normaliseBase();
  }

  // TODO: Add Decimal.Value as another working type
  subtract(number: BigNumber): BigNumber {
    if (this.exponent === number.exponent) {
      return new BigNumber(
        this.base.minus(number.base),
        this.exponent,
      ).normaliseBase();
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

    return new BigNumber(newBase, this.exponent).normaliseBase();
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
