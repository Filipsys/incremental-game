High priority:
- [x] Fix edge case where 1e31 & 1e30 both give nonillillion.
- [ ] Fix issue where funds number's exponent is always higher by one than the actual debug input.
- [ ] Fix pending transactions getting reset upon transaction queue amount size increase.
- [ ] Add a transaction changes array that will track every transaction amount change and save it with the exact timestamp.
- [ ] Revamp the ms values to ticks so that the slowTicks debug setting will be able to slow down everything.

Medium priority:
- [ ]

Low priority:
- [ ]

##### Tick loop
1. Count the accumulated transactions from the queue accumulation
2. Loop through the transaction queue until the current time is greater than the transaction timestamp + the validation speed. Remove the pending transactions if their time has passed & add the completed transaction count to the completed transactions amount. Save the filtered queue for future use
3. Get the total accumulated transactions and add the accumulated transactions from the current tick
4. Get the funds this tick from the completed transactions if the completed transctions count is larger than 0
5. Check if the transaction queue is past the threshold, if so, increase the transactions amount in the queue
6. Check if the total accumulated transaction amount is higher than the transaction queue max amount and create new transactions (for example (41.6 total accumulated transactions / 4 transactionQueueMaxAmount).floor() = 10 new transactions valued as 4 each) and save the rest of the accumulated transactions. Add the new transactions to the transaction queue
