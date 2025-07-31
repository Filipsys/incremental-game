import Decimal from "decimal.js";
import { BigNumber } from "../BigNumber";
import { create } from "zustand";
import { calculateValidationSpeed } from "../utils/utils";

import type { GameStore, Actions } from "../types/store";

const checkTransactionThreshold = (state: GameStore & Actions): void => {
  if (state.transactionQueue.length >= state.transactionQueueThreshold) {
    state.addTransactionQueueUpdate(
      state.transactionsPerTick.mul(
        state.transactionSpeedUpgrades > 0
          ? state.transactionSpeedUpgrades + 1
          : 1,
      ),
      state.transactionAccumulator,
      state.transactionQueue.length,
      state.transactionQueueMaxAmount,
      state.transactionValidationSpeed,
      Date.now(),
    );

    state.resetTransactionAccumulator();
    state.increaseTransactionQueueMaxAmount();

    state.setTransactionQueueThreshold(
      Math.round(state.transactionQueueThreshold * 1.1),
    );

    state.resetTransactionQueue();
  }
};

const addNewTransactionsToQueue = (
  totalAccumulated: Decimal,
  transactionQueueMaxAmount: number,
  newTransactionQueue: number[],
): void => {
  if (totalAccumulated.greaterThanOrEqualTo(transactionQueueMaxAmount)) {
    for (
      let i = 0;
      i < totalAccumulated.div(transactionQueueMaxAmount).floor().toNumber();
      i++
    ) {
      newTransactionQueue.push(Date.now());
    }
  }
};

export const useStore = create<GameStore & Actions>((set) => ({
  ticks: 0,
  transactionsComplete: new BigNumber(0, 1n),
  transactionsPending: new BigNumber(0, 1n),
  transactionsPerTick: new Decimal(0.02), // 0.02
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: new Decimal(4000),

  funds: new BigNumber(0, 1n),
  maxTransferAmount: 100,
  instantTransferFee: new Decimal(0.02),

  transactionQueueAccumulator: 0,
  transactionQueueMaxAmount: 1,
  transactionQueueThreshold: 500,
  transactionQueueUpdates: [],
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
  resetTransactionAccumulator: () =>
    set({ transactionAccumulator: new Decimal(0) }),

  increaseTransactionQueueMaxAmount: () =>
    set((state) => {
      const previousLength = state.transactionQueue.length;
      state.resetTransactionQueue();

      return {
        transactionQueueAccumulator:
          Math.floor(state.transactionQueueAccumulator / 2) +
          (state.transactionQueueAccumulator % 2) +
          previousLength,
        transactionQueueMaxAmount: state.transactionQueueMaxAmount * 2,
      };
    }),

  setTransactionQueueThreshold: (
    threshold: GameStore["transactionQueueThreshold"],
  ) => set({ transactionQueueThreshold: threshold }),

  setTransactionQueue: (queue: GameStore["transactionQueue"]) =>
    set({ transactionQueue: queue }),
  resetTransactionQueue: () => set({ transactionQueue: [] }),

  addTransactionQueueUpdate: (
    calculatedTransactionsPerTick: Decimal,
    transactionAccumulator: Decimal,
    transactionAmount: number,
    transactionValue: number,
    transactionValidationSpeed: Decimal,
  ) =>
    set((state) => {
      return {
        transactionQueueUpdates: [
          ...state.transactionQueueUpdates,
          {
            calculatedTransactionsPerTick,
            transactionAccumulator,
            transactionAmount,
            transactionValue,
            transactionValidationSpeed,
            timestamp: Date.now(),
          },
        ],
      };
    }),

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
    set((state) => {
      state.addTransactionQueueUpdate(
        state.transactionsPerTick.mul(
          state.transactionSpeedUpgrades > 0
            ? state.transactionSpeedUpgrades + 1
            : 1,
        ),
        state.transactionAccumulator,
        state.transactionQueue.length,
        state.transactionQueueMaxAmount,
        state.transactionValidationSpeed,
        Date.now(),
      );

      state.resetTransactionAccumulator();

      return {
        funds: state.funds.subtract(new BigNumber(120)),
        transactionValidationSpeedUpgrades:
          state.transactionValidationSpeedUpgrades + 1,
      };
    }),
  setTransactionValidationSpeedUpgrade: (amount: number) =>
    set((state) => {
      state.addTransactionQueueUpdate(
        state.transactionsPerTick.mul(
          state.transactionSpeedUpgrades > 0
            ? state.transactionSpeedUpgrades + 1
            : 1,
        ),
        state.transactionAccumulator,
        state.transactionQueue.length,
        state.transactionQueueMaxAmount,
        state.transactionValidationSpeed,
        Date.now(),
      );

      state.resetTransactionAccumulator();

      return {
        transactionValidationSpeedUpgrades:
          state.transactionValidationSpeedUpgrades + amount,
      };
    }),

  changeNotation: (newNotation: GameStore["notation"]) =>
    set({ notation: newNotation }),

  setSlowTicks: (setting: GameStore["slowTicks"]) =>
    set({ slowTicks: setting }),

  startTick: () =>
    set((state) => {
      const currentTime: EpochTimeStamp = Date.now();

      const tqMaxAmount = state.transactionQueueMaxAmount;
      const currentTransactionQueueMaxAmount =
        tqMaxAmount > 1 ? tqMaxAmount / 2 : tqMaxAmount;

      let completedTransactionsCount = 0;

      // Count the accumulated transactions from the queue accumulation
      if (
        state.transactionQueueAccumulator >= currentTransactionQueueMaxAmount
      ) {
        completedTransactionsCount += Math.floor(
          state.transactionQueueAccumulator / currentTransactionQueueMaxAmount,
        );
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

      // Add the funds according to the completed transactions from this tick
      // maxTransferAmount is a placeholder. The amounts will be created later
      let newFunds: GameStore["funds"] = new BigNumber(0);
      if (completedTransactionsCount > 0) {
        // 10 - ten dollar payments
        newFunds = new BigNumber(10)
          .multiply(completedTransactionsCount)
          .multiply(state.instantTransferFee);
      }

      // Check if the transaction queue is past the threshold, if so,
      // increase the transactions amount in the queue
      checkTransactionThreshold(state);

      // Add the new transactions to the transaction queue
      addNewTransactionsToQueue(
        totalAccumulated,
        state.transactionQueueMaxAmount,
        filteredQueue,
      );

      return {
        ticks: state.ticks + 1,
        transactionsComplete: state.transactionsComplete.add(
          completedTransactionsCount,
        ),
        transactionsPending: new BigNumber(filteredQueue.length),
        transactionAccumulator: totalAccumulated.mod(1),
        transactionQueue: filteredQueue,
        transactionQueueAccumulator: totalAccumulated //issue
          .div(currentTransactionQueueMaxAmount)
          .floor()
          .toNumber(),
        funds: state.funds.add(newFunds),
      };
    }),
}));
