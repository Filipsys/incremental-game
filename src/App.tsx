import { useEffect } from "react";
import { create } from "zustand";
import Decimal from "decimal.js";

import { Stage1 } from "./components/machines/stage1";

type GameStore = {
  ticks: number;
  transactions: Decimal;
  transactionsPerSecond: Decimal;
  transactionAccumulator: Decimal;

  // Upgrades
  transactionSpeedUpgrades: number;
  transactionValidationSpeedUpgrades: number;
  transactionMultithreadingUpgrades: number;
  maxLoanAmountUpgrades: number;
  expandCurrencyUpgrades: number;
  quantumStabilityUpgrades: number;

  setTicks: (ticks: number) => void;
  settransactionsPerSecond: (transactionsPerSecond: number) => void;

  buyTransactionSpeedUpgrade: () => void;
  buyTransactionValidationSpeedUpgrade: () => void;
  buyTransactionMultithreadingUpgrade: () => void;
  buyMaxLoanAmountUpgrade: () => void;
  buyExpandCurrencyUpgrade: () => void;
  buyQuantumStabilityUpgrade: () => void;

  startTick: () => void;
};

const useStore = create<GameStore>((set) => ({
  ticks: 0,
  transactions: new Decimal(0),
  transactionsPerSecond: new Decimal(0.1),
  transactionAccumulator: new Decimal(0),

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  transactionMultithreadingUpgrades: 0,
  maxLoanAmountUpgrades: 0,
  expandCurrencyUpgrades: 0,
  quantumStabilityUpgrades: 0,

  setTicks: (ticks: number) => set({ ticks: ticks }),
  settransactionsPerSecond: (transactionsPerSecond: number) =>
    set({ transactionsPerSecond: new Decimal(transactionsPerSecond) }),

  buyTransactionSpeedUpgrade: () =>
    set((state) => ({
      transactions: state.transactions.minus(40),
      transactionSpeedUpgrades: state.transactionSpeedUpgrades + 1,
    })),
  buyTransactionValidationSpeedUpgrade: () =>
    set((state) => ({
      transactions: state.transactions.minus(40),
      transactionValidationSpeedUpgrades:
        state.transactionValidationSpeedUpgrades + 1,
    })),
  buyTransactionMultithreadingUpgrade: () =>
    set((state) => ({
      transactions: state.transactions.minus(40),
      transactionMultithreadingUpgrades:
        state.transactionMultithreadingUpgrades + 1,
    })),
  buyMaxLoanAmountUpgrade: () =>
    set((state) => ({
      transactions: state.transactions.minus(40),
      maxLoanAmountUpgrades: state.maxLoanAmountUpgrades + 1,
    })),
  buyExpandCurrencyUpgrade: () =>
    set((state) => ({
      transactions: state.transactions.minus(40),
      expandCurrencyUpgrades: state.expandCurrencyUpgrades + 1,
    })),
  buyQuantumStabilityUpgrade: () =>
    set((state) => ({
      transactions: state.transactions.minus(40),
      quantumStabilityUpgrades: state.quantumStabilityUpgrades + 1,
    })),

  startTick: () =>
    set((state) => {
      const acc = new Decimal(state.transactionAccumulator).plus(
        state.transactionsPerSecond,
      );

      if (acc.greaterThanOrEqualTo(1)) {
        state.transactions = state.transactions.plus(
          state.transactionsPerSecond.mul(10),
        );
      }

      return {
        ticks: state.ticks + 1,
        transactions: state.transactions,
        transactionAccumulator: acc.mod(1),
      };
    }),
}));

function App() {
  const ticks = useStore((state) => state.ticks);
  const transactions = useStore((state) => state.transactions);
  const startTick = useStore((state) => state.startTick);
  const buyTransactionSpeedUpgrade = useStore(
    (state) => state.buyTransactionSpeedUpgrade,
  );

  useEffect(() => {
    const intervalLoop = setInterval(() => startTick(), 100);

    return () => clearInterval(intervalLoop);
  }, [startTick]);

  return (
    <>
      <pre style={{ fontFamily: "monospace" }}>
        <Stage1
          data={[
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
            "s",
          ]}
        />
      </pre>

      <p>
        Ticks: {ticks}
        <br />
        Transactions: {transactions.toNumber()}
      </p>

      <button
        type="button"
        onClick={() => buyTransactionSpeedUpgrade()}
        disabled={transactions.minus(40).toNumber() < 0}
      >
        <p>Transaction speed upgrade</p>
        <p>40tC</p>
      </button>
    </>
  );
}

export default App;
