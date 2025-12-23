import * as React from "react";
import { api } from "../../../services/api";
import type { BackendCategory, BackendService, PipelineConfigItem } from "../../../types";

export type ServiceActiveFilter = "all" | "active" | "inactive";

export function useServicesAndCategories(params: {
  categoryFilter: string;
  serviceActiveFilter: ServiceActiveFilter;
  setAdminMessage?: (msg: { type: "error" | "success"; text: string } | null) => void;
}) {
  const { categoryFilter, serviceActiveFilter, setAdminMessage } = params;

  const [services, setServices] = React.useState<BackendService[]>([]);
  const [categories, setCategories] = React.useState<BackendCategory[]>([]);

  const [servicesList, setServicesList] = React.useState<BackendService[]>([]);
  const [servicesListPage, setServicesListPage] = React.useState(1);
  const [servicesListHasNext, setServicesListHasNext] = React.useState(false);
  const [servicesListLoading, setServicesListLoading] = React.useState(false);
  const servicesListSentinelRef = React.useRef<HTMLDivElement | null>(null);

  const [serviceCategoryFilterOptions, setServiceCategoryFilterOptions] =
    React.useState<{ value: string; label: string }[]>([]);
  const [serviceActiveFilterOptions, setServiceActiveFilterOptions] =
    React.useState<{ value: string; label: string }[]>([]);

  // Modal/UI state that was previously in AdminDashboard
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");

  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] =
    React.useState<BackendService | null>(null);
  const [isServiceDetailLoading, setIsServiceDetailLoading] =
    React.useState(false);

  const [newService, setNewService] = React.useState<{
    service_id: string;
    name: string;
    description: string;
    price: number | string;
    categoryId: string;
    hsn: string;
    isPipeline: boolean;
    pipelineConfig: PipelineConfigItem[];
    platforms: string[];
    otherPlatform: string;
  }>({
    service_id: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    hsn: "",
    isPipeline: false,
    pipelineConfig: [{ prefix: "", count: 0 }],
    platforms: [],
    otherPlatform: "",
  });

  const [editingServiceId, setEditingServiceId] = React.useState<number | null>(
    null
  );

  const fetchServicesAndCategories = React.useCallback(async () => {
    try {
      const [servicesRes, fetchedCategories, dropdownsRes] = await Promise.all([
        api.services.list({ page: 1, page_size: 1000 }),
        api.categories.list(),
        api.services.dropdowns(),
      ]);

      const fetchedServices = Array.isArray(servicesRes)
        ? servicesRes
        : (servicesRes as any)?.results || [];

      setServices(fetchedServices as any);
      setCategories(fetchedCategories as any);

      const catOpts = (dropdownsRes as any)?.categories;
      if (Array.isArray(catOpts)) {
        setServiceCategoryFilterOptions([
          { value: "All", label: "All" },
          ...catOpts.map((c: any) => ({ value: c.name, label: c.name })),
        ]);
      } else {
        setServiceCategoryFilterOptions([{ value: "All", label: "All" }]);
      }

      const opts = (dropdownsRes as any)?.is_active;
      if (Array.isArray(opts) && opts.length > 0) {
        setServiceActiveFilterOptions(opts);
      } else {
        setServiceActiveFilterOptions([
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  }, []);

  const resetServicesList = React.useCallback(async () => {
    setServicesListLoading(true);
    try {
      const res: any = await api.services.list({
        page: 1,
        page_size: 20,
        category: categoryFilter,
        is_active: serviceActiveFilter,
      });

      const items = Array.isArray(res) ? res : res?.results || [];
      setServicesList(items);
      setServicesListPage(1);
      setServicesListHasNext(!!res?.next);
    } catch (e) {
      console.error("Failed to fetch services list", e);
    } finally {
      setServicesListLoading(false);
    }
  }, [categoryFilter, serviceActiveFilter]);

  const fetchMoreServicesList = React.useCallback(async () => {
    if (servicesListLoading || !servicesListHasNext) return;
    const nextPage = servicesListPage + 1;
    setServicesListLoading(true);
    try {
      const res: any = await api.services.list({
        page: nextPage,
        page_size: 20,
        category: categoryFilter,
        is_active: serviceActiveFilter,
      });
      const items = Array.isArray(res) ? res : res?.results || [];
      setServicesList((prev) => [...prev, ...items]);
      setServicesListPage(nextPage);
      setServicesListHasNext(!!res?.next);
    } catch (e) {
      console.error("Failed to fetch more services", e);
    } finally {
      setServicesListLoading(false);
    }
  }, [
    categoryFilter,
    serviceActiveFilter,
    servicesListHasNext,
    servicesListLoading,
    servicesListPage,
  ]);

  const openServiceDetail = React.useCallback(async (serviceId: number | string) => {
    setIsServiceDetailLoading(true);
    try {
      const existing = servicesList.find(
        (s) => String((s as any).id) === String(serviceId)
      );
      if (existing) setSelectedServiceDetail(existing);

      const full = await api.services.get(serviceId);
      setSelectedServiceDetail(full as any);
    } catch (e: any) {
      setAdminMessage?.({
        type: "error",
        text: e?.message || "Failed to load service details.",
      });
    } finally {
      setIsServiceDetailLoading(false);
    }
  }, [servicesList, setAdminMessage]);

  const deleteService = React.useCallback(async (id: number) => {
    if (!window.confirm("Delete service?")) return;
    try {
      await api.services.delete(id);
      setServicesList((prev) => prev.filter((s: any) => s.id !== id));
      await fetchServicesAndCategories();
      await resetServicesList();
    } catch (error: any) {
      setAdminMessage?.({ type: "error", text: error?.message || "Failed." });
    }
  }, [fetchServicesAndCategories, resetServicesList, setAdminMessage]);

  const handleAddCategory = React.useCallback(async () => {
    if (!newCategoryName.trim()) return;
    try {
      const slug = newCategoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      await api.categories.create({ name: newCategoryName, slug });
      await fetchServicesAndCategories();
      await resetServicesList();
      setNewCategoryName("");
    } catch (error: any) {
      setAdminMessage?.({ type: "error", text: error?.message || "Failed." });
    }
  }, [newCategoryName, fetchServicesAndCategories, resetServicesList, setAdminMessage]);

  const handleDeleteCategory = React.useCallback(async (id: number) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await api.categories.delete(id);
      setCategories((prev) => prev.filter((c: any) => c.id !== id));
      await fetchServicesAndCategories();
      await resetServicesList();
    } catch (error: any) {
      setAdminMessage?.({ type: "error", text: error?.message || "Failed." });
    }
  }, [fetchServicesAndCategories, resetServicesList, setAdminMessage]);

  const handleCategoryChange = React.useCallback(
    async (categoryId: string, editingServiceIdLocal: number | null) => {
      setNewService((p) => ({ ...p, categoryId, service_id: "" }));
      if (categoryId && !editingServiceIdLocal) {
        try {
          const res: any = await api.services.previewServiceId(
            parseInt(categoryId)
          );
          const next = res?.service_id ?? "";
          if (next) setNewService((p) => ({ ...p, service_id: String(next) }));
        } catch {
          // non-fatal
        }
      }
    },
    []
  );

  const handleAddService = React.useCallback(async () => {
    if (!newService.categoryId) {
      setAdminMessage?.({ type: "error", text: "Category is required." });
      return;
    }
    if (!newService.name.trim()) {
      setAdminMessage?.({ type: "error", text: "Service name is required." });
      return;
    }

    if (newService.isPipeline) {
      const selectedPlatforms = Array.isArray((newService as any).platforms)
        ? ((newService as any).platforms as string[])
        : [];
      if (selectedPlatforms.length === 0) {
        setAdminMessage?.({
          type: "error",
          text: "Select at least one platform.",
        });
        return;
      }
      if (
        selectedPlatforms.includes("other") &&
        !String((newService as any).otherPlatform || "").trim()
      ) {
        setAdminMessage?.({
          type: "error",
          text: "Type the platform name for Other.",
        });
        return;
      }
    }

    try {
      const payload: any = {
        name: newService.name,
        description: newService.description,
        price: Number(newService.price),
        category_id: parseInt(newService.categoryId),
        hsn: newService.hsn,
        is_active: true,
        is_pipeline: newService.isPipeline,
        pipeline_config: newService.isPipeline ? newService.pipelineConfig : [],
      };

      if (newService.isPipeline) {
        payload.platforms = (newService as any).platforms || [];
        payload.other_platform = (newService as any).otherPlatform || "";
      }

      if (editingServiceId) await api.services.update(editingServiceId, payload);
      else await api.services.create(payload);

      await fetchServicesAndCategories();
      await resetServicesList();
      setIsServiceModalOpen(false);
      setNewService({
        service_id: "",
        name: "",
        description: "",
        price: "",
        categoryId: "",
        hsn: "",
        isPipeline: false,
        pipelineConfig: [{ prefix: "", count: 0 } as any],
        platforms: [],
        otherPlatform: "",
      } as any);
      setEditingServiceId(null);
      setAdminMessage?.({
        type: "success",
        text: editingServiceId
          ? "Service updated successfully."
          : "Service created successfully.",
      });
    } catch (error: any) {
      setAdminMessage?.({ type: "error", text: error?.message || "Failed." });
    }
  }, [
    editingServiceId,
    fetchServicesAndCategories,
    newService,
    resetServicesList,
    setAdminMessage,
  ]);

  const handleEditService = React.useCallback((srv: BackendService) => {
    setNewService({
      service_id: (srv as any).service_id,
      name: (srv as any).name,
      description: (srv as any).description || "",
      price: (srv as any).price,
      categoryId: String((srv as any).category?.id ?? ""),
      hsn: (srv as any).hsn || "",
      isPipeline: !!(srv as any).is_pipeline,
      pipelineConfig:
        (srv as any).pipeline_config && (srv as any).pipeline_config.length > 0
          ? (srv as any).pipeline_config
          : [{ prefix: "", count: 1 }],
      platforms: (srv as any).platforms || [],
      otherPlatform: (srv as any).other_platform || "",
    } as any);
    setEditingServiceId((srv as any).id);
    setSelectedServiceDetail(null);
    setIsServiceModalOpen(true);
  }, []);

  const addPipelineRow = React.useCallback(() => {
    setNewService((prev) => ({
      ...prev,
      pipelineConfig: [...prev.pipelineConfig, { prefix: "", count: 1 } as any],
    }));
  }, []);

  const removePipelineRow = React.useCallback((index: number) => {
    setNewService((prev) => {
      const newCfg = [...prev.pipelineConfig];
      newCfg.splice(index, 1);
      return { ...prev, pipelineConfig: newCfg };
    });
  }, []);

  const updatePipelineRow = React.useCallback(
    (index: number, field: "prefix" | "count", value: string | number) => {
      setNewService((prev) => {
        const newCfg = [...prev.pipelineConfig];
        (newCfg as any)[index] = { ...(newCfg as any)[index], [field]: value };
        return { ...prev, pipelineConfig: newCfg };
      });
    },
    []
  );

  const filteredServices = React.useMemo(() => {
    return (servicesList as any[]).filter((srv: any) => {
      const matchesCategory =
        categoryFilter === "All" ||
        String(srv?.category?.name || "") === String(categoryFilter);
      return matchesCategory;
    });
  }, [servicesList, categoryFilter]);

  return {
    // Raw data
    services,
    categories,

    // list + infinite scroll
    servicesList,
    servicesListPage,
    servicesListHasNext,
    servicesListLoading,
    servicesListSentinelRef,

    // filters
    serviceCategoryFilterOptions,
    serviceActiveFilterOptions,
    filteredServices,

    // modal + forms
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,

    isServiceModalOpen,
    setIsServiceModalOpen,
    selectedServiceDetail,
    setSelectedServiceDetail,
    isServiceDetailLoading,

    newService,
    setNewService,
    editingServiceId,
    setEditingServiceId,

    // actions
    fetchServicesAndCategories,
    resetServicesList,
    fetchMoreServicesList,
    openServiceDetail,
    deleteService,
    handleAddCategory,
    handleDeleteCategory,
    handleCategoryChange,
    handleAddService,
    handleEditService,
    addPipelineRow,
    removePipelineRow,
    updatePipelineRow,
  };
}
