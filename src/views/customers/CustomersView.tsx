import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { useCanEdit } from "../../store/authStore";
import { useTraxionDemoStore } from "../../store/useTraxionDemoStore";
import CustomerFormModal from "./components/CustomerFormModal";
import CustomerTable from "./components/CustomerTable";

export default function CustomersView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();
  const canEdit = useCanEdit();

  const customers = useTraxionDemoStore((state) => state.customers);
  const projects = useTraxionDemoStore((state) => state.projects);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Every customer relationship, with a roll-up of their projects."
        actions={
          canEdit ? (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              New Customer
            </button>
          ) : undefined
        }
      />

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Create your first customer to start building projects." />
      ) : (
        <CustomerTable customers={customers} projects={projects} />
      )}

      {isCreateOpen ? (
        <CustomerFormModal onClose={() => setIsCreateOpen(false)} onCreated={(customerId) => navigate(`/customers/${customerId}`)} />
      ) : null}
    </div>
  );
}
