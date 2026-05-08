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
  const [current, setCurrent] = useState(0);

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
    setCurrent(0);
    writeOnboardingFlag(storageKey);
  }, [storageKey]);

  /**
   * Tránh lỗi "trigger element and popup element should in same shadow root":
   * khi user đổi tab/route lúc tour đang mở, target có id biến mất khỏi DOM
   * (vd. nội dung tab unmount). Lúc đó đóng tour cho an toàn thay vì giữ popup mồ côi.
   */
  useEffect(() => {
    if (!open) return;
    const step = steps[current];
    if (!step) return;
    const id = window.setInterval(() => {
      if (!document.getElementById(step.targetId)) {
        finish();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [open, current, steps, finish]);

  const tourSteps = useMemo((): TourProps["steps"] => {
    return steps.map((s, index) => ({
      title: s.title,
      description: s.description,
      target: () =>
        document.getElementById(s.targetId) ?? document.documentElement,
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
        current={current}
        onChange={setCurrent}
        onClose={finish}
        onFinish={finish}
        steps={tourSteps}
        zIndex={zIndex}
        placement={placement}
        closeIcon={
          <span className="rounded-md px-2 py-1 text-xs font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white">
            Bỏ qua
          </span>
        }
        indicatorsRender={(value, total) => (
          <span className="text-xs tabular-nums text-white/90">
            {value + 1}/{total}
          </span>
        )}
      />
    </ConfigProvider>
  );
}
