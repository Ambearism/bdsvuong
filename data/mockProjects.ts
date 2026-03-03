import { Project, ProjectProperty } from '../types';

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'PRJ1001',
        name: 'Vinhomes Smart City',
        totalZones: 3,
        totalBlocks: 8,
        totalUnits: 1200,
        createdAt: '2023-01-15T08:30:00Z',
        updatedAt: '2024-02-20T10:15:00Z',
    },
    {
        id: 'PRJ1002',
        name: 'Masteri West Heights',
        totalZones: 2,
        totalBlocks: 4,
        totalUnits: 650,
        createdAt: '2023-05-10T09:00:00Z',
        updatedAt: '2024-01-05T14:45:00Z',
    },
    {
        id: 'PRJ1003',
        name: 'The Matrix One',
        totalZones: 1,
        totalBlocks: 2,
        totalUnits: 400,
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
