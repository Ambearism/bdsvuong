import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import {
    Form,
    Input,
    InputNumber,
    Select,
    Flex,
    Typography,
    Avatar,
    Upload,
    Image,
    Button,
    message,
    type FormInstance,
} from 'antd'
import { CloseOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons'
import { MdBusiness, MdFavorite } from 'react-icons/md'
import { useGetAccountListQuery } from '@/api/account'
import { useGetCustomerListQuery } from '@/api/customer'
import { useDeleteCareCaseImageMutation } from '@/api/care-case'
import { useGetProductsLeaseOptionsQuery } from '@/api/product'
import { useDebounce } from '@/hooks/useDebounce'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import { app } from '@/config/app'
import { CARE_COLOR_CLASSES } from '@/config/colors'
import { UPLOAD } from '@/config/constant'
import { CustomerSelector, RealEstateSelector } from '@/components/care/CareCaseSelectors'
import type { CareCaseItem } from '@/types/care-case'
import type { CustomerItem } from '@/types/customer'

interface CareCaseFormProps {
    form: FormInstance
    isEdit?: boolean
    record?: CareCaseItem | null
    onOpenAddCustomerModal: () => void
    newlyCreatedCustomer?: CustomerItem | null
}

const CareCaseForm: React.FC<CareCaseFormProps> = ({
    form,
    isEdit = false,
    record,
    onOpenAddCustomerModal,
    newlyCreatedCustomer,
}) => {
    const [customerSearch, setCustomerSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')
    const [existingImages, setExistingImages] = useState<string[]>([])
    const debouncedCustomerSearch = useDebounce(customerSearch, 500)
    const debouncedProductSearch = useDebounce(productSearch, 500)

    const [deleteImage] = useDeleteCareCaseImageMutation()

    const handleRemoveExistingImage = useCallback(
        async (urlToRemove: string) => {
            if (!record?.id) return

            try {
                await deleteImage({ care_case_id: record.id, image_url: urlToRemove }).unwrap()
                setExistingImages(prev => prev.filter(url => url !== urlToRemove))
                message.success('Đã xoá ảnh thành công')
            } catch (err: unknown) {
                console.error(err)
                message.error('Xoá ảnh thất bại, vui lòng thử lại sau')
            }
        },
        [record?.id, deleteImage],
    )

    const { data: accountsData, isLoading: isLoadingAccounts } = useGetAccountListQuery(
        { page: app.DEFAULT_PAGE, per_page: app.FETCH_ALL, is_option: true },
        { refetchOnMountOrArgChange: true },
    )

    const [customerPage, setCustomerPage] = useState(app.DEFAULT_PAGE)
    const { data: customersData, isFetching: fetchingCustomers } = useGetCustomerListQuery(
        {
            keyword: debouncedCustomerSearch || undefined,
            page: customerPage,
            per_page: app.BIG_PAGE_SIZE,
            is_option: true,
        },
        { refetchOnMountOrArgChange: true },
    )

    const { accumulatedItems: customerOptionsData, handleScroll: handleCustomerScroll } = useSelectInfiniteScroll({
        items: (customersData?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string }>,
        isFetching: fetchingCustomers,
        debouncedKeyword: debouncedCustomerSearch,
        page: customerPage,
        setPage: setCustomerPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const [productPage, setProductPage] = useState(app.DEFAULT_PAGE)
    const { data: productsData, isFetching: fetchingProducts } = useGetProductsLeaseOptionsQuery(
        {
            keyword: debouncedProductSearch || undefined,
            page: productPage,
            per_page: app.BIG_PAGE_SIZE,
        },
        { refetchOnMountOrArgChange: true },
    )

    const { accumulatedItems: productOptionsData, handleScroll: handleProductScroll } = useSelectInfiniteScroll({
        items: (productsData?.data?.items ?? []) as Array<{ id: number; name?: string; product_code?: string }>,
        isFetching: fetchingProducts,
        debouncedKeyword: debouncedProductSearch,
        page: productPage,
        setPage: setProductPage,
        pageSize: app.BIG_PAGE_SIZE,
    })

    const customerValue = Form.useWatch('customer_id', form)
    const watchedRealEstate = Form.useWatch('related_bds', form)
    const realEstateValue = useMemo(
        () => (Array.isArray(watchedRealEstate) ? watchedRealEstate : []) as number[],
        [watchedRealEstate],
    )

    const customerMapRef = useRef<Map<number, { name: string; phone: string }>>(new Map())
    const productMapRef = useRef<Map<number, { name: string; product_code: string }>>(new Map())

    useEffect(() => {
        if (newlyCreatedCustomer?.id) {
            customerMapRef.current.set(newlyCreatedCustomer.id, {
                name: newlyCreatedCustomer.name,
                phone: newlyCreatedCustomer.phone,
            })
        }
    }, [newlyCreatedCustomer])

    useEffect(() => {
        customerOptionsData.forEach(customer => {
            customerMapRef.current.set(customer.id, {
                name: customer.name ?? '',
                phone: customer.phone ?? '',
            })
        })
    }, [customerOptionsData])

    useEffect(() => {
        productOptionsData.forEach(product => {
            productMapRef.current.set(product.id, {
                name: product.name ?? '',
                product_code: String(product.product_code ?? product.id),
            })
        })
    }, [productOptionsData])

    useEffect(() => {
        if (isEdit && record) {
            if (record.customer) {
                customerMapRef.current.set(record.customer.id, {
                    name: record.customer.name,
                    phone: record.customer.phone,
                })
            }
            if (record.product_info) {
                record.product_info.forEach(p => {
                    productMapRef.current.set(p.id, {
                        name: p.name,
                        product_code: p.product_code,
                    })
                })
            }
            if (Array.isArray(record.images)) {
                setExistingImages(record.images)
                form.setFieldValue('retained_images', record.images)
            }
        }
    }, [isEdit, record, form])

    const customerOptions = useMemo(() => {
        return customerOptionsData.map(customer => ({
            value: customer.id,
            label: `${customer.name} - ${customer.phone}`,
            name: customer.name,
            phone: customer.phone,
        }))
    }, [customerOptionsData])

    const customerOptionsWithSelected = useMemo(() => {
        if (newlyCreatedCustomer?.id && newlyCreatedCustomer.name) {
            customerMapRef.current.set(newlyCreatedCustomer.id, {
                name: newlyCreatedCustomer.name,
                phone: newlyCreatedCustomer.phone,
            })
        }
        const optionIds = new Set(customerOptions.map(option => option.value))
        const items = []
        if (customerValue && !optionIds.has(Number(customerValue))) {
            const customer =
                customerMapRef.current.get(Number(customerValue)) ||
                (newlyCreatedCustomer?.id === Number(customerValue) ? newlyCreatedCustomer : null)
            const label = customer
                ? `${customer.name || (customer as { full_name?: string }).full_name} - ${customer.phone}`
                : `#${customerValue}`
            items.push({ value: Number(customerValue), label, name: customer?.name, phone: customer?.phone })
        }
        return [...customerOptions, ...items]
    }, [customerOptions, customerValue, newlyCreatedCustomer])

    const renderCustomerChip = useCallback(
        (customerId: number, onRemove: () => void) => {
            const customer =
                customerMapRef.current.get(Number(customerId)) ||
                (newlyCreatedCustomer?.id === Number(customerId) ? newlyCreatedCustomer : null)
            const title = customer?.name || (customer as { full_name?: string })?.full_name || `#${customerId}`
            const subtitle = customer?.phone || ''
            const initial = title.charAt(0)?.toUpperCase() || app.EMPTY_DISPLAY

            return (
                <div
                    key={customerId}
                    className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 bg-slate-50">
                    <Flex align="center" gap={12} className="flex-1 min-w-0">
                        <Avatar size="small" className="!bg-blue-800 !font-bold shrink-0">
                            {initial}
                        </Avatar>
                        <span className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate text-slate-800">{title}</span>
                            {subtitle && <span className="text-xs truncate text-indigo-600">{subtitle}</span>}
                        </span>
                    </Flex>
                    <Flex align="center" gap={8}>
                        <span
                            className="cursor-pointer hover:text-red-500 shrink-0 text-lg leading-none text-slate-400"
                            onClick={onRemove}>
                            ×
                        </span>
                    </Flex>
                </div>
            )
        },
        [newlyCreatedCustomer],
    )

    const assigneeOptions = useMemo(
        () =>
            (accountsData?.data?.list ?? []).map(
                (account: { id: number; full_name?: string; account_name?: string }) => ({
                    value: account.id,
                    label: account.full_name || account.account_name,
                }),
            ),
        [accountsData],
    )

    const realEstateOptions = useMemo(() => {
        return productOptionsData.map(product => {
            const name = product.name ?? ''
            const shortName = name.length > 40 ? name.slice(0, 40) + '...' : name
            return {
                value: product.id,
                label: `${product.product_code || product.id} - ${shortName}`,
            }
        })
    }, [productOptionsData])

    const realEstateOptionsWithSelected = useMemo(() => {
        const optionIds = new Set(realEstateOptions.map(option => option.value))
        const extra = realEstateValue
            .filter((productId: number) => !optionIds.has(productId))
            .map((productId: number) => {
                const productInfo = productMapRef.current.get(productId)
                const label = productInfo ? `${productInfo.product_code} - ${productInfo.name}` : `#${productId}`
                return { value: productId, label }
            })
        return [...realEstateOptions, ...extra]
    }, [realEstateOptions, realEstateValue])

    const renderRealEstateChip = useCallback(
        (productId: number, onRemove: () => void) => {
            const product = productMapRef.current.get(Number(productId))
            const title = product?.name || `#${productId}`
            const code = product?.product_code || ''

            return (
                <div
                    key={productId}
                    className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 bg-white">
                    <Flex align="flex-start" gap={12} className="flex-1 min-w-0">
                        <MdBusiness className="text-slate-400 mt-1 shrink-0" size={18} />
                        <span className="flex flex-col min-w-0 flex-1">
                            <span className="text-[15px] font-medium text-slate-800 line-clamp-2">{title}</span>
                            <span className="text-[13px] uppercase text-slate-500 mt-0.5">
                                BĐS {code ? `• ${code}` : ''}
                            </span>
                        </span>
                    </Flex>
                    <span
                        className="cursor-pointer hover:text-red-500 shrink-0 text-lg leading-none text-slate-400 px-2"
                        onClick={onRemove}>
                        ×
                    </span>
                </div>
            )
        },
        [productMapRef],
    )

    return (
        <Form form={form} layout="vertical" className="mt-4">
            {isEdit && record && (
                <div className="mb-6">
                    <Typography.Text className="text-slate-500 text-xs">Mã Care</Typography.Text>
                    <div className="mt-1">
                        <Typography.Text strong className="text-base !text-slate-900">
                            {record.case_code}
                        </Typography.Text>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <Flex align="center" gap={8} className="mb-3 pt-2.5">
                    <UserOutlined className={`text-base ${CARE_COLOR_CLASSES.label}`} />
                    <Typography.Text strong className="text-base">
                        1. Chủ nhà / Khách hàng
                    </Typography.Text>
                </Flex>
                <Form.Item name="customer_id" className="!mb-0">
                    <CustomerSelector
                        customerSearch={setCustomerSearch}
                        isLoadingCustomers={fetchingCustomers}
                        customerOptions={customerOptionsWithSelected}
                        renderCustomerChip={renderCustomerChip}
                        onOpenAddCustomerModal={onOpenAddCustomerModal}
                        onPopupScroll={handleCustomerScroll}
                    />
                </Form.Item>
            </div>

            <div className="mb-6">
                <Flex align="center" gap={8} className="mb-3 pt-2.5">
                    <MdBusiness size={16} className={CARE_COLOR_CLASSES.label} />
                    <Typography.Text strong className="text-base">
                        2. Bất động sản liên quan
                    </Typography.Text>
                </Flex>
                <Form.Item name="related_bds" className="!mb-0" initialValue={[]}>
                    <RealEstateSelector
                        productSearch={setProductSearch}
                        isLoadingProducts={fetchingProducts}
                        realEstateOptionsWithSelected={realEstateOptionsWithSelected}
                        renderRealEstateChip={renderRealEstateChip}
                        onPopupScroll={handleProductScroll}
                    />
                </Form.Item>
            </div>

            <div className="mb-6">
                <Flex align="center" gap={8} className="mb-3 pt-2.5">
                    <MdFavorite size={16} className={CARE_COLOR_CLASSES.label} />
                    <Typography.Text strong className="text-base">
                        3. Phân bổ & Ghi chú
                    </Typography.Text>
                </Flex>

                <Form.Item label="Người phụ trách (Assignee)" name="assigned_to" className="mb-4">
                    <Select
                        placeholder="Chọn nhân viên CSKH..."
                        className="!h-10"
                        showSearch
                        optionFilterProp="label"
                        loading={isLoadingAccounts}
                        options={assigneeOptions}
                        allowClear
                    />
                </Form.Item>

                <Form.Item label="Phí Care thực tế" name="care_fee" className="mb-4">
                    <InputNumber
                        placeholder="Nhập phí care..."
                        className="!h-10 !w-full"
                        min={0}
                        controls={false}
                        precision={0}
                        addonAfter="TR/Tháng"
                    />
                </Form.Item>

                <div className="mb-4">
                    {isEdit && existingImages.length > 0 && (
                        <div className="mb-3">
                            <Typography.Text className="text-xs !text-slate-500 block mb-1">
                                Ảnh hiện tại:
                            </Typography.Text>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {existingImages.map((url, idx) => (
                                    <div
                                        key={`${url}-${idx}`}
                                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-slate-100">
                                        <Image
                                            src={url}
                                            alt={`Hình ảnh hợp đồng ${idx + 1}`}
                                            width="100%"
                                            className="block rounded-lg"
                                            style={{ height: 128, objectFit: 'cover' }}
                                        />
                                        <Button
                                            type="text"
                                            shape="circle"
                                            aria-label={`Xóa ảnh ${idx + 1}`}
                                            icon={<CloseOutlined className="text-[10px]" />}
                                            className="!absolute !top-2 !right-2 !z-10 !w-7 !h-7 !rounded-full !bg-white/90 !text-slate-500 shadow-sm transition hover:!text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                                            onClick={event => {
                                                event.stopPropagation()
                                                handleRemoveExistingImage(url)
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <Form.Item
                        label="Hình ảnh hợp đồng"
                        name="images"
                        valuePropName="fileList"
                        getValueFromEvent={event => (Array.isArray(event) ? event : (event?.fileList ?? []))}
                        className="mb-4 [&_.ant-upload-list-item-name]:!cursor-default [&_.ant-upload-list-item-thumbnail]:!cursor-default">
                        <Upload.Dragger
                            multiple
                            accept={UPLOAD.IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                            beforeUpload={() => false}
                            onPreview={file => {
                                if (!file.url) return
                                window.open(file.url, '_blank')
                            }}
                            listType="picture">
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Chọn ảnh đính kèm</p>
                        </Upload.Dragger>
                    </Form.Item>
                </div>

                <Form.Item
                    label="Ghi chú mở đầu / Tình trạng hiện tại"
                    name="note"
                    className="mb-0"
                    rules={[{ max: 1000, message: 'Ghi chú không được vượt quá 1000 ký tự' }]}>
                    <Input.TextArea
                        rows={4}
                        maxLength={1000}
                        showCount
                        placeholder="Mô tả tóm tắt lý do mở Care hoặc các vấn đề cần lưu ý đặc biệt từ chủ nhà..."
                        className="!resize-none"
                    />
                </Form.Item>
            </div>
        </Form>
    )
}

export default CareCaseForm
