import { validateWireInstruction, isWireInstructionComplete } from './src/app/lib/wire-instructions';
const record = {
  accountHolderName: "Credits",
  bankName: "Chase",
  routingNumber: "123456789",
  accountNumber: "123456789",
  bankStreet: "123 Main St",
  bankCity: "SF",
  bankState: "CA",
  bankZip: "94105",
  cdaType: "",
  id: "ext-Credits",
  payableName: "Credits",
  updatedAt: new Date().toISOString()
};
console.log(isWireInstructionComplete(record as any, { requireBankDetails: true }));
