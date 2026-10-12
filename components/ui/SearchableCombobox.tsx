"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  GraduationCap,
  Search,
  X,
} from "lucide-react";

export type SubjectComboboxOption = {
  id: string;
  code: string;
  name: string;
};

export type FacultyComboboxOption = {
  id: string;
  name: string;
  department: string;
};

type CommonComboboxProps<TOption> = {
  options: readonly TOption[];
  selectedId: string;
  onSelect: (option: TOption | null) => void;
  getOptionId: (option: TOption) => string;
  matchesSearch: (option: TOption, query: string) => boolean;
  renderSelected: (option: TOption) => ReactNode;
  renderOption: (option: TOption) => ReactNode;
  emptyMessage: string;
  noResultsMessage: (query: string) => string;
  icon: ReactNode;
  required?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  label?: string;
  id?: string;
};

function SearchableCombobox<TOption>({
  options,
  selectedId,
  onSelect,
  getOptionId,
  matchesSearch,
  renderSelected,
  renderOption,
  emptyMessage,
  noResultsMessage,
  icon,
  required = false,
  placeholder,
  searchPlaceholder,
  label,
  id,
}: CommonComboboxProps<TOption>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(
    (option) => getOptionId(option) === selectedId,
  );

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((option) => matchesSearch(option, query));
  }, [matchesSearch, options, searchTerm]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 50);

    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-semibold text-slate-700"
        >
          {label} {required ? <span className="text-rose-500">*</span> : null}
        </label>
      ) : null}

      <input
        id={inputId}
        type="text"
        required={required}
        value={selectedId}
        readOnly
        className="sr-only"
        tabIndex={-1}
      />

      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          setSearchTerm("");
          setIsOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSearchTerm("");
            setIsOpen((current) => !current);
          }
        }}
        className="flex min-h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-xs transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
      >
        <span className="mr-2 flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-blue-800">{icon}</span>
          {selectedOption ? (
            renderSelected(selectedOption)
          ) : (
            <span className="truncate text-slate-400">{placeholder}</span>
          )}
        </span>
        <span className="ml-1 flex shrink-0 items-center gap-1">
          {selectedOption ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelect(null);
              }}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {isOpen ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-xs shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 p-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
            <span className="whitespace-nowrap text-[10px] font-medium text-slate-500">
              {filteredOptions.length} of {options.length}
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                {options.length === 0 ? emptyMessage : noResultsMessage(searchTerm)}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionId = getOptionId(option);
                const isSelected = optionId === selectedId;

                return (
                  <button
                    key={optionId}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between border-b border-slate-100 p-3 text-left transition last:border-b-0 hover:bg-blue-50 ${
                      isSelected ? "bg-blue-50 font-semibold" : ""
                    }`}
                  >
                    {renderOption(option)}
                    {isSelected ? (
                      <Check className="ml-2 h-4 w-4 shrink-0 text-blue-700" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type SearchableSubjectComboboxProps = {
  subjects: readonly SubjectComboboxOption[];
  selectedSubjectId: string;
  onSelect: (subject: SubjectComboboxOption | null) => void;
  required?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
};

export function SearchableSubjectCombobox({
  subjects,
  selectedSubjectId,
  onSelect,
  required,
  placeholder = "Search by subject code or name...",
  label,
  id,
}: SearchableSubjectComboboxProps) {
  return (
    <SearchableCombobox
      options={subjects}
      selectedId={selectedSubjectId}
      onSelect={onSelect}
      getOptionId={(subject) => subject.id}
      matchesSearch={(subject, query) =>
        subject.code.toLowerCase().includes(query) ||
        subject.name.toLowerCase().includes(query)
      }
      renderSelected={(subject) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-blue-900">
            {subject.code}
          </span>
          <span className="truncate font-medium text-slate-900">
            {subject.name}
          </span>
        </span>
      )}
      renderOption={(subject) => (
        <span className="mr-2 flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-blue-900">
            {subject.code}
          </span>
          <span className="truncate text-slate-900">{subject.name}</span>
        </span>
      )}
      emptyMessage="No subjects registered yet."
      noResultsMessage={(query) => `No subjects match "${query}".`}
      icon={<BookOpen className="h-4 w-4" />}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Type code or title..."
      label={label}
      id={id}
    />
  );
}

type SearchableFacultyComboboxProps = {
  facultyList: readonly FacultyComboboxOption[];
  selectedFacultyId: string;
  onSelect: (faculty: FacultyComboboxOption | null) => void;
  required?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
};

export function SearchableFacultyCombobox({
  facultyList,
  selectedFacultyId,
  onSelect,
  required,
  placeholder = "Search by faculty name or department...",
  label,
  id,
}: SearchableFacultyComboboxProps) {
  return (
    <SearchableCombobox
      options={facultyList}
      selectedId={selectedFacultyId}
      onSelect={onSelect}
      getOptionId={(faculty) => faculty.id}
      matchesSearch={(faculty, query) =>
        faculty.name.toLowerCase().includes(query) ||
        faculty.department.toLowerCase().includes(query)
      }
      renderSelected={(faculty) => (
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-semibold text-slate-900">
            {faculty.name}
          </span>
          <span className="max-w-36 truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
            {faculty.department}
          </span>
        </span>
      )}
      renderOption={(faculty) => (
        <span className="mr-2 min-w-0">
          <span className="block truncate font-semibold text-slate-900">
            {faculty.name}
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] text-slate-500">
            <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">{faculty.department}</span>
          </span>
        </span>
      )}
      emptyMessage="No faculty registered yet."
      noResultsMessage={(query) =>
        `No faculty match "${query}". Try another name or department.`
      }
      icon={<GraduationCap className="h-4 w-4" />}
      required={required}
      placeholder={placeholder}
      searchPlaceholder="Type faculty name or department..."
      label={label}
      id={id}
    />
  );
}
