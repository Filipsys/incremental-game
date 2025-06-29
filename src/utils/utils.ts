import { useStore } from "../store/mainStore";
import type Decimal from "decimal.js";

export const DEBUG_MODE = import.meta.env.DEV;

export const debug = (message: string | number, isError = false) => {
  if (!DEBUG_MODE) return;

  console.log(
    isError ? "%c[ ERROR ]" : "%c[ DEBUG ]",
    `color: white; background:${isError ? "red" : "green"}; padding: 1px 3px`,
    message,
  );
};

export const calculateValidationSpeed = (): Decimal => {
  const upgradeAmount = useStore.getState().transactionValidationSpeedUpgrades;
  let totalTime = useStore.getState().transactionValidationSpeed;

  for (let i = 0; i < upgradeAmount; i++) {
    totalTime = totalTime.mul(0.99);
  }

  return totalTime;
};
