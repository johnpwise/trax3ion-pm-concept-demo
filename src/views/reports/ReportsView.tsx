import { useSearchParams } from "react-router-dom";

import PageHeader from "../../app/PageHeader";
import FinanceTimeReport from "./components/FinanceTimeReport";
import UtilisationReport from "./components/UtilisationReport";

const TABS = [
  { value: "finance", label: "Finance Time Report" },
  { value: "utilisation", label: "Utilisation Report" },
] as const;

type ReportTab = (typeof TABS)[number]["value"];

function parseTab(value: string | null): ReportTab {
  return value === "utilisation" ? "utilisation" : "finance";
}

export default function ReportsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  return (
    <div>
      <PageHeader title="Reports" description="Finance and resource-utilisation reporting, exportable to Excel.">
        <div className="mt-4 inline-flex rounded-lg border border-border bg-surface p-1" role="tablist" aria-label="Report type">
          {TABS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={tab === option.value}
              onClick={() => setSearchParams(option.value === "finance" ? {} : { tab: option.value })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === option.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-surface-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {tab === "finance" ? <FinanceTimeReport /> : <UtilisationReport />}
    </div>
  );
}
