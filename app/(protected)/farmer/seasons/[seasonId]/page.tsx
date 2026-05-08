import { redirect } from "next/navigation";
import { getFarmIdBySeasonId } from "@/data/farmUiMock";

interface SeasonDetailPageProps {
    params: Promise<{ seasonId: string }>;
}

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
    const { seasonId } = await params;
    const farmId = getFarmIdBySeasonId(seasonId);
    if (!farmId) {
        redirect("/farmer/farms");
    }
    redirect(`/farmer/farms/${farmId}/seasons/${seasonId}`);
}
