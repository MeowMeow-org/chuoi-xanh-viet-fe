// Consumer-specific mock data
import { currentFarmer, seasons, diaryEntries } from './mockData';
import { reviews, conversations, notifications } from './marketplaceData';

export interface ConsumerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: ConsumerAddress[];
  role: 'consumer';
}

export interface ConsumerAddress {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface Shop {
  id: string;
  farmerId: string;
  name: string;
  avatar: string;
  region: string;
  description: string;
  certifications: string[];
  rating: number;
  totalReviews: number;
  products: string[];
}

export interface ConsumerProduct {
  id: string;
  shopId: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  stock: number;
  verified: boolean;
  quarantine: boolean;
  quarantineDaysLeft?: number;
  seasonId: string;
  category: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  images: string[];
}

export interface ConsumerOrder {
  id: string;
  shopName: string;
  items: { productId: string; productName: string; quantity: number; price: number; unit: string }[];
  total: number;
  shippingFee: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  note?: string;
  address: string;
  paymentMethod: string;
  canReview: boolean;
}

export interface ForumPostConsumer {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'consumer' | 'farmer' | 'expert' | 'extension_officer';
  authorBadge?: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  likes: number;
  commentCount: number;
  isLiked: boolean;
  comments: ForumCommentConsumer[];
}

export interface ForumCommentConsumer {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'consumer' | 'farmer' | 'expert' | 'extension_officer';
  authorBadge?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked: boolean;
}

// Current consumer user
export const currentConsumer: ConsumerUser = {
  id: 'consumer-001',
  name: 'Trần Thị Mai',
  phone: '0912345678',
  email: 'mai.tran@email.com',
  addresses: [
    {
      id: 'addr-001',
      label: 'Nhà',
      fullAddress: '123 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM',
      isDefault: true,
    },
    {
      id: 'addr-002',
      label: 'Công ty',
      fullAddress: '456 Lê Văn Việt, Q.9, TP.HCM',
      isDefault: false,
    },
  ],
  role: 'consumer',
};

// Shops data
export const shops: Shop[] = [
  {
    id: 'shop-001',
    farmerId: 'farmer-001',
    name: 'Trang trại Rau sạch Long Hòa',
    avatar: '',
    region: 'Cần Giờ, TP.HCM',
    description: 'Chuyên trồng rau sạch theo tiêu chuẩn VietGAP. Cam kết không thuốc hóa học, giao hàng tận nơi khu vực TP.HCM.',
    certifications: ['VietGAP', 'Hữu cơ'],
    rating: 4.8,
    totalReviews: 156,
    products: ['cprod-001', 'cprod-002'],
  },
  {
    id: 'shop-002',
    farmerId: 'farmer-002',
    name: 'Nông trại Phú An',
    avatar: '',
    region: 'Củ Chi, TP.HCM',
    description: 'Nông trại gia đình 3 đời, chuyên trồng rau ăn lá và cây gia vị. Giao hàng mỗi sáng sớm.',
    certifications: ['VietGAP'],
    rating: 4.5,
    totalReviews: 89,
    products: ['cprod-003', 'cprod-004'],
  },
  {
    id: 'shop-003',
    farmerId: 'farmer-003',
    name: 'HTX Rau quả Bình Chánh',
    avatar: '',
    region: 'Bình Chánh, TP.HCM',
    description: 'Hợp tác xã quy mô 5ha, cung cấp rau quả sạch cho các siêu thị và bếp ăn. Đạt chứng nhận GlobalGAP.',
    certifications: ['VietGAP', 'GlobalGAP'],
    rating: 4.9,
    totalReviews: 312,
    products: ['cprod-005', 'cprod-006'],
  },
];

// Consumer products (enriched)
export const consumerProducts: ConsumerProduct[] = [
  {
    id: 'cprod-001',
    shopId: 'shop-001',
    name: 'Rau muống hữu cơ',
    price: 25000,
    unit: 'bó (500g)',
    description: 'Rau muống trồng theo tiêu chuẩn VietGAP, không sử dụng thuốc trừ sâu hóa học. Thu hoạch mỗi sáng, đảm bảo tươi ngon.',
    stock: 150,
    verified: true,
    quarantine: false,
    seasonId: 'season-001',
    category: 'Rau ăn lá',
    rating: 4.7,
    reviewCount: 89,
    soldCount: 1250,
    images: [],
  },
  {
    id: 'cprod-002',
    shopId: 'shop-001',
    name: 'Cà chua Savior F1',
    price: 35000,
    unit: 'kg',
    description: 'Cà chua giống Savior F1 chất lượng cao, quả đều, đỏ tươi, vị ngọt thanh tự nhiên. Đạt chuẩn VietGAP.',
    stock: 200,
    verified: true,
    quarantine: false,
    seasonId: 'season-002',
    category: 'Rau ăn quả',
    rating: 4.9,
    reviewCount: 67,
    soldCount: 890,
    images: [],
  },
  {
    id: 'cprod-003',
    shopId: 'shop-002',
    name: 'Xà lách lô lô xanh',
    price: 20000,
    unit: 'bó (300g)',
    description: 'Xà lách lô lô xanh giòn ngọt, không dùng thuốc trừ sâu. Lý tưởng cho salad và cuốn.',
    stock: 80,
    verified: true,
    quarantine: false,
    seasonId: 'season-001',
    category: 'Rau ăn lá',
    rating: 4.4,
    reviewCount: 34,
    soldCount: 560,
    images: [],
  },
  {
    id: 'cprod-004',
    shopId: 'shop-002',
    name: 'Húng quế tươi',
    price: 10000,
    unit: 'bó (100g)',
    description: 'Húng quế trồng tự nhiên, thơm nồng. Dùng để nấu phở, ăn kèm bún, hoặc làm gia vị.',
    stock: 120,
    verified: true,
    quarantine: false,
    seasonId: 'season-001',
    category: 'Rau gia vị',
    rating: 4.6,
    reviewCount: 21,
    soldCount: 340,
    images: [],
  },
  {
    id: 'cprod-005',
    shopId: 'shop-003',
    name: 'Dưa leo baby',
    price: 30000,
    unit: 'kg',
    description: 'Dưa leo baby giòn ngọt, kích thước nhỏ gọn, thích hợp ăn sống hoặc làm salad. Đạt GlobalGAP.',
    stock: 100,
    verified: true,
    quarantine: false,
    seasonId: 'season-003',
    category: 'Rau ăn quả',
    rating: 4.8,
    reviewCount: 56,
    soldCount: 780,
    images: [],
  },
  {
    id: 'cprod-006',
    shopId: 'shop-003',
    name: 'Bí đao xanh',
    price: 18000,
    unit: 'kg',
    description: 'Bí đao xanh tươi ngon, trồng theo phương pháp hữu cơ. Thích hợp nấu canh, xào.',
    stock: 60,
    verified: true,
    quarantine: true,
    quarantineDaysLeft: 2,
    seasonId: 'season-003',
    category: 'Rau ăn quả',
    rating: 4.3,
    reviewCount: 18,
    soldCount: 290,
    images: [],
  },
];

// Consumer orders
export const consumerOrders: ConsumerOrder[] = [
  {
    id: 'cord-001',
    shopName: 'Trang trại Rau sạch Long Hòa',
    items: [
      { productId: 'cprod-001', productName: 'Rau muống hữu cơ', quantity: 3, price: 25000, unit: 'bó' },
      { productId: 'cprod-002', productName: 'Cà chua Savior F1', quantity: 2, price: 35000, unit: 'kg' },
    ],
    total: 145000,
    shippingFee: 15000,
    status: 'delivered',
    createdAt: '2026-04-01T08:00:00+07:00',
    address: '123 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM',
    paymentMethod: 'COD',
    canReview: true,
  },
  {
    id: 'cord-002',
    shopName: 'Nông trại Phú An',
    items: [
      { productId: 'cprod-003', productName: 'Xà lách lô lô xanh', quantity: 2, price: 20000, unit: 'bó' },
    ],
    total: 40000,
    shippingFee: 15000,
    status: 'shipping',
    createdAt: '2026-04-10T10:00:00+07:00',
    address: '123 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM',
    paymentMethod: 'VNPay',
    canReview: false,
  },
  {
    id: 'cord-003',
    shopName: 'HTX Rau quả Bình Chánh',
    items: [
      { productId: 'cprod-005', productName: 'Dưa leo baby', quantity: 1, price: 30000, unit: 'kg' },
      { productId: 'cprod-006', productName: 'Bí đao xanh', quantity: 2, price: 18000, unit: 'kg' },
    ],
    total: 66000,
    shippingFee: 15000,
    status: 'confirmed',
    createdAt: '2026-04-12T14:00:00+07:00',
    address: '456 Lê Văn Việt, Q.9, TP.HCM',
    paymentMethod: 'PayOS',
    note: 'Giao giờ hành chính',
    canReview: false,
  },
  {
    id: 'cord-004',
    shopName: 'Trang trại Rau sạch Long Hòa',
    items: [
      { productId: 'cprod-001', productName: 'Rau muống hữu cơ', quantity: 5, price: 25000, unit: 'bó' },
    ],
    total: 125000,
    shippingFee: 15000,
    status: 'pending',
    createdAt: '2026-04-14T06:30:00+07:00',
    address: '123 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM',
    paymentMethod: 'COD',
    canReview: false,
  },
  {
    id: 'cord-005',
    shopName: 'Nông trại Phú An',
    items: [
      { productId: 'cprod-004', productName: 'Húng quế tươi', quantity: 3, price: 10000, unit: 'bó' },
    ],
    total: 30000,
    shippingFee: 15000,
    status: 'cancelled',
    createdAt: '2026-04-05T08:00:00+07:00',
    address: '123 Nguyễn Văn Linh, P.Tân Phong, Q.7, TP.HCM',
    paymentMethod: 'VNPay',
    canReview: false,
  },
];

// Consumer forum posts (includes consumer's own posts)
export const consumerForumPosts: ForumPostConsumer[] = [
  {
    id: 'cfpost-001',
    authorId: 'consumer-001',
    authorName: 'Trần Thị Mai',
    authorRole: 'consumer',
    title: 'Làm sao phân biệt rau muống hữu cơ và rau thường?',
    content: 'Mình mới bắt đầu mua rau trên Chuỗi Xanh Việt. Muốn hỏi mọi người cách phân biệt rau muống hữu cơ với rau thường ngoài chợ? Ngoài chứng nhận ra thì nhìn bằng mắt có khác gì không ạ?',
    tags: ['Rau muống', 'Hữu cơ', 'Mẹo mua hàng'],
    createdAt: '2026-04-10T09:00:00+07:00',
    likes: 8,
    commentCount: 2,
    isLiked: false,
    comments: [
      {
        id: 'ccmt-001',
        authorId: 'farmer-001',
        authorName: 'Nguyễn Văn Minh',
        authorRole: 'farmer',
        authorBadge: 'Nông hộ tích cực',
        content: 'Chào chị Mai! Rau hữu cơ thường lá nhỏ hơn, xanh đều, ít bóng mượt (vì không dùng phân urê). Quan trọng nhất là quét mã QR trên Chuỗi Xanh Việt để xem nhật ký canh tác ạ.',
        createdAt: '2026-04-10T10:30:00+07:00',
        likes: 5,
        isLiked: false,
      },
      {
        id: 'ccmt-002',
        authorId: 'expert-001',
        authorName: 'TS. Trần Thị Hoa',
        authorRole: 'expert',
        authorBadge: 'Chuyên gia cộng đồng',
        content: 'Bổ sung thêm: rau hữu cơ thường có cuống nhỏ, lá hơi cứng, đọt ít dài. Rau có phân hóa học thì lá to mướt, cuống dài bóng. Nên mua từ nguồn có truy xuất nguồn gốc.',
        createdAt: '2026-04-10T11:00:00+07:00',
        likes: 7,
        isLiked: true,
      },
    ],
  },
  {
    id: 'cfpost-002',
    authorId: 'farmer-001',
    authorName: 'Nguyễn Văn Minh',
    authorRole: 'farmer',
    authorBadge: 'Nông hộ tích cực',
    title: 'Cách xử lý rau muống bị vàng lá sau khi bón phân?',
    content: 'Chào mọi người, rau muống nhà mình sau khi bón phân NPK 16-16-8 được 3 ngày thì lá bắt đầu vàng từ gốc lên. Mình đã tưới đủ nước. Có ai gặp tình trạng tương tự không?',
    tags: ['Rau muống', 'Bón phân', 'Bệnh cây'],
    createdAt: '2026-04-05T08:30:00+07:00',
    likes: 12,
    commentCount: 2,
    isLiked: true,
    comments: [
      {
        id: 'ccmt-003',
        authorId: 'expert-001',
        authorName: 'TS. Trần Thị Hoa',
        authorRole: 'expert',
        authorBadge: 'Chuyên gia cộng đồng',
        content: 'Hiện tượng này thường do bón quá liều hoặc bón quá gần gốc gây cháy rễ. Bạn nên tưới nhiều nước để rửa bớt phân, ngưng bón thêm 7-10 ngày.',
        createdAt: '2026-04-05T10:15:00+07:00',
        likes: 8,
        isLiked: false,
      },
      {
        id: 'ccmt-004',
        authorId: 'farmer-002',
        authorName: 'Lê Văn Tài',
        authorRole: 'farmer',
        content: 'Mình cũng bị lần trước. Nguyên nhân là bón phân khi trời nắng gắt. Nên bón vào chiều mát và tưới ngay sau đó.',
        createdAt: '2026-04-05T14:00:00+07:00',
        likes: 5,
        isLiked: false,
      },
    ],
  },
  {
    id: 'cfpost-003',
    authorId: 'consumer-002',
    authorName: 'Lê Hoàng Nam',
    authorRole: 'consumer',
    title: 'Review cà chua Savior F1 từ trang trại Long Hòa',
    content: 'Mình vừa mua 2kg cà chua Savior F1 về ăn thử. Quả đỏ đều, chắc tay, vị ngọt thanh rất tự nhiên. Quét QR thấy cả quá trình trồng từ lúc gieo hạt. Rất hài lòng! Giá 35k/kg mình thấy OK với chất lượng này. Recommend cho mọi người!',
    tags: ['Cà chua', 'Review', 'Truy xuất'],
    createdAt: '2026-04-08T16:00:00+07:00',
    likes: 15,
    commentCount: 1,
    isLiked: true,
    comments: [
      {
        id: 'ccmt-005',
        authorId: 'consumer-001',
        authorName: 'Trần Thị Mai',
        authorRole: 'consumer',
        content: 'Mình cũng mua rồi, cà chua ngon thật! Nấu canh chua tuyệt vời luôn ạ 😋',
        createdAt: '2026-04-08T17:00:00+07:00',
        likes: 3,
        isLiked: false,
      },
    ],
  },
];

// Whitelist tags for consumer forum
export const CONSUMER_FORUM_TAGS = [
  'Rau muống', 'Cà chua', 'Dưa leo', 'Rau ăn lá', 'Rau gia vị',
  'Hữu cơ', 'VietGAP', 'Review', 'Mẹo mua hàng', 'Truy xuất',
  'Bệnh cây', 'Bón phân', 'Mô hình', 'Hỏi đáp', 'Chia sẻ',
];

// Product categories for filter
export const PRODUCT_CATEGORIES = [
  'Tất cả', 'Rau ăn lá', 'Rau ăn quả', 'Rau gia vị', 'Củ quả', 'Trái cây',
];

export const REGIONS = [
  'Tất cả', 'Cần Giờ, TP.HCM', 'Củ Chi, TP.HCM', 'Bình Chánh, TP.HCM', 'Hóc Môn, TP.HCM',
];

// Re-export for convenience
export { currentFarmer, seasons, diaryEntries, reviews, conversations, notifications };
