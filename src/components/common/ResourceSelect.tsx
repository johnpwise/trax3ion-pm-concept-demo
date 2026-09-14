import { ChevronDown } from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Resource } from "../../types/domain";
import { RESOURCE_SELECT_TEST_IDS } from "./ResourceSelect.testIds";

type ResourceSelectProps = {
  resources: Resource[];
  value?: string;
  onChange?: (resourceId: string | undefined) => void;
  placeholder?: string;
};

type PanelPosition = { top?: number; bottom?: number; left: number; width: number; maxHeight: number };

export default function ResourceSelect({ resources, value, onChange, placeholder = "Unassigned" }: ResourceSelectProps) {
  const selectedResource = resources.find((resource) => resource.id === value);

  if (!onChange) {
    return (
      <span className={`block truncate text-sm ${selectedResource ? "text-surface-foreground" : "text-muted-foreground"}`}>
        {selectedResource?.name ?? placeholder}
      </span>
    );
  }

  return <InteractiveResourceSelect resources={resources} value={value} onChange={onChange} placeholder={placeholder} />;
}

function InteractiveResourceSelect({
  resources,
  value,
  onChange,
  placeholder,
}: Required<Pick<ResourceSelectProps, "resources" | "onChange" | "placeholder">> & Pick<ResourceSelectProps, "value">) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedResource = resources.find((resource) => resource.id === value);

  const assignableResources = resources
    .filter((resource) => resource.status === "active")
    .sort((a, b) => Number(Boolean(b.isCurrentUser)) - Number(Boolean(a.isCurrentUser)));

  const filteredResources = assignableResources.filter((resource) => resource.name.toLowerCase().includes(query.trim().toLowerCase()));

  const options: Array<{ id: string | undefined; label: string; sublabel?: string }> = [
    { id: undefined, label: "Unassigned" },
    ...filteredResources.map((resource) => ({
      id: resource.id,
      label: resource.name + (resource.isCurrentUser ? " (you)" : ""),
      sublabel: resource.role,
    })),
  ];

  const close = useCallback((): void => {
    setIsOpen(false);
    setPanelPosition(null);
  }, []);

  const select = (resourceId: string | undefined): void => {
    onChange(resourceId);
    close();
  };

  const open = (): void => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const margin = 8;
    const preferredHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    const left = rect.left;
    const width = Math.max(rect.width, 240);

    if (spaceBelow >= preferredHeight || spaceBelow >= spaceAbove) {
      setPanelPosition({ top: rect.bottom + 4, left, width, maxHeight: Math.max(spaceBelow, 120) });
    } else {
      setPanelPosition({ bottom: window.innerHeight - rect.top + 4, left, width, maxHeight: Math.max(spaceAbove, 120) });
    }

    setQuery("");
    setHighlightedIndex(0);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };
    const handleScroll = (event: Event): void => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    const handleResize = (): void => close();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, close]);

  const handleQueryChange = (nextQuery: string): void => {
    setQuery(nextQuery);
    setHighlightedIndex(0);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const highlighted = options[highlightedIndex];
      if (highlighted) select(highlighted.id);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-id={RESOURCE_SELECT_TEST_IDS.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          if (isOpen) close();
          else open();
        }}
        onKeyDown={(event) => event.stopPropagation()}
        className="flex w-full items-center justify-between gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-left text-sm shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className={`truncate ${selectedResource ? "text-surface-foreground" : "text-muted-foreground"}`}>
          {selectedResource?.name ?? placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              role="listbox"
              data-id={RESOURCE_SELECT_TEST_IDS.panel}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              style={{
                position: "fixed",
                top: panelPosition.top,
                bottom: panelPosition.bottom,
                left: panelPosition.left,
                width: panelPosition.width,
                maxHeight: panelPosition.maxHeight,
              }}
              className="z-50 flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-lg"
            >
              <input
                ref={inputRef}
                type="text"
                data-id={RESOURCE_SELECT_TEST_IDS.search}
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search resources…"
                className="block w-full shrink-0 border-b border-border bg-surface px-2.5 py-2 text-sm text-surface-foreground focus-visible:outline-none"
              />
              <ul className="min-h-0 flex-1 overflow-y-auto py-1">
                {options.map((option, index) => (
                  <li key={option.id ?? "unassigned"}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={option.id === value}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={(event) => {
                        event.stopPropagation();
                        select(option.id);
                      }}
                      className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-sm transition-colors ${
                        index === highlightedIndex ? "bg-muted" : ""
                      } ${option.id === value ? "text-primary" : "text-surface-foreground"}`}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.sublabel ? <span className="shrink-0 truncate text-xs text-muted-foreground">{option.sublabel}</span> : null}
                    </button>
                  </li>
                ))}
                {query.trim() && filteredResources.length === 0 ? (
                  <li className="px-2.5 py-1.5 text-sm text-muted-foreground">No resources match &ldquo;{query}&rdquo;.</li>
                ) : null}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
