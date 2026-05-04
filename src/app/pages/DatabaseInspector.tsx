import { useEffect, useState } from "react";
import { Database, TableProperties, RefreshCw } from "lucide-react";

type ColumnInfo = {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
};

type TableInfo = {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
  preview: Record<string, unknown>[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export default function DatabaseInspector() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInspector = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/internal/db-inspector-7f3a9c`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar o inspetor do banco.");
      }

      const payload = (await response.json()) as TableInfo[];
      setTables(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o inspetor do banco.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInspector();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_38%,#e2e8f0_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-lg">
                <Database className="size-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Rota Interna
                </p>
                <h1 className="mt-1 text-3xl text-[#0F172A]">Inspetor Visual do Banco</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Visualização rápida das tabelas do SQLite com estrutura e amostra dos registros.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadInspector}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-[28px] border border-slate-200 bg-white/80 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {tables.map((table) => {
              const previewColumns =
                table.preview[0] ? Object.keys(table.preview[0]) : table.columns.map((column) => column.name);

              return (
                <section
                  key={table.name}
                  className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-lg backdrop-blur"
                >
                  <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <TableProperties className="size-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-[#0F172A]">{table.name}</h2>
                          <p className="text-sm text-slate-500">
                            {table.rowCount} registro(s) • {table.columns.length} coluna(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Estrutura
                      </p>
                      <div className="space-y-3">
                        {table.columns.map((column) => (
                          <div key={`${table.name}-${column.name}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-[#0F172A]">{column.name}</span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                {column.type || "TEXT"}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                              {column.primaryKey && (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                                  PK
                                </span>
                              )}
                              <span className="rounded-full bg-slate-100 px-2 py-1">
                                {column.nullable ? "Aceita nulo" : "Obrigatória"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Preview dos Registros
                        </p>
                      </div>

                      {table.preview.length === 0 ? (
                        <div className="px-4 py-8 text-sm text-slate-500">
                          Nenhum registro encontrado nesta tabela.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                              <tr>
                                {previewColumns.map((column) => (
                                  <th key={column} className="px-4 py-3 font-medium">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.preview.map((row, rowIndex) => (
                                <tr key={`${table.name}-row-${rowIndex}`} className="border-t border-slate-100 align-top">
                                  {previewColumns.map((column) => (
                                    <td key={`${table.name}-${rowIndex}-${column}`} className="max-w-[280px] px-4 py-3 text-slate-700">
                                      <div className="line-clamp-3 break-words">
                                        {formatValue(row[column])}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}
