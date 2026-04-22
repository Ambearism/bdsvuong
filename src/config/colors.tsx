export const colors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff4d4f',
    transparent: 'transparent',
    error: '#FF5A5F',
    gray01: '#223e4b',
    gray: '#666',
    grayLight: '#f0f0f0',
    yellow: '#ffaa00',
    green: '#52c41a',
    blue: '#1677ff',
    primary: '#1890ff',
    purple: '#722ed1',
    cyan: '#13c2c2',
    magenta: '#eb2f96',
    volcano: '#fa541c',
    orange: '#fa8c16',
    gold: '#faad14',
    lime: '#a0d911',
    carePrimary: '#1677ff',
    carePrimaryHover: '#0958d9',
    careLabel: '#64748b',
    careLabelLight: '#94a3b8',
    careActiveBg: '#edfcf5',
    emerald: '#10b981',
    rose: '#ef4444',
    amber: '#f59e0b',
    indigo: '#6366f1',
    violet: '#8b5cf6',
}

export const chartColors = {
    gridLine: '#E0E0E0',
    axisLine: '#D9D9D9',
    axisGrid: '#E5E7EB',
    deposit: '#6699FF',
    sold: '#66CC80',
    cancelled: '#FF8080',
    value: '#FFAD33',
}

export const COLOR_CLASS_MAP: Record<string, string> = {
    [colors.red]: `bg-[${colors.red}]`,
    [colors.green]: `bg-[${colors.green}]`,
    [colors.yellow]: `bg-[${colors.yellow}]`,
    [colors.blue]: `bg-[${colors.blue}]`,
}

export const CARE_COLOR_CLASSES = {
    primary: {
        text: `!text-[${colors.carePrimary}]`,
        bg: `!bg-[${colors.carePrimary}]`,
        border: `!border-[${colors.carePrimary}]`,
    },
    primaryHover: {
        text: `!text-[${colors.carePrimaryHover}]`,
        bg: `!bg-[${colors.carePrimaryHover}]`,
        border: `!border-[${colors.carePrimaryHover}]`,
        bgHover: `hover:!bg-[${colors.carePrimaryHover}]`,
        borderHover: `hover:!border-[${colors.carePrimaryHover}]`,
    },
    label: '!text-slate-500',
    labelLight: '!text-slate-400',
    activeBg: '!bg-emerald-50',
    activeText: '!text-emerald-700',
} as const
