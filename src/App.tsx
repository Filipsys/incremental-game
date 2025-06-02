import { useEffect } from "react";
import { create } from "zustand";
import Decimal from "decimal.js";

import { Stage1 } from "./components/machines/stage1";

type GameStore = {
  ticks: number;
  transactions: Decimal;
  transactionsPerTick: Decimal;
  transactionAccumulator: Decimal;

  // Getters
  currentTransactionsPerTick: Decimal;

  // Upgrades
  transactionSpeedUpgrades: number;
  transactionValidationSpeedUpgrades: number;
  transactionMultithreadingUpgrades: number;
  maxLoanAmountUpgrades: number;
  expandCurrencyUpgrades: number;
  quantumStabilityUpgrades: number;

  setTicks: (ticks: number) => void;
  setTransactionsPerTick: (transactionsPerTick: number) => void;

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
  transactionsPerTick: new Decimal(1.7),
  transactionAccumulator: new Decimal(0),

  transactionSpeedUpgrades: 0,
  transactionValidationSpeedUpgrades: 0,
  transactionMultithreadingUpgrades: 0,
  maxLoanAmountUpgrades: 0,
  expandCurrencyUpgrades: 0,
  quantumStabilityUpgrades: 0,

  get currentTransactionsPerTick() {
    return this.transactionsPerTick.add(1 * this.transactionSpeedUpgrades);
  },

  setTicks: (ticks: number) => set({ ticks: ticks }),
  setTransactionsPerTick: (transactionsPerTick: number) =>
    set({ transactionsPerTick: new Decimal(transactionsPerTick) }),

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
      const totalAccumulated = state.transactionAccumulator.plus(
        state.currentTransactionsPerTick,
      );

      return {
        ticks: state.ticks + 1,
        transactions: state.transactions.plus(totalAccumulated.floor()),
        transactionAccumulator: totalAccumulated.mod(1),
      };
    }),
}));

function App() {
  const ticks = useStore((state) => state.ticks);
  const transactions = useStore((state) => state.transactions);
  const transactionSpeedUpgrades = useStore(
    (state) => state.transactionSpeedUpgrades,
  );
  const transactionAccumulator = useStore(
    (state) => state.transactionAccumulator,
  );
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
        Accumulator: {transactionAccumulator.toNumber()}
        <br />
        Transactions per tick:{" "}
        {useStore().currentTransactionsPerTick.toNumber()}
        <br />
        Transactions: {transactions.toNumber()}
        <br />
        <br />
        Transaction upgrades:
        <br />
        Transaction speed: {transactionSpeedUpgrades}
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
