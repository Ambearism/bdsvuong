
import { Transaction, TransactionStatus, TxSource, Deal } from '../types';
import { MOCK_TRANSACTIONS } from './mockTransactions';
import { ALL_DEALS } from '../data';
// Fix: Import Property and Customer from where they are defined
import { MOCK_PROPERTIES, Property } from './mockProperties';
import { MOCK_CUSTOMERS, Customer } from './mockCustomers';

// Mock in-memory store for demo
let transactions = [...MOCK_TRANSACTIONS];

export const getTransactionsStore = () => transactions;

export const createTransactionFromDeal = (deal: Deal): Transaction => {
  const property = MOCK_PROPERTIES.find(p => p.id === deal.leadId) || (MOCK_PROPERTIES[0] as any); 
  
  const newTx: Transaction = {
    id: `TX${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "auto_from_deal",
    dealId: deal.id,
    customerId: deal.customerId,
    customerCode: "#C" + Math.floor(1000 + Math.random() * 9000),
    customerName: deal.customerName,
    customerPhone: deal.phone,
    propertyId: property.id,
    propertyCode: property.code,
    propertyName: property.name,
    propertyType: property.type.replace('_', ' '),
    purpose: property.purpose,
    project: property.project,
    ward: property.ward,
    areaM2: property.areaM2,
    dealValueTy: deal.budgetTy,
    depositAmountTy: 0,
    // Add missing commissionFee property to satisfy Transaction interface
    commissionFee: property.brokerFee || "--",
    status: "dat_coc",
    legalStatus: property.legalStatus,
    assigneeName: deal.assignee,
    internalNote: `Tạo tự động từ Deal ${deal.id} lúc ${new Date().toLocaleString()}`,
    documents: [],
    hasContract: false,
    hasDepositProof: false,
    riskFlag: "ok"
  };

  transactions = [newTx, ...transactions];
  return newTx;
};

export const syncStatusOnTransactionUpdate = (tx: Transaction) => {
  console.log(`[Sync] Transaction ${tx.id} updated to ${tx.status}`);
  
  if (tx.status === "hoan_tat") {
    // 1. Sync Property
    const prop = MOCK_PROPERTIES.find(p => p.id === tx.propertyId);
    if (prop) {
        console.log(`[Sync] Property ${prop.code} marked as SOLD/RENTED`);
    }

    // 2. Sync Deal
    if (tx.dealId) {
        const deal = ALL_DEALS.find(d => d.id === tx.dealId);
        if (deal) {
            console.log(`[Sync] Deal ${deal.id} marked as WON`);
        }
    }

    // 3. Sync Customer
    const cus = MOCK_CUSTOMERS.find(c => c.id === tx.customerId);
    if (cus) {
        console.log(`[Sync] Customer ${cus.name} marked as PAID`);
    }
  }
};

export const updateTransactionStatus = (txId: string, status: TransactionStatus) => {
    const tx = transactions.find(t => t.id === txId);
    if (tx) {
        tx.status = status;
        tx.updatedAt = new Date().toISOString();
        syncStatusOnTransactionUpdate(tx);
        return true;
    }
    return false;
};