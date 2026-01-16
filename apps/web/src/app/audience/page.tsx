
'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AudiencePage() {
    return (
        <DashboardLayout title="粉丝画像">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="size-24 rounded-full bg-violet-100 flex items-center justify-center">
                    <Users className="size-12 text-violet-600" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-2xl font-bold">粉丝画像即将上线</h1>
                    <p className="text-muted-foreground">
                        如果您需要深入了解您的受众分布、兴趣偏好和活跃时间，请耐心等待。
                        我们正在接入各大平台的粉丝数据接口。
                    </p>
                </div>
                <Card className="max-w-md w-full border-dashed bg-muted/50">
                    <CardContent className="pt-6 flex flex-col items-center gap-2">
                        <Construction className="size-8 text-amber-500 mb-2" />
                        <p className="font-medium">开发进度: 35%</p>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full w-[35%] bg-amber-500 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
                <Button variant="outline">如果有急需功能，请反馈给我们</Button>
            </div>
        </DashboardLayout>
    );
}
