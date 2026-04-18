export interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    farmerId: string;
    seasonId: string;
    verified: boolean;
    quarantine: boolean;
    quarantineDaysLeft?: number;
    description: string;
    stock: number;
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    photos: string[];
    createdAt: string;
}

export interface Notification {
    id: string;
    type: "order" | "message" | "review" | "system" | "cooperative" | "forum";
    title: string;
    content: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: "buyer" | "farmer";
    content: string;
    timestamp: string;
}

export interface Conversation {
    id: string;
    buyerId: string;
    buyerName: string;
    farmerId: string;
    farmerName: string;
    lastMessage: string;
    lastTimestamp: string;
    unread: number;
    messages: ChatMessage[];
}

export const products: Product[] = [
    {
        id: "prod-001",
        name: "Rau muống hữu cơ",
        image: "",
        price: 25000,
        unit: "bó (500g)",
        farmerId: "farmer-001",
        seasonId: "season-001",
        verified: true,
        quarantine: true,
        quarantineDaysLeft: 3,
        description: "Rau muống trồng theo tiêu chuẩn VietGAP, không sử dụng thuốc trừ sâu hóa học.",
        stock: 150,
    },
    {
        id: "prod-002",
        name: "Cà chua Savior F1",
        image: "",
        price: 35000,
        unit: "kg",
        farmerId: "farmer-001",
        seasonId: "season-002",
        verified: true,
        quarantine: false,
        description: "Cà chua giống Savior F1 chất lượng cao, quả đều, đỏ tươi, vị ngọt thanh tự nhiên.",
        stock: 200,
    },
    {
        id: "prod-003",
        name: "Dưa leo baby",
        image: "",
        price: 30000,
        unit: "kg",
        farmerId: "farmer-001",
        seasonId: "season-003",
        verified: false,
        quarantine: false,
        description: "Dưa leo baby giòn ngọt, kích thước nhỏ gọn, thích hợp ăn sống hoặc làm salad.",
        stock: 0,
    },
];

export const reviews: Review[] = [
    {
        id: "rev-001",
        productId: "prod-001",
        userId: "user-001",
        userName: "Trần Thị Mai",
        rating: 5,
        comment: "Rau rất tươi, giao hàng nhanh. Đặc biệt yên tâm vì có truy xuất nguồn gốc rõ ràng trên Blockchain!",
        photos: [],
        createdAt: "2026-03-28T10:00:00+07:00",
    },
    {
        id: "rev-002",
        productId: "prod-001",
        userId: "user-002",
        userName: "Lê Hoàng Nam",
        rating: 4,
        comment: "Rau muống ngon, giòn. Nhưng lần sau đóng gói kỹ hơn thì tốt hơn ạ.",
        photos: [],
        createdAt: "2026-03-30T14:30:00+07:00",
    },
    {
        id: "rev-003",
        productId: "prod-002",
        userId: "user-003",
        userName: "Nguyễn Thị Hằng",
        rating: 5,
        comment: "Cà chua rất ngọt, đỏ đều. Quét QR thấy cả quá trình trồng, rất tin tưởng!",
        photos: [],
        createdAt: "2026-04-01T09:00:00+07:00",
    },
];

export const notifications: Notification[] = [
    {
        id: "noti-001",
        type: "order",
        title: "Đơn hàng mới",
        content: "Lê Hoàng Nam đã đặt 5 bó Rau muống hữu cơ",
        read: false,
        createdAt: "2026-04-08T06:30:00+07:00",
        link: "/farmer/marketplace",
    },
    {
        id: "noti-002",
        type: "message",
        title: "Tin nhắn mới",
        content: "Trần Thị Mai gửi tin nhắn cho bạn",
        read: false,
        createdAt: "2026-04-07T15:30:00+07:00",
        link: "/farmer/messages",
    },
    {
        id: "noti-003",
        type: "review",
        title: "Đánh giá mới",
        content: "Nguyễn Thị Hằng đã đánh giá 5 sao cho Cà chua Savior F1",
        read: true,
        createdAt: "2026-04-01T09:00:00+07:00",
        link: "/farmer/marketplace",
    },
    {
        id: "noti-004",
        type: "system",
        title: "Hết thời gian cách ly",
        content: "Rau muống hữu cơ đã hết thời gian cách ly thuốc BVTV, có thể bán trở lại",
        read: true,
        createdAt: "2026-03-30T00:00:00+07:00",
    },
];

export const conversations: Conversation[] = [
    {
        id: "conv-001",
        buyerId: "user-001",
        buyerName: "Trần Thị Mai",
        farmerId: "farmer-001",
        farmerName: "Nguyễn Văn Minh",
        lastMessage: "Dạ anh ơi rau muống có loại nào mới không ạ?",
        lastTimestamp: "2026-04-07T15:30:00+07:00",
        unread: 1,
        messages: [
            {
                id: "msg-001",
                senderId: "user-001",
                senderName: "Trần Thị Mai",
                senderRole: "buyer",
                content: "Chào anh Minh, rau muống của anh bao giờ có đợt mới ạ?",
                timestamp: "2026-04-07T15:00:00+07:00",
            },
            {
                id: "msg-002",
                senderId: "farmer-001",
                senderName: "Nguyễn Văn Minh",
                senderRole: "farmer",
                content: "Chào chị Mai! Đợt mới khoảng 3 ngày nữa thu hoạch ạ. Chị đặt trước nhé!",
                timestamp: "2026-04-07T15:15:00+07:00",
            },
            {
                id: "msg-003",
                senderId: "user-001",
                senderName: "Trần Thị Mai",
                senderRole: "buyer",
                content: "Dạ anh ơi rau muống có loại nào mới không ạ?",
                timestamp: "2026-04-07T15:30:00+07:00",
            },
        ],
    },
    {
        id: "conv-002",
        buyerId: "user-002",
        buyerName: "Lê Hoàng Nam",
        farmerId: "farmer-001",
        farmerName: "Nguyễn Văn Minh",
        lastMessage: "Cảm ơn anh, em đặt 5 bó nhé!",
        lastTimestamp: "2026-04-08T07:00:00+07:00",
        unread: 0,
        messages: [
            {
                id: "msg-004",
                senderId: "user-002",
                senderName: "Lê Hoàng Nam",
                senderRole: "buyer",
                content: "Anh ơi, rau muống giá sỉ có giảm không ạ?",
                timestamp: "2026-04-08T06:30:00+07:00",
            },
            {
                id: "msg-005",
                senderId: "farmer-001",
                senderName: "Nguyễn Văn Minh",
                senderRole: "farmer",
                content: "Chào em! Mua từ 5 bó trở lên anh giảm còn 22.000đ/bó nhé.",
                timestamp: "2026-04-08T06:45:00+07:00",
            },
            {
                id: "msg-006",
                senderId: "user-002",
                senderName: "Lê Hoàng Nam",
                senderRole: "buyer",
                content: "Cảm ơn anh, em đặt 5 bó nhé!",
                timestamp: "2026-04-08T07:00:00+07:00",
            },
        ],
    },
];
