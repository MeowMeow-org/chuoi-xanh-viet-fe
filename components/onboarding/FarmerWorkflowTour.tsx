"use client";

import { ConfigProvider, Tour } from "antd";
import type { TourProps } from "antd";
import viVN from "antd/locale/vi_VN";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FARMER_SHELL_ONBOARDING_DONE_EVENT,
  FARMER_SHELL_ONBOARDING_KEY,
  readOnboardingFlag,
  writeOnboardingFlag,
} from "@/lib/onboarding/farmerKeys";

export type FarmerWorkflowTourStep = {
  targetId: string;
  title: string;
  description: string;
};

type FarmerWorkflowTourProps = {
  storageKey: string;
  steps: FarmerWorkflowTourStep[];
  openDelayMs?: number;
  placement?: TourProps["placement"];
  zIndex?: number;
};

/**
 * Tour theo trang: chỉ mở sau khi tour shell xong (hoặc đã hoàn thành shell trước đó).
 */
export default function FarmerWorkflowTour({
  storageKey,
  steps,
  openDelayMs = 450,
  placement = "bottom",
  zIndex = 10800,
}: FarmerWorkflowTourProps) {
  const [shellDone, setShellDone] = useState(() =>
    readOnboardingFlag(FARMER_SHELL_ONBOARDING_KEY),
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onShell = () => setShellDone(true);
    window.addEventListener(FARMER_SHELL_ONBOARDING_DONE_EVENT, onShell);
    return () =>
      window.removeEventListener(FARMER_SHELL_ONBOARDING_DONE_EVENT, onShell);
  }, []);

  useEffect(() => {
    if (!shellDone || readOnboardingFlag(storageKey)) return;
    const t = window.setTimeout(() => setOpen(true), openDelayMs);
    return () => window.clearTimeout(t);
  }, [shellDone, storageKey, openDelayMs]);

  const finish = useCallback(() => {
    setOpen(false);
    writeOnboardingFlag(storageKey);
  }, [storageKey]);

  const tourSteps = useMemo((): TourProps["steps"] => {
    return steps.map((s, index) => ({
      title: s.title,
      description: s.description,
      target: () =>
        document.getElementById(s.targetId) ?? document.body,
      nextButtonProps: {
        children: index === steps.length - 1 ? "Xong" : "Tiếp",
      },
    }));
  }, [steps]);

  if (steps.length === 0) return null;

  return (
    <ConfigProvider locale={viVN}>
      <Tour
        open={open}
        onClose={finish}
        onFinish={finish}
        steps={tourSteps}
        zIndex={zIndex}
        placement={placement}
        closeIcon={false}
        indicatorsRender={(current, total) => (
          <span className="text-xs tabular-nums text-white/90">
            {current + 1}/{total}
          </span>
        )}
      />
    </ConfigProvider>
  );
}
