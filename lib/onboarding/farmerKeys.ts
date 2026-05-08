/** Phiên bản khóa — tăng số khi đổi nội dung tour để user đã xem có thể xem lại bản mới (tuỳ chọn). */
export const FARMER_SHELL_ONBOARDING_KEY = "cxv_onboarding_farmer_shell_v1";
export const FARMER_DIARY_ONBOARDING_KEY = "cxv_onboarding_farmer_diary_v1";
export const FARMER_FARMS_LIST_ONBOARDING_KEY =
  "cxv_onboarding_farmer_farms_list_v1";
export const FARMER_FARM_CREATE_ONBOARDING_KEY =
  "cxv_onboarding_farmer_farm_create_v1";
export const FARMER_FARM_HUB_ONBOARDING_KEY = "cxv_onboarding_farmer_farm_hub_v1";
export const FARMER_CERTIFICATES_ONBOARDING_KEY =
  "cxv_onboarding_farmer_certificates_v1";
export const FARMER_MARKETPLACE_ONBOARDING_KEY =
  "cxv_onboarding_farmer_marketplace_v1";
export const FARMER_SEASON_CREATE_ONBOARDING_KEY =
  "cxv_onboarding_farmer_season_create_v1";
export const FARMER_SEASON_DETAIL_ONBOARDING_KEY =
  "cxv_onboarding_farmer_season_detail_v1";
export const FARMER_EARNINGS_ONBOARDING_KEY =
  "cxv_onboarding_farmer_earnings_v1";
export const FARMER_AGRI_TREND_ONBOARDING_KEY =
  "cxv_onboarding_farmer_agri_trend_v1";

export const FARMER_SHELL_ONBOARDING_DONE_EVENT =
  "cxv:farmer-shell-onboarding-complete";

export function readOnboardingFlag(key: string): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(key) === "1";
}

export function writeOnboardingFlag(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, "1");
}

export function dispatchShellOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FARMER_SHELL_ONBOARDING_DONE_EVENT));
}
