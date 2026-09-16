import { utils, writeFile } from "xlsx";

import type { AdHocReportRow, ResourceUtilisationRow, TimeEntryReportRow } from "../../store/selectors/reportSelectors";

export function exportFinanceTimeReport(rows: TimeEntryReportRow[], filename = "trax3ion-finance-time-report.xlsx"): void {
  const sheetRows = rows.map((row) => ({
    "Work Date": row.entry.workDate,
    Customer: row.customerName,
    Project: row.projectName,
    Phase: row.phaseName,
    Task: row.taskName,
    Action: row.actionName,
    Resource: row.resourceName,
    "Duration (h)": row.entry.durationHours,
    Description: row.entry.description ?? "",
    "Time Cat": row.timeType?.timeCat ?? "",
    "Time Tag": row.timeType?.timeTag ?? "",
    "Allocate Against Invoice": row.timeType?.allocateAgainstInvoice ? "YES" : "NO",
    "Allocate Against EST": row.timeType?.allocateAgainstEst ? "YES" : "NO",
    "SLT - Internal": row.timeType?.sltInternal ? "YES" : "NO",
    "Banked - Internal": row.timeType?.bankedInternal ? "YES" : "NO",
  }));

  const worksheet = utils.json_to_sheet(sheetRows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Finance Time Report");
  writeFile(workbook, filename);
}

export function exportUtilisationReport(rows: ResourceUtilisationRow[], weekLabel: string, filename = "trax3ion-utilisation-report.xlsx"): void {
  const sheetRows = rows.map((row) => ({
    Resource: row.resource.name,
    Week: weekLabel,
    "Booked Hours": row.bookedHours,
    "Ad-hoc Hours": row.adHocHours,
    "Available Hours": row.availableHours,
    "Utilisation %": row.percent,
  }));

  const worksheet = utils.json_to_sheet(sheetRows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Utilisation Report");
  writeFile(workbook, filename);
}

export function exportAdHocReport(rows: AdHocReportRow[], filename = "trax3ion-adhoc-work-report.xlsx"): void {
  const sheetRows = rows.map((row) => ({
    "Work Date": row.entry.workDate,
    "Start Time": row.entry.startTime ?? "",
    Resource: row.resourceName,
    Context: row.contextLabel,
    "Duration (h)": row.entry.durationHours,
    Description: row.entry.description,
    "Time Cat": row.timeType?.timeCat ?? "",
    "Time Tag": row.timeType?.timeTag ?? "",
    "Banked - Internal": row.timeType?.bankedInternal ? "YES" : "NO",
  }));

  const worksheet = utils.json_to_sheet(sheetRows);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Ad-hoc Work Report");
  writeFile(workbook, filename);
}
