import type Decimal from "decimal.js";
import type { BigNumber } from "../BigNumber";

export type Transaction = EpochTimeStamp;

export interface GameStore {
  ticks: number;
  transactionsComplete: BigNumber;
  transactionsPending: BigNumber;
  transactionsPerTick: Decimal;
  transactionAccumulator: Decimal;
  transactionValidationSpeed: Decimal;

  funds: BigNumber;
  maxTransferAmount: number;
  instantTransferFee: Decimal;

  transactionQueueAccumulator: Decimal;
  transactionQueueAmount: number;
  transactionQueueThreshold: number;
  transactionQueue: Transaction[];

  supportedCurrencies: string[];

  // Upgrades
  transactionSpeedUpgrades: number;
  transactionValidationSpeedUpgrades: number;
  // transactionMultithreadingUpgrades: number;
  // maxLoanAmountUpgrades: number;
  // expandCurrencyUpgrades: number;
  // quantumStabilityUpgrades: number;

  // Utils
  notation: "standard" | "scientific";
}

export interface Actions {
  setTicks: (ticks: GameStore["ticks"]) => void;

  addFunds: (funds: GameStore["funds"]) => void;
  removeFunds: (funds: GameStore["funds"]) => void;
  setFunds: (funds: GameStore["funds"]) => void;

  setTransactionAccumulator: (
    accumulatedTransactions: GameStore["transactionAccumulator"],
  ) => void;

  increaseTransactionQueueAmount: () => void;
  setTransactionQueueThreshold: (
    threshold: GameStore["transactionQueueThreshold"],
  ) => void;
  setTransactionQueue: (queue: GameStore["transactionQueue"]) => void;
  // pushToTransactionQueue: (transaction: [Decimal, EpochTimeStamp]) => void;

  buyTransactionSpeedUpgrade: () => void;
  setTransactionSpeedUpgrade: (amount: number) => void;
  buyTransactionValidationSpeedUpgrade: () => void;
  setTransactionValidationSpeedUpgrade: (amount: number) => void;
  // buyTransactionMultithreadingUpgrade: () => void;
  // buyMaxLoanAmountUpgrade: () => void;
  // buyExpandCurrencyUpgrade: () => void;
  // buyQuantumStabilityUpgrade: () => void;

  // Utils
  changeNotation: (newNotation: GameStore["notation"]) => void;
  startTick: () => void;
}
