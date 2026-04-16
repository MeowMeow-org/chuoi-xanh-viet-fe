"use client";

import Link from "next/link";
import { useState } from "react";
import { Info, MessageCircle, ShoppingBag, Star } from "lucide-react";

import { notifications as mockNotifications } from "@/data/marketplaceData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const typeIcon = {
    order: ShoppingBag,
    message: MessageCircle,
    review: Star,
    system: Info,
};

function formatDateTimeVN(iso: string) {
    const [date, timeWithZone] = iso.split("T");
    const [year, month, day] = date.split("-");
    const time = timeWithZone.slice(0, 5);
    return `${time} ${day}/${month}/${year}`;
}

export default function FarmerNotificationsPage() {
    const [notifs] = useState(mockNotifications);

    return (
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Thông báo</h1>
                    <Badge className="bg-[hsl(120,20%,95%)] text-[hsl(150,10%,22%)]">
                        {notifs.filter((item) => !item.read).length} mới
                    </Badge>
                </div>

                <div className="space-y-2">
                    {notifs.map((noti) => {
                        const Icon = typeIcon[noti.type];

                        const content = (
                            <Card
                                className={`transition-colors hover:border-[hsl(142,71%,45%)]/40 ${!noti.read ? "border-[hsl(142,71%,45%)]/30 bg-[hsl(142,71%,45%)]/5" : ""
                                    }`}
                            >
                                <CardContent className="flex items-start gap-3 p-4">
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${!noti.read ? "bg-[hsl(142,71%,45%)]/10" : "bg-[hsl(120,20%,94%)]"
                                            }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${!noti.read ? "text-[hsl(142,71%,45%)]" : "text-[hsl(150,7%,45%)]"
                                                }`}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm ${!noti.read ? "font-semibold" : "font-medium"}`}>
                                                {noti.title}
                                            </p>
                                            {!noti.read && <div className="h-2 w-2 shrink-0 rounded-full bg-[hsl(142,71%,45%)]" />}
                                        </div>

                                        <p className="text-sm text-[hsl(150,7%,45%)]">{noti.content}</p>
                                        <p className="mt-1 text-xs text-[hsl(150,7%,45%)]">{formatDateTimeVN(noti.createdAt)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );

                        if (noti.link) {
                            return (
                                <Link key={noti.id} href={noti.link} className="block">
                                    {content}
                                </Link>
                            );
                        }

                        return <div key={noti.id}>{content}</div>;
                    })}
                </div>
        </div>
    );
}
