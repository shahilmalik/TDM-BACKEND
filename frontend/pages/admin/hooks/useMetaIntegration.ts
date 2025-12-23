import { useCallback, useState } from "react";
import { api } from "../../../services/api";
import type { MetaPage, MetaToken } from "../../../types";

type AdminMessage = { type: "success" | "error"; text: string };

type Params = {
  setAdminMessage: (m: AdminMessage) => void;
};

export function useMetaIntegration({ setAdminMessage }: Params) {
  const [metaTokens, setMetaTokens] = useState<MetaToken[]>([]);
  const [metaPages, setMetaPages] = useState<MetaPage[]>([]);

  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaStep, setMetaStep] = useState<1 | 2>(1);
  const [metaForm, setMetaForm] = useState({
    account_label: "",
    access_token: "",
    otp: "",
  });
  const [metaLoading, setMetaLoading] = useState(false);

  const fetchMeta = useCallback(async () => {
    try {
      const demoMode =
        localStorage.getItem("demoMode") === "true" ||
        localStorage.getItem("DEMO_META") === "true";

      if (demoMode) {
        setMetaTokens([
          {
            id: 2,
            account_label: "TDM tarviz 1",
            user_name: "Tdm Work",
            profile_picture:
              "https://scontent.fmaa3-2.fna.fbcdn.net/v/t1.30497-1/84628273_176159830277856_972693363922829312_nXg5HEK2noZSem5OML1ttCMySW2WHCGl061zhst2TgmS8aNvaL7Y_C71NGoYCgY4bmtrtuzpUTwJ=696BC419",
            status: "active",
            expires_at: "2026-02-16T23:11:56.487056Z",
            created_at: "2025-12-18T17:41:56.500800Z",
          } as any,
        ]);
        setMetaPages([
          {
            account_label: "TDM tarviz 1",
            token_id: 2,
            fb_page_id: "906055075920800",
            fb_page_name: "Hotel Raaj Bhaavan",
            fb_page_picture:
              "https://scontent.fmaa3-3.fna.fbcdn.net/v/t39.30808-1/587104605_122164363166749862_POqL-0vA&_nc_tpa=Q5bMBQHvp-xn4dRCr869fI_iqS2Hsb-rrrRJA1-HbnrtvPjRp_aQkhrfomah15tSXYsIUU2_L1cLTj4FVw&oh=00_AflBQk_XyQEP9s8KmxfSYSTauyGXuUUdURgB0Piuf_VM9Q&oe=694A204E",
            ig_account_id: "17841478686508287",
          },
          {
            account_label: "TDM tarviz 1",
            token_id: 2,
            fb_page_id: "793090860558655",
            fb_page_name: "Sai Mayura TVS",
            fb_page_picture:
              "https://scontent.fmaa3-3.fna.fbcdn.net/v/t39.30808-1/549327586_122154197150749862_899594056",
            ig_account_id: "17841462826367548",
          },
        ]);
        return;
      }

      const [tokenRes, pageRes] = await Promise.all([
        api.meta.listTokens(),
        api.meta.listPages(),
      ]);
      setMetaTokens(tokenRes.tokens || []);
      setMetaPages(pageRes.pages || []);
    } catch (e) {
      console.error("Meta fetch error", e);
    }
  }, []);

  const handleStartAddToken = useCallback(async () => {
    setMetaLoading(true);
    try {
      await api.meta.sendTokenOtp();
      setMetaStep(2);
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    } finally {
      setMetaLoading(false);
    }
  }, [setAdminMessage]);

  const handleConfirmAddToken = useCallback(async () => {
    if (!metaForm.access_token || !metaForm.otp || !metaForm.account_label) {
      setAdminMessage({ type: "error", text: "Fill all required fields." });
      return;
    }
    setMetaLoading(true);
    try {
      await api.meta.createToken({
        account_label: metaForm.account_label,
        access_token: metaForm.access_token,
        otp: metaForm.otp,
      });
      setIsMetaModalOpen(false);
      setMetaStep(1);
      setMetaForm({ account_label: "", access_token: "", otp: "" });
      await fetchMeta();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    } finally {
      setMetaLoading(false);
    }
  }, [fetchMeta, metaForm, setAdminMessage]);

  return {
    metaTokens,
    metaPages,

    fetchMeta,

    isMetaModalOpen,
    setIsMetaModalOpen,

    metaStep,
    setMetaStep,

    metaForm,
    setMetaForm,

    metaLoading,

    handleStartAddToken,
    handleConfirmAddToken,
  };
}
