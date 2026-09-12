import type { StateCreator } from "zustand";

import type { Customer, EntityStatus } from "../../types/domain";
import type { DemoStore } from "../useTraxionDemoStore";
import type { MutationResult, UpdateResult } from "./types";

export type CustomerSlice = {
  customers: Customer[];
  createCustomer: (input: { name: string; status?: EntityStatus }) => MutationResult;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id">>) => UpdateResult;
  getCustomerById: (id: string) => Customer | undefined;
};

export const createCustomerSlice: StateCreator<DemoStore, [], [], CustomerSlice> = (set, get) => ({
  customers: [],

  createCustomer: (input) => {
    const name = input.name.trim();
    if (!name) {
      return { ok: false, error: "Customer Name is required." };
    }

    const customer: Customer = {
      id: crypto.randomUUID(),
      name,
      status: input.status ?? "active",
    };

    set((state) => ({ customers: [...state.customers, customer] }));
    return { ok: true, id: customer.id };
  },

  updateCustomer: (id, patch) => {
    const exists = get().customers.some((customer) => customer.id === id);
    if (!exists) {
      return { ok: false, error: "Customer not found." };
    }

    set((state) => ({
      customers: state.customers.map((customer) => (customer.id === id ? { ...customer, ...patch } : customer)),
    }));
    return { ok: true };
  },

  getCustomerById: (id) => get().customers.find((customer) => customer.id === id),
});
