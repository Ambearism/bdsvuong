import React from 'react'
import { Flex, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export const renderSelectLoading = (menu: React.ReactNode, isLoading: boolean) => (
    <>
        {menu}
        {isLoading && (
            <Flex justify="center" align="center" className="py-2 border-t border-slate-50">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} size="small" />
                <span className="ml-2 text-xs text-slate-400">Đang tải thêm...</span>
            </Flex>
        )}
    </>
)
