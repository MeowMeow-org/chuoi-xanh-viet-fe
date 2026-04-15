export interface FarmDiaryEntry {
    id: string;
    seasonId: string;
    taskType: 'Làm đất' | 'Gieo trồng' | 'Bón phân' | 'Phun thuốc' | 'Tưới nước' | 'Thu hoạch' | 'Khác';
    taskTypeLabel: string;
    description: string;
    photos: string[];
    gpsLat: number;
    gpsLng: number;
    timestamp: string;
    blockchainHash: string;
    synced: boolean;
}

export interface Season {
    id: string;
    farmerId: string;
    name: string;
    crop: string;
    area: string;
    startDate: string;
    endDate?: string;
    status: 'Đang canh tác' | 'Đã thu hoạch' | 'Chuẩn bị';
    location: string;
    gpsLat: number;
    gpsLng: number;
}

export interface Farmer {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    address: string;
    farmName: string;
    certifications: string[];
}

const generateHash = (seed: string) => {
    let hash = 2166136261;

    for (let i = 0; i < seed.length; i += 1) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    let hex = "";
    let value = hash >>> 0;

    while (hex.length < 16) {
        value = Math.imul(value ^ 61, 2654435761) >>> 0;
        hex += value.toString(16).padStart(8, "0");
    }

    return `0x${hex.slice(0, 16)}`;
};

export const TASK_TYPES = [
    { value: 'lam_dat', label: 'Làm đất', icon: '🌾' },
    { value: 'gieo_trong', label: 'Gieo trồng', icon: '🌱' },
    { value: 'bon_phan', label: 'Bón phân', icon: '🧪' },
    { value: 'phun_thuoc', label: 'Phun thuốc', icon: '💧' },
    { value: 'tuoi_nuoc', label: 'Tưới nước', icon: '🚿' },
    { value: 'thu_hoach', label: 'Thu hoạch', icon: '🧺' },
    { value: 'khac', label: 'Khác', icon: '📝' },
] as const;

export const currentFarmer: Farmer = {
    id: 'farmer-001',
    name: 'Nguyễn Văn Minh',
    phone: '0901234567',
    avatar: '',
    address: 'Ấp 3, Xã Long Hòa, Huyện Cần Giờ, TP.HCM',
    farmName: 'Trang trại Rau sạch Long Hòa',
    certifications: ['VietGAP', 'Hữu cơ'],
};

export const seasons: Season[] = [
    {
        id: 'season-001',
        farmerId: 'farmer-001',
        name: 'Vụ Đông Xuân 2025-2026',
        crop: 'Rau muống',
        area: '2.000 m²',
        startDate: '2025-11-15',
        endDate: undefined,
        status: 'Đang canh tác',
        location: 'Lô A1 - Trang trại Long Hòa',
        gpsLat: 10.4114,
        gpsLng: 106.9572,
    },
    {
        id: 'season-002',
        farmerId: 'farmer-001',
        name: 'Vụ Xuân Hè 2026',
        crop: 'Cà chua',
        area: '1.500 m²',
        startDate: '2026-02-01',
        endDate: undefined,
        status: 'Đang canh tác',
        location: 'Lô B2 - Trang trại Long Hòa',
        gpsLat: 10.4120,
        gpsLng: 106.9580,
    },
    {
        id: 'season-003',
        farmerId: 'farmer-001',
        name: 'Vụ Hè Thu 2026',
        crop: 'Dưa leo',
        area: '1.000 m²',
        startDate: '2026-05-01',
        status: 'Chuẩn bị',
        location: 'Lô C3 - Trang trại Long Hòa',
        gpsLat: 10.4125,
        gpsLng: 106.9585,
    },
];

export const diaryEntries: FarmDiaryEntry[] = [
    {
        id: 'diary-001',
        seasonId: 'season-001',
        taskType: 'Làm đất',
        taskTypeLabel: 'Làm đất',
        description: 'Cày xới đất, bón lót phân hữu cơ vi sinh 500kg/1000m². Đất tơi xốp, pH đạt 6.5.',
        photos: [],
        gpsLat: 10.4114,
        gpsLng: 106.9572,
        timestamp: '2025-11-15T07:30:00+07:00',
        blockchainHash: generateHash('diary-001'),
        synced: true,
    },
    {
        id: 'diary-002',
        seasonId: 'season-001',
        taskType: 'Gieo trồng',
        taskTypeLabel: 'Gieo trồng',
        description: 'Gieo hạt rau muống giống TN1, khoảng cách hàng 15cm. Mật độ: 200g hạt/1000m².',
        photos: [],
        gpsLat: 10.4114,
        gpsLng: 106.9572,
        timestamp: '2025-11-18T06:00:00+07:00',
        blockchainHash: generateHash('diary-002'),
        synced: true,
    },
    {
        id: 'diary-003',
        seasonId: 'season-001',
        taskType: 'Bón phân',
        taskTypeLabel: 'Bón phân',
        description: 'Bón thúc lần 1: NPK 16-16-8, liều lượng 30kg/1000m². Rau đã lên đều, cao 5cm.',
        photos: [],
        gpsLat: 10.4114,
        gpsLng: 106.9572,
        timestamp: '2025-11-25T07:00:00+07:00',
        blockchainHash: generateHash('diary-003'),
        synced: true,
    },
    {
        id: 'diary-004',
        seasonId: 'season-001',
        taskType: 'Tưới nước',
        taskTypeLabel: 'Tưới nước',
        description: 'Tưới phun mưa tự động, 2 lần/ngày (sáng 6h, chiều 17h). Lượng nước: 3L/m²/lần.',
        photos: [],
        gpsLat: 10.4114,
        gpsLng: 106.9572,
        timestamp: '2025-11-28T06:00:00+07:00',
        blockchainHash: generateHash('diary-004'),
        synced: true,
    },
    {
        id: 'diary-005',
        seasonId: 'season-001',
        taskType: 'Phun thuốc',
        taskTypeLabel: 'Phun thuốc',
        description: 'Phun thuốc sinh học Emamectin Benzoate 1.92EC phòng sâu xanh. Thời gian cách ly: 7 ngày.',
        photos: [],
        gpsLat: 10.4114,
        gpsLng: 106.9572,
        timestamp: '2026-04-02T08:00:00+07:00',
        blockchainHash: generateHash('diary-005'),
        synced: true,
    },
    {
        id: 'diary-006',
        seasonId: 'season-002',
        taskType: 'Làm đất',
        taskTypeLabel: 'Làm đất',
        description: 'Lên luống cao 25cm, rộng 1.2m. Phủ màng PE đen chống cỏ dại. Bón lót phân chuồng hoai mục.',
        photos: [],
        gpsLat: 10.4120,
        gpsLng: 106.9580,
        timestamp: '2026-01-28T07:00:00+07:00',
        blockchainHash: generateHash('diary-006'),
        synced: true,
    },
    {
        id: 'diary-007',
        seasonId: 'season-002',
        taskType: 'Gieo trồng',
        taskTypeLabel: 'Gieo trồng',
        description: 'Trồng cây cà chua giống Savior F1, khoảng cách 50x60cm. Tổng 500 cây/1500m².',
        photos: [],
        gpsLat: 10.4120,
        gpsLng: 106.9580,
        timestamp: '2026-02-01T06:30:00+07:00',
        blockchainHash: generateHash('diary-007'),
        synced: true,
    },
];
