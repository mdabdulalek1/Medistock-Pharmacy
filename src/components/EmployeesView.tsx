import React from 'react';
import { User, Branch, AuditLogEntry } from '../types/pharmacy';
import { formatDateTime } from '../utils/formatters';
import { Users, ShieldCheck, Building2, UserCheck, Activity } from 'lucide-react';

interface EmployeesViewProps {
  users: User[];
  branches: Branch[];
  auditLogs: AuditLogEntry[];
  currentUser: User;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  users,
  branches,
  auditLogs,
  currentUser,
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Business Owner';
      case 'admin':
        return 'System Administrator';
      case 'branch_manager':
        return 'Branch Manager';
      case 'pharmacist':
        return 'A-Grade Registered Pharmacist';
      case 'cashier':
        return 'Sales & Billing Cashier';
      case 'inventory_manager':
        return 'Stock & Procurement Manager';
      case 'customer':
        return 'Registered Customer';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-[#17365D]">
          Staff Directory & Role-Based Access Control (RBAC)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Authorized personnel profiles · Pharmacy Council of Bangladesh licenses · System audit logs
        </p>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const branch = branches.find((b) => b.id === user.branchId);

          return (
            <div
              key={user.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                  <div className="text-xs text-slate-500 font-medium">
                    {getRoleLabel(user.role)}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold text-[#17365D] bg-[#E7F6F6] px-2 py-0.5 rounded">
                  {user.role.toUpperCase()}
                </span>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg text-slate-600">
                <div>
                  <span className="text-slate-400">Assigned Branch: </span>
                  <span className="font-semibold text-slate-800">
                    {branch ? branch.name : user.branchName || 'All Branches (Global)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Phone: </span>
                  <span className="font-mono text-slate-800">{user.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400">Email: </span>
                  <span className="text-slate-800">{user.email}</span>
                </div>
                {user.registrationNumber && (
                  <div>
                    <span className="text-slate-400">Govt/PCB Reg License: </span>
                    <span className="font-mono text-slate-800 font-semibold">{user.registrationNumber}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Audit Trail Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="border-b border-slate-200 px-6 py-3.5 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#168C8C]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Immutable Action Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Real-time security logs</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-600 bg-white sticky top-0">
              <tr>
                <th className="px-6 py-3 font-semibold">Timestamp (BD)</th>
                <th className="px-6 py-3 font-semibold">Staff Name</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Entity & ID</th>
                <th className="px-6 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">{log.userName}</td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-[11px] text-slate-600 uppercase font-semibold">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono text-[11px] font-bold text-slate-800">
                    {log.action}
                  </td>
                  <td className="px-6 py-3 font-mono text-[11px] text-slate-600">
                    {log.entity}: {log.entityId}
                  </td>
                  <td className="px-6 py-3 text-slate-700 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
