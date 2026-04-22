import { Project, ProjectProperty } from '../types';

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'PRJ1001',
        name: 'Khu đô thị mới Phú Lương',
        alias: 'khu-do-thi-moi-phu-luong',
        province: 'Hà Nội',
        district: 'Hà Đông',
        address: 'Đường Kiến Hưng, Hà Đông, P. Hà Nội',
        type: 'Khu đô thị',
        assignee: 'Nguyen Van A',
        status: 'Đang mở bán',
        isVisible: true,
        isFeatured: true,
        developer: 'Công ty Cổ phần đầu tư Hải Phát',
        totalArea: '363,000',
        totalUnits: 0,
        totalBlocks: 3,
        blockHeight: '30 - 35 tầng',
        elevatorsPerBlock: '12 thang/tòa',
        propertyTypes: 'Căn hộ, Liền kề, Biệt thự',
        constructionDensity: '30%',
        legalStatus: 'Sổ hồng lâu dài',
        designStandardMin: 45,
        designStandardMax: 120,
        startingPrice: 32,
        pricePerSqm: 32.5,
        hotline: '0988123456',
        fanpage: 'https://facebook.com/phuluong',
        description: 'Khu đô thị mới Phú Lương nằm trên khu đất có tổng diện tích 34,1ha. Trong đó bao gồm nhà cao tầng, nhà liền kề, biệt thự; đất công trình công cộng có diện tích; đất cây xanh công viên và diện tích đất giao thông.\n\nHình thức sử dụng đất: Nhà nước giao đất có thu tiền sử dụng đất. Người mua nhà ở gắn liền với quyền sử dụng đất được sử dụng đất ổn định lâu dài.\n\nTrong đó:\n- 4,952 m2 đất để xây dựng Trung tâm thương mại dịch vụ.\n- 10,604m2 đất làm hạ tầng kỹ thuật của 2 Chung cư cao tầng.',
        highlightLinks: [
            { title: 'Video giới thiệu dự án', url: 'https://youtube.com/watch?v=123' },
            { title: 'Trải nghiệm 360', url: 'https://view360.vn' }
        ],
        totalZones: 3,
        createdAt: '2023-01-15T08:30:00Z',
        updatedAt: '2024-02-20T10:15:00Z',
        coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
        images: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80',
            'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&q=80'
        ]
    },
    {
        id: 'PRJ1002',
        name: 'Masteri West Heights',
        alias: 'masteri-west-heights',
        province: 'Hà Nội',
        district: 'Nam Từ Liêm',
        address: 'Tây Mỗ, Nam Từ Liêm, Hà Nội',
        type: 'Căn hộ / Chung cư',
        assignee: 'Bui Thi B',
        status: 'Đang bàn giao',
        isVisible: true,
        isFeatured: false,
        developer: 'Masterise Homes',
        totalArea: '210,000',
        totalUnits: 650,
        totalBlocks: 4,
        blockHeight: '38 tầng',
        elevatorsPerBlock: '8 thang/tòa',
        propertyTypes: 'Căn hộ',
        constructionDensity: '33%',
        legalStatus: 'Sổ hồng',
        startingPrice: 55,
        pricePerSqm: 65,
        totalZones: 2,
        createdAt: '2023-05-10T09:00:00Z',
        updatedAt: '2024-01-05T14:45:00Z',
    },
    {
        id: 'PRJ1003',
        name: 'The Matrix One',
        alias: 'the-matrix-one',
        province: 'Hà Nội',
        district: 'Nam Từ Liêm',
        address: 'Lê Quang Đạo, Nam Từ Liêm, Hà Nội',
        type: 'Căn hộ / Chung cư',
        assignee: 'Tran Van C',
        status: 'Sắp mở bán',
        isVisible: true,
        isFeatured: false,
        developer: 'MIK Group',
        totalArea: '390,000',
        totalUnits: 400,
        totalBlocks: 2,
        blockHeight: '44 tầng',
        propertyTypes: 'Căn hộ cao cấp',
        totalZones: 1,
        createdAt: '2022-11-20T10:00:00Z',
        updatedAt: '2023-12-10T16:20:00Z',
    }
];

export const MOCK_PROJECT_PROPERTIES: ProjectProperty[] = [
    {
        id: 'P1-1001',
        projectId: 'PRJ1001',
        name: 'Căn hộ Studio S1.01',
        unitNo: 'S1.01-05A',
        block: 'S1',
        zone: 'Sapphire 1',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80',
    },
    {
        id: 'P1-1002',
        projectId: 'PRJ1001',
        name: 'Căn hộ 2PN S2.02',
        unitNo: 'S2.02-12B',
        block: 'S2',
        zone: 'Sapphire 2',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1e52504441?w=500&q=80',
    },
    {
        id: 'P1-1003',
        projectId: 'PRJ1001',
        name: 'Căn hộ 3PN S3.03',
        unitNo: 'S3.03-35',
        block: 'S3',
        zone: 'Sapphire 3',
        image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80',
    },
    {
        id: 'P2-1001',
        projectId: 'PRJ1002',
        name: 'Căn hộ Studio West A',
        unitNo: 'WA-08',
        block: 'West A',
        zone: 'Khu A',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80',
    },
    {
        id: 'P2-1002',
        projectId: 'PRJ1002',
        name: 'Căn hộ 1PN West B',
        unitNo: 'WB-15',
        block: 'West B',
        zone: 'Khu B',
        image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80',
    },
    {
        id: 'P3-1001',
        projectId: 'PRJ1003',
        name: 'Căn hộ 2PN The Matrix',
        unitNo: 'M1-22A',
        block: 'Tòa M1',
        zone: 'Khu M',
        image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&q=80',
    }
];

export const getProjects = async (): Promise<Project[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PROJECTS), 500);
    });
};

export const getProjectProperties = async (projectId: string): Promise<ProjectProperty[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_PROJECT_PROPERTIES.filter(p => p.projectId === projectId));
        }, 500);
    });
};

export const getProjectById = async (id: string): Promise<Project | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const project = MOCK_PROJECTS.find(p => p.id === id);
            resolve(project || null);
        }, 500);
    });
};
