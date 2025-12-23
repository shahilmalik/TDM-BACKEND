import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { api, mapBackendColumnToStatus, mapStatusToBackendColumn } from "../../../services/api";
import { connectEventsSocket } from "../../../services/eventsSocket";
import type { PipelinePost, PipelineStatus } from "../../../types";

export function usePipeline(params: {
  activeTab: string;
  selectedPipelineClient: string;
  setAdminMessage?: (m: { type: "success" | "error"; text: string }) => void;
}) {
  const { activeTab, selectedPipelineClient } = params;

  const [pipelineData, setPipelineData] = useState<Record<string, PipelinePost[]>>({});
  const [draggedPostId, setDraggedPostId] = useState<string | number | null>(null);
  const [openContentItemId, setOpenContentItemId] = useState<string | number | null>(null);

  const fetchPipeline = useCallback(async () => {
    try {
      const kanbanItems = await api.kanban.list();
      const grouped: Record<string, PipelinePost[]> = {};

      (kanbanItems || []).forEach((item: any) => {
        const clientId = item?.client?.id ?? item?.client_id ?? item?.client ?? null;
        if (!clientId) return;
        const key = String(clientId);

        const post: PipelinePost = {
          id: item.id,
          title: item.title,
          platform: item.platforms?.[0] || "instagram",
          platforms: Array.isArray(item.platforms) ? item.platforms : undefined,
          priority: item.priority || undefined,
          unread_comments_count: Number(item.unread_comments_count ?? 0),
          status: mapBackendColumnToStatus(item.column),
          dueDate: item.due_date || "",
          creative_copy: item.creative_copy || "",
          post_caption: item.post_caption || "",
          description: item.creative_copy ?? item.description ?? "",
          caption: item.post_caption ?? item.caption ?? "",
          thumbnail: item.thumbnail,
          media_assets: Array.isArray(item.media_assets) ? item.media_assets : undefined,
          client: item.client
            ? {
                id: item.client.id,
                first_name: item.client.first_name,
                last_name: item.client.last_name,
              }
            : undefined,
          assigned_to: item.assigned_to
            ? {
                first_name: item.assigned_to.first_name,
                last_name: item.assigned_to.last_name,
                ...(item.assigned_to.id ? { id: item.assigned_to.id } : {}),
              }
            : null,
        };

        grouped[key] = [...(grouped[key] || []), post];
      });

      setPipelineData({ ...grouped });
    } catch (e) {
      console.error("Failed to fetch pipeline", e);
    }
  }, []);

  const handleScheduleById = useCallback(
    async (postId: string | number, scheduledAtIso: string) => {
      if (!selectedPipelineClient) return;

      setPipelineData((prev) => {
        const next = { ...prev };
        const list = next[selectedPipelineClient] || [];
        next[selectedPipelineClient] = list.map((p) =>
          p.id === postId ? { ...p, status: "scheduled" } : p
        );
        return next;
      });

      try {
        await api.kanban.schedule(postId as number, scheduledAtIso);
      } catch (e) {
        console.error(e);
      }
    },
    [selectedPipelineClient]
  );

  const handlePipelineDragStart = useCallback(
    (e: React.DragEvent, postId: string | number) => {
      setDraggedPostId(postId);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handlePipelineDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handlePipelineDrop = useCallback(
    async (e: React.DragEvent, status: PipelineStatus) => {
      e.preventDefault();
      if (!draggedPostId || !selectedPipelineClient) return;

      setPipelineData((prev) => ({
        ...prev,
        [selectedPipelineClient]: (prev[selectedPipelineClient] || []).map((post) =>
          post.id === draggedPostId ? { ...post, status } : post
        ),
      }));

      try {
        await api.kanban.move(Number(draggedPostId), mapStatusToBackendColumn(status));
      } catch (e2) {
        console.error("Failed to move item", e2);
      }

      setDraggedPostId(null);
    },
    [draggedPostId, selectedPipelineClient]
  );

  // WebSocket live updates
  useEffect(() => {
    if (localStorage.getItem("demoMode")) return;
    if (activeTab !== "pipeline") return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;
    if (!selectedPipelineClient) return;

    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        fetchPipeline();
      }, 250);
    };

    const disconnect = connectEventsSocket({
      token,
      clientId: selectedPipelineClient,
      onEvent: (msg) => {
        const evt = String(msg?.event || "");
        if (
          evt === "comment_added" ||
          evt === "content_item_status_changed" ||
          evt === "content_item_updated" ||
          evt === "invoice_item_recorded" ||
          evt === "invoice_status_changed"
        ) {
          scheduleRefresh();
        }
      },
    });

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer);
      disconnect();
    };
  }, [activeTab, fetchPipeline, selectedPipelineClient]);

  return {
    pipelineData,
    setPipelineData,

    openContentItemId,
    setOpenContentItemId,

    fetchPipeline,
    handleScheduleById,

    handlePipelineDragStart,
    handlePipelineDragOver,
    handlePipelineDrop,

    draggedPostId,
    setDraggedPostId,
  };
}
