import { useCallback, useState } from "react";
import { api } from "../../../services/api";
import { MetaPage } from "../../../types";

type AdminMessage = { type: "success" | "error"; text: string };

type Params = {
  setAdminMessage: (m: AdminMessage) => void;
};

export function useClientMetaSync({ setAdminMessage }: Params) {
  const [metaPages, setMetaPages] = useState<MetaPage[]>([]);
  const [selectedClientMetaPageId, setSelectedClientMetaPageId] =
    useState<string>("");
  const [isMetaSyncLoading, setIsMetaSyncLoading] = useState(false);

  const loadMetaPages = useCallback(async () => {
    try {
      const pageRes = await api.meta.listPages();
      setMetaPages(pageRes?.pages || []);
    } catch {
      // non-fatal
      setMetaPages([]);
    }
  }, []);

  const syncClientMetaPage = useCallback(
    async (clientId: number | string) => {
      if (!selectedClientMetaPageId) {
        setAdminMessage({
          type: "error",
          text: "Please select a Meta account/page to sync.",
        });
        return;
      }

      setIsMetaSyncLoading(true);
      try {
        await api.meta.syncClientPage({
          client_id: Number(clientId),
          fb_page_id: selectedClientMetaPageId,
        });
        setAdminMessage({ type: "success", text: "Meta account synced." });
      } catch (e: any) {
        setAdminMessage({
          type: "error",
          text: e?.message || "Failed to sync Meta account.",
        });
      } finally {
        setIsMetaSyncLoading(false);
      }
    },
    [selectedClientMetaPageId, setAdminMessage]
  );

  return {
    metaPages,
    setMetaPages,
    loadMetaPages,

    selectedClientMetaPageId,
    setSelectedClientMetaPageId,

    isMetaSyncLoading,
    syncClientMetaPage,

    // helper
    resetSelectedClientMetaPageId: () => setSelectedClientMetaPageId(""),
  };
}
