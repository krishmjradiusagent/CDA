import { validateWireInstruction } from './src/app/lib/wire-instructions';
const record = {
  accountHolderName: "John Doe",
  bankName: "Chase",
  routingNumber: "123456789",
  accountNumber: "123456789",
  bankStreet: "123 Main St",
  bankCity: "SF",
  bankState: "CA",
  bankZip: "94105",
  cdaType: "full-transparency",
  id: "team-wire",
  payableName: "Circle Real Estate - Team",
};
console.log(validateWireInstruction(record as any, { requireBankDetails: true, requireCdaType: true }));
