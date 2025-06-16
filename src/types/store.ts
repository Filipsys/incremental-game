import type Decimal from "decimal.js";

export type Transaction = EpochTimeStamp;

export interface GameStore {
  ticks: number;
  transactionsComplete: number;
  transactionsPending: number;
  transactionsPerTick: Decimal;
  transactionAccumulator: Decimal;
  transactionValidationSpeed: Decimal;

  funds: Decimal;
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
  buyTransactionValidationSpeedUpgrade: () => void;
  // buyTransactionMultithreadingUpgrade: () => void;
  // buyMaxLoanAmountUpgrade: () => void;
  // buyExpandCurrencyUpgrade: () => void;
  // buyQuantumStabilityUpgrade: () => void;

  startTick: () => void;
}
