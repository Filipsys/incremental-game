import { Decimal } from "decimal.js";

import type { customBigNumber } from "./types/main";

// Methods needed:
// toLiteral()
// minus()
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

  multiply(number: BigNumber): BigNumber {
    return new BigNumber(
      this.base.mul(number.base),
      this.exponent + number.exponent,
    );
  }

  add(number: BigNumber): BigNumber {
    if (this.exponent === number.exponent) {
      return new BigNumber(this.base.add(number.base), this.exponent);
    }

    const exponentDifference = this.exponent - number.exponent;

    if (exponentDifference > 0n) {
      const scale = new Decimal(10).pow(exponentDifference.toString());
      const newBase = this.base.add(number.base.div(scale));

      return new BigNumber(newBase, this.exponent);
    } else {
      const scale = new Decimal(10).pow(-exponentDifference.toString());
      const newBase = this.base.div(scale).add(number.base);

      return new BigNumber(newBase, this.exponent);
    }
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
