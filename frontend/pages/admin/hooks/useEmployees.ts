import { useCallback, useRef, useState } from "react";
import { api } from "../../../services/api";
import { AdminEmployee } from "../../../types";

type AdminMessage = { type: "success" | "error"; text: string };

type EmployeeFormState = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

export function useEmployees(params: {
  setAdminMessage: (m: AdminMessage) => void;
}) {
  const { setAdminMessage } = params;

  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [employeesHasNext, setEmployeesHasNext] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const employeesSentinelRef = useRef<HTMLDivElement | null>(null);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>({
    salutation: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "manager",
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | number | null>(
    null
  );

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const res: any = await api.employee.list({ page: 1, page_size: 20 });
      const data = Array.isArray(res) ? res : res?.results || [];
      const mapped = data.map((e: any) => ({
        id: e.id,
        name: `${e.salutation} ${e.first_name} ${e.last_name}`.trim(),
        email: e.email,
        phone: e.phone,
        role: e.type,
      }));
      setEmployees(mapped);
      setEmployeesPage(1);
      setEmployeesHasNext(!!res?.next);
    } catch (e) {
      console.error("Failed to fetch employees", e);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  const fetchMoreEmployees = useCallback(async () => {
    if (employeesLoading || !employeesHasNext) return;
    const nextPage = employeesPage + 1;
    setEmployeesLoading(true);
    try {
      const res: any = await api.employee.list({ page: nextPage, page_size: 20 });
      const data = Array.isArray(res) ? res : res?.results || [];
      const mapped = data.map((e: any) => ({
        id: e.id,
        name: `${e.salutation} ${e.first_name} ${e.last_name}`.trim(),
        email: e.email,
        phone: e.phone,
        role: e.type,
      }));
      setEmployees((prev) => [...prev, ...mapped]);
      setEmployeesPage(nextPage);
      setEmployeesHasNext(!!res?.next);
    } catch (e) {
      console.error("Failed to fetch more employees", e);
    } finally {
      setEmployeesLoading(false);
    }
  }, [employeesHasNext, employeesLoading, employeesPage]);

  const openCreateEmployeeModal = useCallback(() => {
    setEditingEmployeeId(null);
    setEmployeeForm({
      salutation: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "manager",
    });
    setIsEmployeeModalOpen(true);
  }, []);

  const openEditEmployeeModal = useCallback((emp: any) => {
    setEditingEmployeeId((emp as any)?.id ?? null);
    const fullName = String((emp as any)?.name || "").trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = (emp as any)?.firstName || parts[1] || parts[0] || "";
    const lastName = (emp as any)?.lastName || parts.slice(2).join(" ") || "";
    setEmployeeForm({
      salutation: (emp as any)?.salutation || parts[0] || "Mr",
      firstName,
      lastName,
      email: (emp as any)?.email || "",
      phone: (emp as any)?.phone || "",
      role: (emp as any)?.role || "manager",
    });
    setIsEmployeeModalOpen(true);
  }, []);

  const handleSaveEmployee = useCallback(async () => {
    try {
      const payload: any = {
        salutation: employeeForm.salutation,
        first_name: employeeForm.firstName,
        last_name: employeeForm.lastName,
        email: employeeForm.email,
        phone: employeeForm.phone,
        type: employeeForm.role,
      };

      if (editingEmployeeId) {
        await api.employee.update(editingEmployeeId, payload);
      } else {
        await api.employee.create(payload);
      }

      setIsEmployeeModalOpen(false);
      setEditingEmployeeId(null);
      setAdminMessage({
        type: "success",
        text: editingEmployeeId ? "Employee updated." : "Employee created.",
      });
      await fetchEmployees();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  }, [editingEmployeeId, employeeForm, fetchEmployees, setAdminMessage]);

  const handleDeleteEmployee = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this employee?")) return;
      try {
        await api.employee.delete(id);
        setAdminMessage({ type: "success", text: "Employee deleted." });
        await fetchEmployees();
      } catch (e: any) {
        setAdminMessage({ type: "error", text: e?.message || "Failed." });
      }
    },
    [fetchEmployees, setAdminMessage]
  );

  return {
    employees,
    employeesPage,
    employeesHasNext,
    employeesLoading,
    employeesSentinelRef,

    isEmployeeModalOpen,
    setIsEmployeeModalOpen,
    employeeForm,
    setEmployeeForm,
    editingEmployeeId,
    setEditingEmployeeId,

    fetchEmployees,
    fetchMoreEmployees,

    openCreateEmployeeModal,
    openEditEmployeeModal,

    handleSaveEmployee,
    handleDeleteEmployee,
  };
}
