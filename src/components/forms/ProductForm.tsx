import { useGetCustomerListQuery } from '@/api/customer'
import { useGetExploreSearchInfoQuery } from '@/api/explore'
import { useGetProjectListQuery } from '@/api/project'
import { useGetEnumOptionsQuery } from '@/api/types'
import { useGetProvinceListQuery, useGetWardsByProvinceIdQuery } from '@/api/zone'
import { IMAGE_TYPE, PRODUCT_TYPE, PRODUCT_TYPE_ID, EXPLORE_ENABLED_TYPES } from '@/config/constant'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import { usePermission } from '@/hooks/usePermission'
import type { ProductItem } from '@/types/product'
import { Button, Card, Col, Form, Row, message, Space, Tabs } from 'antd'
import type { FormInstance } from 'antd/es/form'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useProductFieldGroups } from '@/hooks/useProductFieldGroups'
import { useSelectInfiniteScroll } from '@/hooks/useSelectInfiniteScroll'
import AddCustomerModal from '@/components/customers/AddCustomerModal'
import FacilityGroupCard from '@/components/products/FacilityGroupCard'
import PriceInfoCard from '@/components/products/PriceInfoCard'
import ProviderInfoCard from '@/components/products/ProviderInfoCard'
import RealEstateInfoCard from '@/components/products/RealEstateInfoCard'
import ApartmentDetailCard from '@/components/products/info-details/ApartmentDetailCard'
import KioskDetailCard from '@/components/products/info-details/KioskDetailCard'
import LandDetailCard from '@/components/products/info-details/LandDetailCard'
import PrivateHouseDetailCard from '@/components/products/info-details/PrivateHouseDetailCard'
import ResortDetailCard from '@/components/products/info-details/ResortDetailCard'
import TownHouseDetailCard from '@/components/products/info-details/TownHouseDetailCard'
import { app } from '@/config/app'
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface'
import ProductToImage360Tab from '@/components/image-360/tab-link-image-360/ProductToImage360Tab'
import { BaseMessage } from '@/components/base/BaseMessage'
import ProductToTourTab from '@/components/link-manager/ProductToTourTab'
import ImageProduct from '@/components/products/images/ImageProduct'
import BaseLocation from '@/components/base/BaseLocation'
import BaseImageUpload from '@/components/base/BaseImageUpload'
import SeoFormInputs from '@/components/seo-form-inputs'
import { TextEditor } from '@/components/tiptap'
import {
    useLazyCheckDuplicateIdentifierCodeQuery,
    useLazyCheckDuplicateProductCodeQuery,
    useLazyCheckDuplicateQuery,
} from '@/api/product'
import { useGetAccountOptionsQuery } from '@/api/account'

type ProductFormValues = Omit<ProductItem, 'send_date'> & {
    send_date?: Dayjs
}

type ProductFormProps = {
    onFinish?: (values: Partial<ProductItem>) => void
    form?: FormInstance<Partial<ProductFormValues>>
    initialValues?: ProductItem
    onValuesChange?: () => void
    showProductCode?: boolean
}

const compactUndefined = <T extends Record<string, unknown>>(obj: T): T => {
    const out = { ...obj }
    Object.keys(out).forEach(k => {
        if (out[k] === undefined) delete out[k]
    })
    return out
}

