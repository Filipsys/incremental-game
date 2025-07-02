import { useStore } from "../store/mainStore";
import Decimal from "decimal.js";

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
  const { transactionValidationSpeed, transactionValidationSpeedUpgrades } =
    useStore.getState();

  return transactionValidationSpeed.mul(
    new Decimal(0.99).pow(transactionValidationSpeedUpgrades),
  );
};
