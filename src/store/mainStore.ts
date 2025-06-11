import Decimal from "decimal.js";
import { create } from "zustand";

import type { GameStore, Actions, Transaction } from "../types/store";
import { debug } from "../utils";

export const useStore = create<GameStore & Actions>((set) => ({
  ticks: 0,
  transactionsComplete: 0,
  transactionsPending: 0,
  transactionsPerTick: new Decimal(2.1),
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: 4000,

  funds: new Decimal(0),
  maxTransferAmount: 100,
  instantTransferFee: new Decimal(0.02),

  transactionQueue: [],
  supportedCurrencies: [],

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  transactionMultithreadingUpgrades: 0,
  maxLoanAmountUpgrades: 0,
  expandCurrencyUpgrades: 0,
  quantumStabilityUpgrades: 0,

  setTicks: (ticks: GameStore["ticks"]) => set({ ticks: ticks }),

  addFunds: (funds: GameStore["funds"]) =>
    set((state) => ({ funds: state.funds.plus(funds) })),
  removeFunds: (funds: GameStore["funds"]) =>
    set((state) => ({ funds: state.funds.minus(funds) })),
  setFunds: (funds: GameStore["funds"]) => set(() => ({ funds: funds })),

  setTransactionAccumulator: (
    transactionsAccumulated: GameStore["transactionAccumulator"],
  ) => set(() => ({ transactionAccumulator: transactionsAccumulated })),
  setTransactionQueue: (queue: GameStore["transactionQueue"]) =>
    set(() => ({ transactionQueue: queue })),

  buyTransactionSpeedUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + 1,
    })),
  buyTransactionValidationSpeedUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + 1,
    })),
  buyTransactionMultithreadingUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      transactionMultithreadingUpgrades:
        state.transactionMultithreadingUpgrades + 1,
    })),
  buyMaxLoanAmountUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      maxLoanAmountUpgrades: state.maxLoanAmountUpgrades + 1,
    })),
  buyExpandCurrencyUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      expandCurrencyUpgrades: state.expandCurrencyUpgrades + 1,
    })),
  buyQuantumStabilityUpgrade: () =>
    set((state) => ({
      funds: state.funds.minus(40),
      quantumStabilityUpgrades: state.quantumStabilityUpgrades + 1,
    })),

  startTick: () =>
    set((state) => {
      let completedTransactionsAmount = new Decimal(0);
      let completedTransactionsCount = 0;
      const currentTime: EpochTimeStamp = Date.now();

      // Remove the pending transactions if their time has passed & add
      // the completed transaction count to the completed transaction amount
      const filteredQueue = state.transactionQueue.filter((transaction) => {
        if (
          state.transactionValidationSpeed + transaction.timestamp <
          currentTime
        ) {
          completedTransactionsAmount = completedTransactionsAmount.plus(
            transaction.transactionAmount,
          );

          return false;
        }

        return true;
      });

      // Gather the total accumulated transactions from the current transaction amount + the transaction amount from this tick
      const totalAccumulated = state.transactionAccumulator.plus(
        state.transactionsPerTick.add(1 * state.transactionSpeedUpgrades),
      );

      debug(`Total accumulated: ${totalAccumulated.toNumber()}`);

      // Check if the accumulated transaction amount is higher than 1, if so, create a new transaction, else, skip and add to accumulated transaction amount
      if (
        state.transactionAccumulator
          .plus(totalAccumulated)
          .greaterThanOrEqualTo(1)
      ) {
        completedTransactionsCount =
          completedTransactionsCount + totalAccumulated.floor().toNumber();

        totalAccumulated.minus(totalAccumulated.mod(1));
      } else {
        state.setTransactionAccumulator(
          state.transactionAccumulator.plus(totalAccumulated),
        );
      }

      debug(
        `Total completed transactions count: ${completedTransactionsCount}`,
      );

      // Add the funds according to the completed transactions from this tick
      // maxTransferAmount is a placeholder. The amounts will be created later
      let newFunds: Decimal = new Decimal(0);
      if (completedTransactionsCount > 0) {
        newFunds = new Decimal(state.maxTransferAmount)
          .mul(state.instantTransferFee)
          .mul(completedTransactionsCount);
      }

      // Add the new transactions to the transaction queue
      let newTransactionQueue: Transaction[] = [...filteredQueue];
      if (totalAccumulated.greaterThanOrEqualTo(1)) {
        const temporaryArray: Transaction[] = [];

        for (let i = 0; i < totalAccumulated.floor().toNumber(); i++) {
          temporaryArray.push({
            transactionAmount: new Decimal(1),
            timestamp: Date.now(),
          });
        }

        newTransactionQueue = [...filteredQueue, ...temporaryArray];
      }

      debug(`Transactions queue: ${newTransactionQueue}`);
      debug(`New transactions count: ${completedTransactionsCount}`);
      debug(state.transactionAccumulator.toNumber());

      return {
        ticks: state.ticks + 1,
        transactionsComplete:
          state.transactionsComplete +
          completedTransactionsAmount.floor().toNumber(),
        transactionsPending: filteredQueue.length,
        transactionAccumulator: totalAccumulated.mod(1),
        transactionQueue: newTransactionQueue,
        funds: state.funds.plus(newFunds),
      };
    }),
}));
