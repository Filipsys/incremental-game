import { useEffect } from "react";
import { create } from "zustand";

type GameStore = {
  ticks: number;
  transactions: number;
  transactionsPerTick: number;
  setTicks: (ticks: number) => void;
  setTransactionsPerTick: (transactionsPerTick: number) => void;

  startTick: () => void;
};

const useStore = create<GameStore>((set) => ({
  ticks: 0,
  transactions: 0,
  transactionsPerTick: 0.1,
  setTicks: (ticks: number) => set({ ticks: ticks }),
  setTransactionsPerTick: (transactionsPerTick: number) =>
    set({ transactionsPerTick: transactionsPerTick }),

  startTick: () =>
    set((state) => ({
      ticks: state.ticks + 1,
      transactions: state.transactions + state.transactionsPerTick,
    })),
}));

function App() {
  const ticks = useStore((state) => state.ticks);
  const transactions = useStore((state) => state.transactions);
  const startTick = useStore((state) => state.startTick);

  useEffect(() => {
    const intervalLoop = setInterval(() => startTick(), 100);

    return () => clearInterval(intervalLoop);
  }, [startTick]);

  return (
    <>
      <p>Ticks: {ticks}</p>
      <p>Transactions: {transactions}</p>
    </>
  );
}

export default App;
