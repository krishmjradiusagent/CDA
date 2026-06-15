import { isWireInstructionComplete } from './src/app/lib/wire-instructions';
const record = {
  accountHolderName: "John Doe",
  bankName: "Chase",
  routingNumber: "123456789",
  accountNumber: "123456789",
  bankStreet: "123 Main St",
  bankCity: "SF",
  bankState: "CA",
  bankZip: "94105",
  cdaType: "",
  id: "ext-Credits",
  payableName: "Keller Williams",
  updatedAt: new Date().toISOString()
};
console.log("isComplete:", isWireInstructionComplete(record as any, { requireBankDetails: true }));
