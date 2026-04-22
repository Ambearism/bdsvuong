
import { MOCK_CUSTOMERS, Customer } from './mockCustomers';
import { MOCK_CUSTOMER_RELATIONS, CustomerRelation } from './mockCustomerRelations';
import { MOCK_CUSTOMER_PROPERTY_LINKS, CustomerPropertyLink } from './mockCustomerPropertyLinks';
import { MOCK_PROPERTIES, Property } from './mockProperties';
import { ALL_LEADS, ALL_DEALS } from '../data'; 
import { Lead, Deal } from '../types';

export const getCustomerById = (id: string): Promise<Customer | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_CUSTOMERS.find(c => c.id === id));
    }, 400);
  });
};

export const getCustomerRelations = (customerId: string): Promise<{ relation: CustomerRelation, partner: Customer }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const relations = MOCK_CUSTOMER_RELATIONS
        .filter(r => r.customerAId === customerId || r.customerBId === customerId)
        .map(r => {
          const partnerId = r.customerAId === customerId ? r.customerBId : r.customerAId;
          const partner = MOCK_CUSTOMERS.find(c => c.id === partnerId);
          return partner ? { relation: r, partner } : null;
        })
        .filter(Boolean) as { relation: CustomerRelation, partner: Customer }[];
      resolve(relations);
    }, 400);
  });
};

export const getCustomerProperties = (customerId: string): Promise<{ link: CustomerPropertyLink, property: Property }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const links = MOCK_CUSTOMER_PROPERTY_LINKS
        .filter(l => l.customerId === customerId)
        .map(l => {
          const property = MOCK_PROPERTIES.find(p => p.id === l.propertyId);
          return property ? { link: l, property } : null;
        })
        .filter(Boolean) as { link: CustomerPropertyLink, property: Property }[];
      resolve(links);
    }, 400);
  });
};

export const getCustomerLeads = (customerId: string): Promise<Lead[]> => {
    // Mock mapping logic: Find leads where customer name matches (simple mock)
    // In real app, Lead would have customerId
    return new Promise(resolve => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
        if (!customer) return resolve([]);
        const leads = ALL_LEADS.filter(l => l.customerName === customer.name); // Simple name match for mock
        resolve(leads);
    });
};

export const getCustomerDeals = (customerId: string): Promise<Deal[]> => {
    return new Promise(resolve => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
        if (!customer) return resolve([]);
        // Using code for stricter match mock if available, or just filtering
        const deals = ALL_DEALS.filter(d => d.customerName === customer.name); 
        resolve(deals);
    });
};
