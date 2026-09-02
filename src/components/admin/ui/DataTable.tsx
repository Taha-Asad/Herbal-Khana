// components/admin/ui/DataTable.tsx
"use client";

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Loader2,
  LucideIcon,
} from "lucide-react";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sortable?: boolean;
  onSort?: (key: string, order: "asc" | "desc") => void;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: {
      label: string;
      href?: string;
      onClick?: () => void;
    };
  };
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  pagination,
  sortable = false,
  onSort,
  emptyState,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(keyExtractor));
      onSelectionChange?.(allIds);
    } else {
      onSelectionChange?.(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    onSelectionChange?.(newSelected);
  };

  const allSelected =
    data.length > 0 &&
    data.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected = data.some((item) => selectedIds.has(keyExtractor(item)));

  const getSortIcon = (key: string) => {
    if (sortKey !== key)
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-amber-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-amber-600" />
    );
  };

  const getColumnValue = (item: T, key: string): React.ReactNode => {
    const keys = key.split(".");
    let value: unknown = item;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return "—";
      }
    }
    return String(value ?? "—");
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : data.length === 0 ? (
        emptyState ? (
          <EmptyState {...emptyState} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available
          </div>
        )
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {selectable && (
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el)
                            el.indeterminate = someSelected && !allSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 
                          focus:ring-amber-500"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 
                        uppercase tracking-wider ${column.className || ""}`}
                    >
                      {column.sortable && sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                          {column.header}
                          {getSortIcon(column.key)}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item, index) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.has(id);

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-amber-50" : ""
                      }`}
                    >
                      {selectable && (
                        <td className="px-4 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectItem(id, e.target.checked)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-amber-600 
                              focus:ring-amber-500"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-4 py-4 ${column.className || ""}`}
                        >
                          {column.render
                            ? column.render(item, index)
                            : getColumnValue(item, column.key)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
