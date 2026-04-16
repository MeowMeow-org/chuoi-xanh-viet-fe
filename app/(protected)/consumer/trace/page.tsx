"use client";

import { useState } from 'react';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, MapPin, ShieldCheck, Leaf, Clock, Search } from 'lucide-react';
import { diaryEntries, seasons, currentFarmer } from '@/data/mockData';

const TASK_ICONS: Record<string, string> = {
  'Làm đất': '🌾', 'Gieo trồng': '🌱', 'Bón phân': '🧪',
  'Phun thuốc': '💧', 'Tưới nước': '🚿', 'Thu hoạch': '🧺', 'Khác': '📝',
};

export default function ConsumerTracePage() {
  const [code, setCode] = useState('');
  const [found, setFound] = useState(false);

  const handleSearch = () => {
    // Mock: any input triggers the trace result
    if (code.trim()) setFound(true);
  };

  const season = seasons[0];
  const entries = diaryEntries.filter(e => e.seasonId === season.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Truy xuất nguồn gốc</h1>
        <p className="text-sm text-muted-foreground">Nhập mã truy xuất hoặc quét mã QR trên sản phẩm để xem toàn bộ hành trình canh tác.</p>

        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập mã truy xuất (VD: CXV-001)"
              className="pl-10 h-12"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button className="h-12 gap-2" onClick={handleSearch}>
            <QrCode className="h-4 w-4" /> Tra cứu
          </Button>
        </div>

        <Button variant="outline" className="w-full h-12 gap-2">
          <QrCode className="h-5 w-5" /> Quét mã QR bằng camera
        </Button>

        {/* Results */}
        {found && (
          <div className="space-y-4 animate-fade-in">
            {/* Farm info */}
            <Card className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Leaf className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-bold text-lg">{currentFarmer.farmName}</h2>
                    <p className="text-sm font-medium">{currentFarmer.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {currentFarmer.address}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentFarmer.certifications.map(c => (
                    <Badge key={c} variant="secondary" className="gap-1">
                      <ShieldCheck className="h-3 w-3" /> {c}
                    </Badge>
                  ))}
                  <Badge className="gap-1 bg-primary/10 text-primary border-0">
                    <ShieldCheck className="h-3 w-3" /> Blockchain verified
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Season info */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-base">Thông tin mùa vụ</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Vụ:</span> {season.name}</div>
                  <div><span className="text-muted-foreground">Cây trồng:</span> {season.crop}</div>
                  <div><span className="text-muted-foreground">Diện tích:</span> {season.area}</div>
                  <div><span className="text-muted-foreground">Vị trí:</span> {season.location}</div>
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card>
              <CardContent className="p-0">
                <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-1">
                    <MapPin className="h-8 w-8 text-primary mx-auto" />
                    <p className="text-xs text-muted-foreground">Vị trí: {season.gpsLat}, {season.gpsLng}</p>
                    <p className="text-[10px] text-muted-foreground">Bản đồ (tích hợp sau)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold text-base">Nhật ký canh tác ({entries.length} hoạt động)</h3>
                <div className="space-y-0">
                  {entries.map((entry, idx) => (
                    <div key={entry.id} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0">
                          {TASK_ICONS[entry.taskType] || '📝'}
                        </div>
                        {idx < entries.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{entry.taskTypeLabel}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {entry.synced ? '✓ On-chain' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.timestamp).toLocaleString('vi-VN')}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1 truncate">
                          Hash: {entry.blockchainHash}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ConsumerLayout>
  );
}
