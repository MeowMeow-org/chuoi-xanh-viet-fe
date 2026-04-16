import { seasons } from "@/data/mockData";

export type UserFarm = {
  id: string;
  name: string;
  location: string;
  area: string;
  seasonIds: string[];
};

export const userFarms: UserFarm[] = [
  {
    id: "farm-long-hoa-a",
    name: "Nông trại Long Hòa A",
    location: "Ấp 3, Xã Long Hòa, Cần Giờ, TP.HCM",
    area: "2.8 ha",
    seasonIds: ["season-001", "season-003"],
  },
  {
    id: "farm-long-hoa-b",
    name: "Nông trại Long Hòa B",
    location: "Ấp 4, Xã Long Hòa, Cần Giờ, TP.HCM",
    area: "1.9 ha",
    seasonIds: ["season-002"],
  },
];

export function getFarmById(farmId: string) {
  return userFarms.find((farm) => farm.id === farmId);
}

export function getFarmSeasons(farmId: string) {
  const farm = getFarmById(farmId);
  if (!farm) return [];
  return seasons.filter((season) => farm.seasonIds.includes(season.id));
}

export function getFarmIdBySeasonId(seasonId: string) {
  return userFarms.find((farm) => farm.seasonIds.includes(seasonId))?.id;
}
