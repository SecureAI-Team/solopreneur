
'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AutomationPage() {
    return (
        <DashboardLayout title="自动化">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="size-24 rounded-full bg-amber-100 flex items-center justify-center">
                    <Zap className="size-12 text-amber-600" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-2xl font-bold">自动化工作流即将上线</h1>
                    <p className="text-muted-foreground">
                        解放双手的利器！也就是所说的 RPA 功能。
                        自动点赞、自动回复、自动同步等功能正在开发中。
                    </p>
                </div>
                <Card className="max-w-md w-full border-dashed bg-muted/50">
                    <CardContent className="pt-6 flex flex-col items-center gap-2">
                        <Construction className="size-8 text-blue-500 mb-2" />
                        <p className="font-medium">开发进度: 15%</p>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full w-[15%] bg-blue-500 rounded-full" />
                        </div>
                    </CardContent>
                </Card>
                <Button variant="outline">如果有急需功能，请反馈给我们</Button>
            </div>
        </DashboardLayout>
    );
}
