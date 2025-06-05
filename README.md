Tasks that happen every tick:
1. Filter through the current transaction queue, check if the transaction validation time has passed. If so, add the transaction amount (decimal) to the completed transactions amount and remove it from the filtered list.
2. Set the transaction queue to the current filtered queue, adding in the total accumulated transaction amount, plus the current transaction count that would be added in this tick.
3. Return the altered data to the state store (Zustand) to update it, including the tick increment, complete transaction count as a rounded number, the pending transactions amount as a number from the filtered queue length, and the decimal value of the total accumulated transactions
