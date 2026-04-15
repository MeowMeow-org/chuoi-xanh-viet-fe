export interface ForumPost {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: "farmer" | "expert" | "extension_officer";
    authorBadge?: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    likes: number;
    comments: ForumComment[];
    isEscalated: boolean;
}

export interface ForumComment {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: "farmer" | "expert" | "extension_officer";
    authorBadge?: string;
    content: string;
    createdAt: string;
    likes: number;
}

export const forumPosts: ForumPost[] = [
    {
        id: "post-001",
        authorId: "farmer-001",
        authorName: "Nguyễn Văn Minh",
        authorRole: "farmer",
        authorBadge: "Nông dân tích cực",
        title: "Cách xử lý rau muống bị vàng lá sau khi bón phân?",
        content: "Chào mọi người, rau muống nhà mình sau khi bón phân NPK 16-16-8 được 3 ngày thì lá bắt đầu vàng từ gốc lên. Mình đã tưới đủ nước. Có ai gặp tình trạng tương tự không? Xin hướng dẫn cách khắc phục ạ.",
        tags: ["Rau muống", "Bón phân", "Bệnh cây"],
        createdAt: "2026-04-05T08:30:00+07:00",
        likes: 12,
        isEscalated: false,
        comments: [
            {
                id: "cmt-001",
                authorId: "expert-001",
                authorName: "TS. Trần Thị Hoa",
                authorRole: "expert",
                authorBadge: "Chuyên gia cộng đồng",
                content: "Hiện tượng này thường do bón quá liều hoặc bón quá gần gốc gây cháy rễ. Bạn nên tưới nhiều nước để rửa bớt phân, ngưng bón thêm 7-10 ngày. Nếu nặng hơn có thể phun phân bón lá Amino Acid để phục hồi.",
                createdAt: "2026-04-05T10:15:00+07:00",
                likes: 8,
            },
            {
                id: "cmt-002",
                authorId: "farmer-002",
                authorName: "Lê Văn Tài",
                authorRole: "farmer",
                content: "Mình cũng bị lần trước. Nguyên nhân là bón phân khi trời nắng gắt. Nên bón vào chiều mát và tưới ngay sau đó.",
                createdAt: "2026-04-05T14:00:00+07:00",
                likes: 5,
            },
        ],
    },
    {
        id: "post-002",
        authorId: "officer-001",
        authorName: "Nguyễn Thanh Sơn",
        authorRole: "extension_officer",
        title: "Chia sẻ mô hình trồng xen canh rau - đậu hiệu quả",
        content: "Xin chia sẻ mô hình xen canh rau muống + đậu phộng đang thực hiện tại HTX Long Hòa. Đậu phộng cố định đạm cho đất, giảm 30% lượng phân bón NPK. Năng suất rau muống tăng 15% so với trồng đơn.\n\nBà con nào muốn tham quan mô hình có thể liên hệ qua ứng dụng.",
        tags: ["Xen canh", "Mô hình", "Tiết kiệm"],
        createdAt: "2026-04-03T09:00:00+07:00",
        likes: 24,
        isEscalated: false,
        comments: [
            {
                id: "cmt-003",
                authorId: "farmer-001",
                authorName: "Nguyễn Văn Minh",
                authorRole: "farmer",
                content: "Hay quá anh Sơn! Cho em xin thêm thông tin về khoảng cách trồng xen và thời điểm gieo đậu phộng so với rau muống ạ.",
                createdAt: "2026-04-03T11:30:00+07:00",
                likes: 3,
            },
        ],
    },
    {
        id: "post-003",
        authorId: "farmer-003",
        authorName: "Phạm Thị Lan",
        authorRole: "farmer",
        title: "Cà chua bị nứt quả hàng loạt, phải làm sao?",
        content: "Vườn cà chua Savior F1 nhà mình đang thu hoạch nhưng quả bị nứt rất nhiều, nhất là sau mưa. Đã phủ màng PE nhưng vẫn không giảm. Có cách nào phòng ngừa không ạ?",
        tags: ["Cà chua", "Bệnh cây", "Thu hoạch"],
        createdAt: "2026-04-06T16:00:00+07:00",
        likes: 7,
        isEscalated: true,
        comments: [],
    },
];
