import Decimal from "decimal.js";
import { BigNumber } from "../BigNumber";
import { create } from "zustand";
import { calculateValidationSpeed } from "../utils/utils";

import type { GameStore, Actions, Transaction } from "../types/store";

export const useStore = create<GameStore & Actions>((set) => ({
  ticks: 0,
  transactionsComplete: new BigNumber(0, 1n),
  transactionsPending: new BigNumber(0, 1n),
  transactionsPerTick: new Decimal(0.01), // 0.02
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: new Decimal(4000),

  funds: new BigNumber(0, 1n),
  maxTransferAmount: 100,
  instantTransferFee: new Decimal(0.02),

  transactionQueueAccumulator: 0,
  transactionQueueMaxAmount: 1,
  transactionQueueThreshold: 500,
  transactionQueue: [],
  transactionChanges: [],

  supportedCurrencies: [],

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  // transactionMultithreadingUpgrades: 0,
  // maxLoanAmountUpgrades: 0,
  // expandCurrencyUpgrades: 0,
  // quantumStabilityUpgrades: 0,

  notation: "standard",

  slowTicks: true,

  setTicks: (ticks: GameStore["ticks"]) => set({ ticks: ticks }),

  addFunds: (funds: GameStore["funds"]) =>
    set((state) => ({ funds: state.funds.add(funds) })),
  removeFunds: (funds: GameStore["funds"]) =>
    set((state) => ({ funds: state.funds.subtract(funds) })),
  setFunds: (funds: GameStore["funds"]) => set({ funds: funds }),

  setTransactionAccumulator: (
    transactionsAccumulated: GameStore["transactionAccumulator"],
  ) => set({ transactionAccumulator: transactionsAccumulated }),

  increaseTransactionQueueMaxAmount: () =>
    set((state) => {
      const previousLength = state.transactionQueue.length;
      state.resetTransactionQueue();

      return {
        transactionQueueAccumulator:
          Math.round(state.transactionQueueAccumulator / 2) + previousLength,
        transactionQueueMaxAmount: state.transactionQueueMaxAmount * 2,
      };
    }),

  setTransactionQueueThreshold: (
    threshold: GameStore["transactionQueueThreshold"],
  ) => set({ transactionQueueThreshold: threshold }),

  setTransactionQueue: (queue: GameStore["transactionQueue"]) =>
    set({ transactionQueue: queue }),

  resetTransactionQueue: () => set({ transactionQueue: [] }),

  buyTransactionSpeedUpgrade: () =>
    set((state) => ({
      funds: state.funds.subtract(new BigNumber(40)),
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + 1,
    })),
  setTransactionSpeedUpgrade: (amount: number) =>
    set((state) => ({
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + amount,
    })),
  buyTransactionValidationSpeedUpgrade: () =>
    set((state) => ({
      funds: state.funds.subtract(new BigNumber(120)),
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + 1,
    })),
  setTransactionValidationSpeedUpgrade: (amount: number) =>
    set((state) => ({
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + amount,
    })),

  changeNotation: (newNotation: GameStore["notation"]) =>
    set({ notation: newNotation }),

  setSlowTicks: (setting: GameStore["slowTicks"]) =>
    set({ slowTicks: setting }),

  startTick: () =>
    set((state) => {
      const currentTime: EpochTimeStamp = Date.now();
      const currentTransactionQueueMaxAmount =
        state.transactionQueueMaxAmount > 1
          ? state.transactionQueueMaxAmount / 2
          : state.transactionQueueMaxAmount;
      let completedTransactionsCount = 0;

      // Count the accumulated transactions from the queue accumulation
      let usedTransactionQueueAcc = false;
      if (state.transactionQueueAccumulator > 0) {
        completedTransactionsCount += currentTransactionQueueMaxAmount;

        usedTransactionQueueAcc = true;
      }

      // Remove the pending transactions if their time has passed & add
      // the completed transaction count to the completed transaction amount
      let iterator = 0;
      while (
        iterator < state.transactionQueue.length &&
        calculateValidationSpeed()
          .plus(state.transactionQueue[iterator])
          .lessThan(currentTime)
      ) {
        completedTransactionsCount += currentTransactionQueueMaxAmount;

        iterator++;
      }

      const filteredQueue = state.transactionQueue.slice(iterator);

      // Gather the total accumulated transactions
      // + the transaction amount from this tick
      const totalAccumulated = state.transactionAccumulator.add(
        state.transactionsPerTick.mul(
          state.transactionSpeedUpgrades > 0
            ? state.transactionSpeedUpgrades + 1
            : 1,
        ),
      );

      const newTransactionQueue: Transaction[] = [...filteredQueue];

      // Check if the accumulated transaction amount is higher than
      // the transaction queue max amount, if so, create a new
      // transaction, else, skip and add to accumulated transaction amount
      if (
        totalAccumulated.greaterThanOrEqualTo(state.transactionQueueMaxAmount)
      ) {
        // completedTransactionsCount +=
        //   state.transactionQueueMaxAmount -
        //   (state.transactionQueueMaxAmount % totalAccumulated.toNumber());
        //
        // totalAccumulated.minus(totalAccumulated.mod(1));
      } else {
        // state.setTransactionAccumulator(
        //   state.transactionAccumulator.plus(totalAccumulated),
        // );
      }

      // Add the funds according to the completed transactions from this tick
      // maxTransferAmount is a placeholder. The amounts will be created later
      let newFunds: GameStore["funds"] = new BigNumber(0);
      if (completedTransactionsCount > 0) {
        // 10 - ten dollar payments
        newFunds = new BigNumber(1)
          .multiply(completedTransactionsCount)
          .multiply(state.instantTransferFee);
      }

      // Check if the transaction queue is past the threshold, if so,
      // increase the transactions amount in the queue
      if (state.transactionQueue.length > state.transactionQueueThreshold) {
        state.increaseTransactionQueueMaxAmount();

        state.setTransactionQueueThreshold(
          Math.round(state.transactionQueueThreshold * 1.1),
        );

        state.resetTransactionQueue();
      }

      // Add the new transactions to the transaction queue
      if (
        totalAccumulated.greaterThanOrEqualTo(state.transactionQueueMaxAmount)
      ) {
        for (
          let i = 0;
          i <
          Math.floor(
            totalAccumulated.floor().toNumber() /
              state.transactionQueueMaxAmount,
          );
          i++
        ) {
          newTransactionQueue.push(Date.now());
        }
      }

      const newTransactionQueueAccumulator = usedTransactionQueueAcc
        ? --state.transactionQueueAccumulator
        : state.transactionQueueAccumulator;

      return {
        ticks: state.ticks + 1,
        transactionsComplete: state.transactionsComplete.add(
          completedTransactionsCount,
        ),
        transactionsPending: new BigNumber(filteredQueue.length),
        transactionAccumulator: totalAccumulated.mod(1),
        transactionQueue: newTransactionQueue,
        transactionQueueAccumulator: newTransactionQueueAccumulator,
        funds: state.funds.add(newFunds),
      };
    }),
}));
