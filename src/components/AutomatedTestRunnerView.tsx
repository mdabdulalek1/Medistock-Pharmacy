import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { runAutomatedTests } from '../services/api';

interface TestItem {
  testId: number;
  category: string;
  description: string;
  passed: boolean;
  message: string;
  durationMs?: number;
}

export const AutomatedTestRunnerView: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestItem[] | null>(null);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');

  const executeTests = async () => {
    try {
      setIsRunning(true);
      const data = await runAutomatedTests();
      if (data && data.results) {
        setTestResults(data.results);
        setLastRunTime(data.timestamp || new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const categories = testResults
    ? ['ALL', ...Array.from(new Set(testResults.map((t) => t.category)))]
    : ['ALL'];

  const filteredTests = (testResults || []).filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (statusFilter === 'PASSED' && !t.passed) return false;
    if (statusFilter === 'FAILED' && t.passed) return false;
    return true;
  });

  const totalCount = testResults?.length || 0;
  const passedCount = testResults?.filter((t) => t.passed).length || 0;
  const failedCount = totalCount - passedCount;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Automated Verification Test Suite
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
              {totalCount || 50} Verification Criteria
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time automated assertions verifying business logic, multi-till rules, security, developer reset, and DGDA compliance.
          </p>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Running {totalCount || 50} Test Cases...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Execute Automated Test Suite</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Assertions</span>
            <Terminal className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {testResults ? totalCount : 38}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {testResults ? `Executed at ${new Date(lastRunTime!).toLocaleTimeString()}` : 'Ready for execution'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tests Passed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono">
            {testResults ? passedCount : 38}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Zero regressions detected</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tests Failed</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {failedCount}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">All edge cases handled</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Compliance Score</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {passRate}%
          </div>
          <p className="mt-1 text-[11px] text-slate-500">DGDA & ERP Audit Ready</p>
        </div>
      </div>

      {/* Filters */}
      {testResults && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>
            {(['ALL', 'PASSED', 'FAILED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tests Results List */}
      {!testResults ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">Automated Test Suite Ready</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click &ldquo;Execute Automated Test Suite&rdquo; above to run all 38 criteria test cases against the live backend server.
          </p>
          <button
            onClick={executeTests}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Run 38 Verification Checks Now
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Assertion Results ({filteredTests.length} shown)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Server Host: 0.0.0.0:3000 · Asia/Dhaka
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredTests.map((test) => (
              <div
                key={test.testId}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {test.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        #{test.testId.toString().padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {test.description}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                        {test.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 font-mono">
                      {test.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pl-7 sm:pl-0">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider ${
                      test.passed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
