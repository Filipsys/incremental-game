import Decimal from "decimal.js";
import { create } from "zustand";

import type { GameStore, Actions } from "../types/store";

export const useStore = create<GameStore & Actions>((set) => ({
  ticks: 0,
  transactionsComplete: 0,
  transactionsPending: 0,
  transactionsPerTick: new Decimal(0.1),
  transactionAccumulator: new Decimal(0),
  transactionValidationSpeed: 2000,

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

  setTransactionQueue: (queue: GameStore["transactionQueue"]) =>
    set(() => ({ transactionQueue: queue })),

  buyTransactionSpeedUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + 1,
    })),
  buyTransactionValidationSpeedUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + 1,
    })),
  buyTransactionMultithreadingUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      transactionMultithreadingUpgrades:
        state.transactionMultithreadingUpgrades + 1,
    })),
  buyMaxLoanAmountUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      maxLoanAmountUpgrades: state.maxLoanAmountUpgrades + 1,
    })),
  buyExpandCurrencyUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      expandCurrencyUpgrades: state.expandCurrencyUpgrades + 1,
    })),
  buyQuantumStabilityUpgrade: () =>
    set((state) => ({
      transactionsComplete: state.transactionsComplete - 40,
      quantumStabilityUpgrades: state.quantumStabilityUpgrades + 1,
    })),

  startTick: () =>
    set((state) => {
      let completedTransactionsAmount = new Decimal(0);
      const currentTime: EpochTimeStamp = Date.now();

      // Remove the pending transactions if their time has passed
      const filteredQueue = state.transactionQueue.filter((transaction) => {
        if (state.transactionValidationSpeed + transaction[1] < currentTime) {
          completedTransactionsAmount = completedTransactionsAmount.plus(
            transaction[0],
          );

          // I'm most definitely sure this is incorrect
          state.addFunds(new Decimal(10).mul(state.instantTransferFee));

          return false;
        }

        return true;
      });

      const totalAccumulated = state.transactionAccumulator.plus(
        state.transactionsPerTick.add(1 * state.transactionSpeedUpgrades),
      );

      state.setTransactionQueue([
        ...filteredQueue,
        [totalAccumulated, Date.now()],
      ]);

      return {
        ticks: state.ticks + 1,
        transactionsComplete:
          state.transactionsComplete +
          completedTransactionsAmount.floor().toNumber(),
        transactionsPending: filteredQueue.length,
        transactionAccumulator: totalAccumulated.mod(1),
      };
    }),
}));