const ProductForm = ({
    onFinish,
    form: externalForm,
    initialValues,
    onValuesChange,
    showProductCode,
}: ProductFormProps) => {
    const [internalForm] = Form.useForm<Partial<ProductFormValues>>()
    const form = externalForm ?? internalForm
    const { hasPermission } = usePermission()
    const [activeTab, setActiveTab] = useState('provider-info')
    const [productId, setProductId] = useState<number | undefined>(initialValues?.id)
    const submitVisibleTabs = [
        'provider-info',
        'real-estate-info',
        'price-info',
        'detail-info',
        'facility-group-info',
        'location',
        'seo',
        'note',
    ]

    const {
        providerInfoField,
        realEstateInfoField,
        priceInfoField,
        apartmentDetailField,
        kioskDetailField,
        landDetailField,
        privateHouseDetailField,
        resortDetailField,
        townHouseDetailField,
    } = useProductFieldGroups()

    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [isReferrer, setIsReferrer] = useState<boolean>(!!initialValues?.ref_id)

    const [triggerCheckDuplicate] = useLazyCheckDuplicateQuery()
    const [triggerCheckDuplicateIdentifierCode] = useLazyCheckDuplicateIdentifierCodeQuery()
    const [triggerCheckDuplicateProductCode] = useLazyCheckDuplicateProductCodeQuery()
    const { data: enumData } = useGetEnumOptionsQuery([
        'product_status',
        'product_types',
        'supplier_types',
        'direction_types',
        'fit_types',
        'furniture_types',
        'convenient_types',
        'transaction_types',
        'sell_status',
        'rent_status',
    ])

    const [province, setProvince] = useState<number | undefined>(undefined)
    const [ward, setWard] = useState<number | undefined>(undefined)
    const [project, setProject] = useState<number | undefined>(undefined)
    const [isExploreMode, setIsExploreMode] = useState(false)

    const divVal = Form.useWatch('divisive', form)
    const aptVal = Form.useWatch('apartment', form)
    const watchedDivisive = useMemo(() => (divVal || aptVal)?.toString(), [divVal, aptVal])

    const parcelVal = Form.useWatch('parcel', form)
    const floorVal = Form.useWatch('number_floor', form)
    const watchedParcel = useMemo(() => {
        if (parcelVal) return parcelVal.toString()
        if (floorVal !== undefined && floorVal !== null) return floorVal.toString()
        return undefined
    }, [parcelVal, floorVal])

    const productTypeOptions = useMemo(() => enumData?.data?.product_types || [], [enumData])
    const typeProductId = Form.useWatch<number>('type_product_id', form)
    const typeProductLabel = useMemo(
        () => productTypeOptions.find(opt => opt.value === typeProductId)?.label,
        [typeProductId, productTypeOptions],
    )

    const activeDetailFields = useMemo(() => {
        switch (typeProductId) {
            case PRODUCT_TYPE_ID.APARTMENT:
                return apartmentDetailField
            case PRODUCT_TYPE_ID.TOWNHOUSE:
            case PRODUCT_TYPE_ID.VILLA:
                return townHouseDetailField
            case PRODUCT_TYPE_ID.PRIVATE_HOUSE:
                return privateHouseDetailField
            case PRODUCT_TYPE_ID.LAND:
            case PRODUCT_TYPE_ID.FARM_VILLA:
            case PRODUCT_TYPE_ID.OTHER:
                return landDetailField
            case PRODUCT_TYPE_ID.KIOSK:
                return kioskDetailField
            case PRODUCT_TYPE_ID.RESORT:
                return resortDetailField
            default:
                return apartmentDetailField
        }
    }, [
        typeProductId,
        apartmentDetailField,
        townHouseDetailField,
        privateHouseDetailField,
        landDetailField,
        kioskDetailField,
        resortDetailField,
    ])

    const skipExplore = !project || !typeProductId || !isExploreMode

    const { data: divisiveData, isFetching: isFetchingDivisive } = useGetExploreSearchInfoQuery(
        { project_id: project!, type_id: typeProductId! },
        { skip: skipExplore },
    )

    const { data: parcelData, isFetching: isFetchingParcel } = useGetExploreSearchInfoQuery(
        { project_id: project!, type_id: typeProductId!, divisive: watchedDivisive as string },
        { skip: skipExplore || !watchedDivisive },
    )

    const { data: numberData, isFetching: isFetchingNumber } = useGetExploreSearchInfoQuery(
        {
            project_id: project!,
            type_id: typeProductId!,
            divisive: watchedDivisive as string,
            parcel: watchedParcel as string,
        },
        { skip: skipExplore || !watchedDivisive || !watchedParcel },
    )

    const { data: provinceData, isLoading: loadingProvince } = useGetProvinceListQuery({ is_option: true })
    const { data: wardData, isLoading: loadingWard } = useGetWardsByProvinceIdQuery(
        { province_id: province!, is_option: true },
        { skip: !province },
    )
    const { data: projectData, isLoading: loadingProject } = useGetProjectListQuery(
        {
            page: app.DEFAULT_PAGE,
            per_page: app.BIG_PAGE_SIZE,
            zone_province_id: province,
            zone_ward_id: ward,
            is_option: true,
        },
        { skip: !province || !ward },
    )

    const [searchValue, setSearchValue] = useState('')
    const [keyword, setKeyword] = useState('')
    useEffect(() => {
        const t = setTimeout(() => setKeyword(searchValue), 300)
        return () => clearTimeout(t)
    }, [searchValue])

    const { data: expertData, isFetching: loadingExperts } = useGetAccountOptionsQuery({
        page: app.DEFAULT_PAGE,
        per_page: app.FETCH_ALL,
    })

    const [customerPage, setCustomerPage] = useState(app.DEFAULT_PAGE)
    const { data: customerOptionsData, isFetching: loadingCustomer } = useGetCustomerListQuery({
        page: customerPage,
        per_page: app.BIG_PAGE_SIZE,
        is_option: true,
        keyword: keyword || undefined,
    })
    const { accumulatedItems: customerAccumulatedOptions, handleScroll: handleCustomerScroll } =
        useSelectInfiniteScroll({
            items: (customerOptionsData?.data?.items ?? []) as Array<{ id: number; name?: string; phone?: string }>,
            isFetching: loadingCustomer,
            debouncedKeyword: keyword,
            page: customerPage,
            setPage: setCustomerPage,
            pageSize: app.BIG_PAGE_SIZE,
        })

    const watchedCustomerId = Form.useWatch('customer_id', form)
    const watchedRefId = Form.useWatch('ref_id', form)

    const customerMapRef = useRef<Map<number, { name?: string; phone?: string }>>(new Map())

    useEffect(() => {
        customerAccumulatedOptions.forEach(item => {
            customerMapRef.current.set(item.id, { name: item.name, phone: item.phone })
        })
    }, [customerAccumulatedOptions])

    const customerOptions = useMemo(() => {
        const options = customerAccumulatedOptions.map(item => ({
            label: `[${item.id}] ${item.phone || ''} - ${item.name || ''}`,
            value: item.id,
        }))

        const selectedIds = [watchedCustomerId, watchedRefId].filter(Boolean) as number[]
        selectedIds.forEach(id => {
            if (!options.some(option => option.value === id)) {
                const selected = customerMapRef.current.get(id)
                options.push({
                    value: id,
                    label: selected ? `[${id}] ${selected.phone || ''} - ${selected.name || ''}` : `#${id}`,
                })
            }
        })

        return options
    }, [customerAccumulatedOptions, watchedCustomerId, watchedRefId])

    const expertOptions = useMemo(() => {
        return expertData?.data?.items || []
    }, [expertData])

    useEffect(() => {
        if (!initialValues) return
        const { send_date, ...rest } = initialValues
        const dataProduct: Partial<ProductFormValues> = {
            ...structuredClone(rest),
            send_date: send_date ? dayjs(send_date) : undefined,
        }

        setProvince(dataProduct.zone_province_id)
        setWard(dataProduct.zone_ward_id)
        setProject(dataProduct.project_id ?? undefined)
        setProductId(initialValues.id)

        form.setFieldsValue({ ...dataProduct })
        setIsReferrer(!!dataProduct.ref_id)
    }, [initialValues, form])

    useEffect(() => {
        if (!isReferrer) {
            form.setFieldsValue({ ref_id: undefined })
        }
    }, [isReferrer, form])

    useEffect(() => {
        const selectedProject = projectData?.data?.items?.find(projectItem => projectItem.id === project)
        const shouldBeExplore = !!selectedProject?.is_explore && EXPLORE_ENABLED_TYPES.includes(typeProductId!)

        if (shouldBeExplore !== isExploreMode) {
            setIsExploreMode(shouldBeExplore)
        }
    }, [project, typeProductId, projectData, isExploreMode])

    const handleProjectChange = (projId: number | undefined) => {
        setProject(projId)
        form.setFieldsValue({
            project_id: projId,
            divisive: undefined,
            parcel: undefined,
            apartment: undefined,
            number_floor: undefined,
            number: undefined,
        })
    }

    const isSearchingInfo = isFetchingDivisive || isFetchingParcel || isFetchingNumber

    const explorerProps = useMemo(
        () => ({
            isExploreMode,
            divisiveOptions: (divisiveData?.data || []).map(item => ({ label: item.label, value: item.label })),
            parcelOptions: (parcelData?.data || []).map(item => ({ label: item.label, value: item.label })),
            numberOptions: (numberData?.data || []).map(item => ({ label: item.label, value: item.label })),
            onDivisiveChange: () => {
                form.setFieldsValue({
                    parcel: undefined,
                    number_floor: undefined,
                    number: undefined,
                })
            },
            onParcelChange: () => {
                form.setFieldsValue({ number: undefined })
            },
            isSearchingInfo,
        }),
        [isExploreMode, divisiveData, parcelData, numberData, isSearchingInfo, form],
    )

    const DetailComponent = useMemo(() => {
        switch (typeProductLabel) {
            case PRODUCT_TYPE.APARTMENT:
                return <ApartmentDetailCard directionOptions={enumData?.data?.direction_types} {...explorerProps} />
            case PRODUCT_TYPE.TOWNHOUSE:
                return <TownHouseDetailCard directionOptions={enumData?.data?.direction_types} {...explorerProps} />
            case PRODUCT_TYPE.VILLA:
                return <TownHouseDetailCard directionOptions={enumData?.data?.direction_types} {...explorerProps} />
            case PRODUCT_TYPE.PRIVATE_HOUSE:
                return <PrivateHouseDetailCard directionOptions={enumData?.data?.direction_types} />
            case PRODUCT_TYPE.LAND:
                return <LandDetailCard directionOptions={enumData?.data?.direction_types} />
            case PRODUCT_TYPE.FARM_VILLA:
                return <LandDetailCard directionOptions={enumData?.data?.direction_types} />
            case PRODUCT_TYPE.OTHER:
                return <LandDetailCard directionOptions={enumData?.data?.direction_types} />
            case PRODUCT_TYPE.KIOSK:
                return <KioskDetailCard directionOptions={enumData?.data?.direction_types} {...explorerProps} />
            case PRODUCT_TYPE.RESORT:
                return <ResortDetailCard />
            default:
                return <ApartmentDetailCard directionOptions={enumData?.data?.direction_types} {...explorerProps} />
        }
    }, [typeProductLabel, enumData, explorerProps])

    const handleFinish = async (values: Partial<ProductFormValues>) => {
        const normalizedIdentifierCode = values.identifier_code?.trim()
        const normalizedProductCode = values.product_code?.trim()

        if (normalizedIdentifierCode) {
            try {
                const { data } = await triggerCheckDuplicateIdentifierCode({
                    action: productId ? 'update' : 'create',
                    identifier_code: normalizedIdentifierCode,
                    product_id: productId,
                })

                const isDuplicated = !!data?.data?.duplicate
                if (isDuplicated) {
                    form.setFields([
                        {
                            name: 'identifier_code',
                            errors: ['Mã định danh đã tồn tại'],
                        },
                    ])
                    setActiveTab('provider-info')
                    message.error('Mã định danh đã tồn tại')
                    return
                }
            } catch {
                message.error('Không thể kiểm tra trùng lặp mã định danh, vui lòng thử lại')
                return
            }
        }

        if (normalizedProductCode) {
            try {
                const { data } = await triggerCheckDuplicateProductCode({
                    action: productId ? 'update' : 'create',
                    product_code: normalizedProductCode,
                    product_id: productId,
                })

                const isDuplicated = !!data?.data?.duplicate
                if (isDuplicated) {
                    form.setFields([
                        {
                            name: 'product_code',
                            errors: ['Mã hàng hoá đã tồn tại'],
                        },
                    ])
                    setActiveTab('provider-info')
                    message.error('Mã hàng hoá đã tồn tại')
                    return
                }
            } catch {
                message.error('Không thể kiểm tra trùng lặp mã hàng hoá, vui lòng thử lại')
                return
            }
        }

        const payload: Partial<ProductItem> = compactUndefined({
            ...values,
            project_id: values.project_id ?? null,
            product_code: normalizedProductCode,
            identifier_code: normalizedIdentifierCode,
            send_date: values.send_date?.format('YYYY-MM-DD'),
            rate: typeof values.rate === 'number' ? values.rate : 0,
        })

        if (values.number && typeProductId) {
            const { data: checkDuplicateData } = await triggerCheckDuplicate({
                action: productId ? 'update' : 'create',
                number: values.number.trim(),
                type_product_id: typeProductId,
                type_transaction_id: values.type_transaction_id,
                apartment: values.apartment?.trim(),
                divisive: values.divisive?.trim(),
                number_floor: values.number_floor ? Number(values.number_floor) : undefined,
                parcel: values.parcel?.trim(),
                product_id: productId ? Number(productId) : undefined,
                project_id: values.project_id ?? undefined,
                zone_province_id: values.zone_province_id,
                zone_ward_id: values.zone_ward_id,
            })

            if (checkDuplicateData?.data?.duplicate) {
                form.setFields([
                    {
                        name: 'number',
                        errors: ['Địa chỉ số căn này đã tồn tại'],
                    },
                ])

                setActiveTab('price-info')
                message.error('Mã hàng này bị trùng lặp thông tin')
                return
            }
        }

        onFinish?.(payload)
    }

    const tabItems = [
        {
            key: 'provider-info',
            fields: [...providerInfoField, ...realEstateInfoField] as string[],
            forceRender: true,
            label: 'Thông tin chung',
            children: (
                <>
                    <Card size="small" className="!rounded-tl-none mb-4">
                        <ProviderInfoCard
                            form={form}
                            supplierOptions={enumData?.data?.supplier_types}
                            transactionTypeOptions={enumData?.data?.transaction_types}
                            customerOptions={customerOptions}
                            sellStatusOptions={enumData?.data?.sell_status}
                            rentStatusOptions={enumData?.data?.rent_status}
                            loadingExperts={loadingExperts}
                            expertOptions={expertOptions}
                            loadingCustomer={loadingCustomer}
                            isReferrer={isReferrer}
                            setIsReferrer={setIsReferrer}
                            setSearchValue={setSearchValue}
                            setShowCustomerModal={setShowCustomerModal}
                            onCustomerScroll={handleCustomerScroll}
                        />
                    </Card>

                    <Card size="small" className="!rounded-tl-none mb-4">
                        <RealEstateInfoCard
                            form={form}
                            productTypeOptions={enumData?.data?.product_types}
                            province={province}
                            ward={ward}
                            project={project}
                            loadingProvince={loadingProvince}
                            loadingWard={loadingWard}
                            loadingProject={loadingProject}
                            provinceData={provinceData}
                            wardData={wardData}
                            projectData={projectData}
                            setProvince={v => {
                                setProvince(v)
                                setWard(undefined)
                                setProject(undefined)
                                form.setFieldsValue({
                                    zone_province_id: v,
                                    zone_ward_id: undefined,
                                    project_id: undefined,
                                })
                            }}
                            setWard={v => {
                                setWard(v)
                                setProject(undefined)
                                form.setFieldsValue({
                                    zone_ward_id: v,
                                    project_id: undefined,
                                })
                            }}
                            setProject={handleProjectChange}
                            showProductCode={showProductCode}
                        />
                    </Card>
                </>
            ),
        },
        {
            key: 'price-info',
            fields: [...priceInfoField, ...activeDetailFields] as string[],
            forceRender: true,
            label: 'Thông tin chi tiết',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Card size="small" className="!rounded-tl-none mb-4 h-full">
                            <PriceInfoCard productStatusOptions={enumData?.data.product_status} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" className="!rounded-tl-none mb-4 h-full">
                            {DetailComponent}
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'facility-group-info',
            fields: ['furniture_ids', 'convenient_ids', 'fit_ids'],
            forceRender: true,
            label: 'Tiện ích',
            children: (
                <Card size="small" className="!rounded-tl-none mb-4">
                    <FacilityGroupCard
                        furnitureOptions={enumData?.data?.furniture_types}
                        convenientOptions={enumData?.data?.convenient_types}
                        fitOptions={enumData?.data?.fit_types}
                    />
                </Card>
            ),
        },
        {
            key: 'location',
            fields: [],
            forceRender: true,
            label: 'Vị trí bất động sản',
            children: (
                <Card size="small" className="!rounded-tl-none mb-4">
                    <Form.Item label="Bản đồ vị trí hàng hoá">
                        <BaseLocation />
                    </Form.Item>
                </Card>
            ),
        },
        {
            key: 'image',
            fields: [],
            label: 'Quản lý ảnh',
            children: productId ? (
                <Space direction="vertical" size="middle" className="w-full">
                    <ImageProduct product_id={productId} />
                    <BaseImageUpload
                        itemId={productId}
                        imageType={IMAGE_TYPE.PRODUCT_FLOOR_PLAN}
                        folderPrefix="products"
                        title="mặt bằng hàng hoá"
                        messageGuide="Kích thước khuyến nghị 880 x 585 px."
                    />
                </Space>
            ) : (
                <BaseMessage text="Vui lòng quay trở lại khi lưu hàng hoá thành công!" />
            ),
        },
        {
            key: 'seo',
            fields: ['seo_title', 'seo_description', 'seo_keywords', 'seo_robots'],
            label: 'SEO',
            children: <SeoFormInputs />,
        },
        {
            key: 'note',
            fields: ['note'],
            label: 'Ghi chú',
            forceRender: true,
            children: (
                <Card size="small" className="!rounded-tl-none mb-4">
                    <Form.Item label="Ghi chú" name="note">
                        <TextEditor />
                    </Form.Item>
                </Card>
            ),
        },
        ...(hasPermission(RESOURCE_TYPE.VIEW_360, ACTION.READ)
            ? [
                  {
                      key: 'product_to_image360',
                      fields: [],
                      label: 'Liên kết ảnh 360',
                      children: productId ? (
                          <ProductToImage360Tab product_id={productId} />
                      ) : (
                          <BaseMessage text="Vui lòng quay trở lại khi lưu hàng hoá thành công!" />
                      ),
                  },
              ]
            : []),
        ...(hasPermission(RESOURCE_TYPE.TOUR_360, ACTION.READ)
            ? [
                  {
                      key: 'product_to_tour360',
                      fields: [],
                      label: 'Liên kết tour 360',
                      children: productId ? (
                          <ProductToTourTab product_id={productId} />
                      ) : (
                          <BaseMessage text="Vui lòng quay trở lại khi lưu hàng hoá thành công!" />
                      ),
                  },
              ]
            : []),
    ]

    const handleFinishFailed = (errorInfo: ValidateErrorEntity) => {
        const fieldsWithError = errorInfo.errorFields.map(error => error.name[0])

        for (const tab of tabItems) {
            if (tab.fields.some(field => fieldsWithError.includes(field))) {
                setActiveTab(tab.key)
                break
            }
        }
    }

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                onFinishFailed={handleFinishFailed}
                onValuesChange={onValuesChange}>
                <Tabs items={tabItems} type="card" activeKey={activeTab} onChange={setActiveTab} />

                {submitVisibleTabs.includes(activeTab) && (
                    <div className="text-center mt-6">
                        <Button type="primary" htmlType="submit">
                            Gửi thông tin
                        </Button>
                    </div>
                )}
            </Form>

            <AddCustomerModal visible={showCustomerModal} onCancel={() => setShowCustomerModal(false)} />
        </>
    )
}

export default ProductForm
