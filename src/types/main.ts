export interface TransctionDetails {
  senderID: string;
  senderName: string;
  senderSurname: string;
  recieverID: string;
  recieverName: string;
  recieverSurname: string;

  transactionID: string;
  transactionState: "success" | "reject" | "pending";
  transactionType: "SEND" | "REQUEST" | "FULFILL" | "LOAN";
  transactionAmount: number;
  currency: string;
  timestamp: EpochTimeStamp;
}
