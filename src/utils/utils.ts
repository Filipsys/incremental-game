export const DEBUG_MODE = import.meta.env.DEV;

export const debug = (message: string | number, isError = false) => {
  if (!DEBUG_MODE) return;

  console.log(
    isError ? "%c[ ERROR ]" : "%c[ DEBUG ]",
    `color: white; background:${isError ? "red" : "green"}; padding: 1px 3px`,
    message,
  );
};
