import type { customBigNumber } from "./types/main";

// Methods needed:
// toLiteral()
// plus()
// minus()
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

  lessThan(number: BigNumber): boolean {
    if (this.base.lessThan(number.base) && this.exponent < number.exponent)
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
    if (this.base.greaterThan(number.base) && this.exponent > number.exponent)
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
