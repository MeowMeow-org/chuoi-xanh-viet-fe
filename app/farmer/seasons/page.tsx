import FarmerLayout from "@/components/layout/FarmerLayout";
import SeasonList from "@/components/dashboard/SeasonList";

export default function FarmerSeasonsPage() {
    return (
        <FarmerLayout>
            <div className="mx-auto w-full max-w-6xl px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
                <SeasonList />
            </div>
        </FarmerLayout>
    );
}
