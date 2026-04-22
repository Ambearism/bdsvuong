import React from 'react'
import { Select, Button, Flex, Avatar } from 'antd'
import { UserAddOutlined, CheckOutlined } from '@ant-design/icons'
import { MdBusiness } from 'react-icons/md'
import { app } from '@/config/app'
import type { CustomerSelectOption, RealEstateSelectOption } from '@/types/care-case'
import { renderSelectLoading } from '@/utils/render-utils'

const renderCustomerOption = (option: CustomerSelectOption) => (
    <Flex align="center" gap={8}>
        <Avatar size="small" className="!bg-blue-800 !font-bold shrink-0">
            {(option.data.name as string)?.charAt(0)?.toUpperCase() ?? app.EMPTY_DISPLAY}
        </Avatar>
        <span>
            {option.data.name && <span>{option.data.name as string}</span>}
            {option.data.phone && (
                <span className="text-indigo-600 font-medium">
                    {option.data.name ? app.EMPTY_DISPLAY : ''}
                    {option.data.phone as string}
                </span>
            )}
            {!option.data.name && !option.data.phone && option.data.label}
        </span>
    </Flex>
)

const renderRealEstateOption = (option: RealEstateSelectOption, selectedIds: number[]) => {
    const isSelected = selectedIds.includes(option.value as number)
    return (
        <Flex align="center" justify="space-between" className={`w-full ${isSelected ? 'bg-blue-50/50' : ''}`}>
            <Flex align="center" gap={8}>
                <MdBusiness size={14} className={`${isSelected ? 'text-blue-500' : 'text-slate-400'} shrink-0`} />
                <span className={isSelected ? 'font-medium text-blue-700' : ''}>{option.data.label as string}</span>
            </Flex>
            {isSelected && <CheckOutlined className="text-blue-600" />}
        </Flex>
    )
}

interface CustomerSelectorProps {
    value?: number
    onChange?: (value: number | undefined) => void
    customerSearch: (keyword: string) => void
    isLoadingCustomers: boolean
    customerOptions: Array<{ value: number; label: string; name?: string; phone?: string }>
    renderCustomerChip: (id: number, onRemove: () => void) => React.ReactNode
    onOpenAddCustomerModal: () => void
    onPopupScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    value,
    onChange,
    customerSearch,
    isLoadingCustomers,
    customerOptions,
    renderCustomerChip,
    onOpenAddCustomerModal,
    onPopupScroll,
}) => (
    <div className="w-full">
        {value != null && (
            <div className="w-full mb-3">
                {renderCustomerChip(value, () => {
                    onChange?.(undefined)
                    customerSearch('')
                })}
            </div>
        )}
        <Flex gap={8} className="w-full">
            <Select
                className="flex-1 !h-10"
                placeholder="Tìm kiếm hoặc chọn chủ nhà..."
                value={value}
                onChange={selectedValue => {
                    onChange?.(selectedValue ?? undefined)
                    customerSearch('')
                }}
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={false}
                onSearch={customerSearch}
                onClear={() => customerSearch('')}
                loading={isLoadingCustomers}
                options={customerOptions}
                onPopupScroll={onPopupScroll}
                onOpenChange={open => {
                    if (!open) customerSearch('')
                }}
                popupRender={menu => renderSelectLoading(menu, isLoadingCustomers)}
                optionRender={renderCustomerOption}
            />
            <Button icon={<UserAddOutlined />} className="!h-10 !w-10 !p-0" onClick={onOpenAddCustomerModal} />
        </Flex>
    </div>
)

interface RealEstateSelectorProps {
    value?: number[]
    onChange?: (value: number[]) => void
    productSearch: (keyword: string) => void
    isLoadingProducts: boolean
    realEstateOptionsWithSelected: Array<{ value: number; label: string }>
    renderRealEstateChip?: (id: number, onRemove: () => void) => React.ReactNode
    onPopupScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

export const RealEstateSelector: React.FC<RealEstateSelectorProps> = ({
    value = [],
    onChange,
    productSearch,
    isLoadingProducts,
    realEstateOptionsWithSelected,
    renderRealEstateChip,
    onPopupScroll,
}) => (
    <div className="w-full">
        <Select
            className="flex-1 !h-10 w-full mb-3"
            placeholder="Thêm BĐS khác vào care này..."
            value={undefined}
            onChange={selectedValue => {
                if (selectedValue) {
                    if (value.includes(selectedValue)) {
                        onChange?.(value.filter(id => id !== selectedValue))
                    } else {
                        onChange?.([...value, selectedValue])
                    }
                }
                productSearch('')
            }}
            showSearch
            allowClear
            optionFilterProp="label"
            filterOption={false}
            onSearch={productSearch}
            onClear={() => productSearch('')}
            loading={isLoadingProducts}
            options={realEstateOptionsWithSelected}
            onPopupScroll={onPopupScroll}
            onOpenChange={open => {
                if (!open) productSearch('')
            }}
            popupRender={menu => renderSelectLoading(menu, isLoadingProducts)}
            optionRender={option => renderRealEstateOption(option as RealEstateSelectOption, value)}
        />
        {value.length > 0 && renderRealEstateChip && (
            <div className="flex flex-col gap-3">
                {value.map(id =>
                    renderRealEstateChip(id, () => {
                        onChange?.(value.filter(existingId => existingId !== id))
                    }),
                )}
            </div>
        )}
    </div>
)
