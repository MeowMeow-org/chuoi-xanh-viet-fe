"use client";

import { Tour } from "antd";
import type { TourProps } from "antd";
import viVN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  dispatchShellOnboardingComplete,
  FARMER_SHELL_ONBOARDING_KEY,
  readOnboardingFlag,
  writeOnboardingFlag,
} from "@/lib/onboarding/farmerKeys";

function query(id: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(id);
}

export default function FarmerShellOnboarding() {
  const [mdUp, setMdUp] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (readOnboardingFlag(FARMER_SHELL_ONBOARDING_KEY)) return;
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    setOpen(false);
    writeOnboardingFlag(FARMER_SHELL_ONBOARDING_KEY);
    dispatchShellOnboardingComplete();
  }, []);

  const steps = useMemo((): TourProps["steps"] => {
    const header = () => query("onboarding-farmer-header");
    const navDesktop = () => query("onboarding-farmer-nav-desktop");
    const actions = () => query("onboarding-farmer-actions");
    const main = () => query("onboarding-farmer-main");
    const bottomNav = () => query("onboarding-farmer-bottom-nav");

    const core: TourProps["steps"] = [
      {
        title: "Chào bạn, đây là không gian nông hộ",
        description:
          "Chúng tôi sẽ chỉ nhanh các phần chính trên màn hình.",
        target: header,
        nextButtonProps: { children: "Tiếp" },
      },
      {
        title: "Khu vực làm việc",
        description:
          "Nội dung từng trang (nông trại, gian hàng, nhật ký…) hiển thị ở đây. Hãy vào từng mục menu để thao tác.",
        target: main,
        nextButtonProps: { children: "Tiếp" },
      },
      {
        title: "Thông báo & tin nhắn",
        description:
          "Xem thông báo hệ thống và trò chuyện với hợp tác xã hoặc khách. Biểu tượng gói hàng là đơn hàng.",
        target: actions,
        nextButtonProps: { children: "Tiếp" },
      },
    ];

    if (mdUp) {
      core.splice(1, 0, {
        title: "Menu chức năng",
        description:
          "Tổng quan, Nông trại, Gian hàng, Diễn đàn, Xu hướng, Trợ lý AI, mỗi mục là một nhóm việc riêng.",
        target: navDesktop,
        nextButtonProps: { children: "Tiếp" },
      });
    } else {
      core.splice(1, 0, {
        title: "Menu điện thoại",
        description:
          "Thanh dưới cùng giúp chuyển nhanh giữa các phần chính khi bạn dùng điện thoại.",
        target: bottomNav,
        nextButtonProps: { children: "Tiếp" },
      });
    }

    return core;
  }, [mdUp]);

  return (
    <ConfigProvider locale={viVN}>
      <Tour
        open={open}
        onClose={finish}
        onFinish={finish}
        steps={steps}
        zIndex={10800}
        placement="bottom"
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
