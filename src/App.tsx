import { useEffect } from "react";
import { create } from "zustand";

type GameStore = {
  ticks: number;
  setTicks: (ticks: number) => void;

  startTick: () => void;
};

const useStore = create<GameStore>((set) => ({
  ticks: 0,
  setTicks: (ticks: number) => set({ ticks: ticks }),

  startTick: () => set((state) => ({ ticks: state.ticks + 1 })),
}));

function App() {
  const ticks = useStore((state) => state.ticks);
  const startTick = useStore((state) => state.startTick);

  useEffect(() => {
    const intervalLoop = setInterval(() => startTick(), 100);

    return () => clearInterval(intervalLoop);
  }, [startTick]);

  return (
    <>
      <p>{ticks}</p>
    </>
  );
}

export default App;
