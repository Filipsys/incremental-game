import type { customBigNumber } from "./types/main";

export class BigNumber {
  base: customBigNumber["base"];
  exponent: customBigNumber["exponent"];

  constructor(
    base: customBigNumber["base"],
    exponent: customBigNumber["exponent"],
  ) {
    this.base = base;
    this.exponent = exponent;
  }

  toScientific(): string {
    return `${this.base.toString()}e${this.exponent.toString()}`;
  }

  multiply(number: BigNumber): BigNumber {
    return new BigNumber(
      this.base.mul(number.base),
      this.exponent + number.exponent,
    );
  }
}
