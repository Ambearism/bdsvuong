import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { Checkbox, Button, Spin, message, Typography, Select, Form, Flex, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useParams } from 'react-router'
import { useGetProjectExploreQuery, useUpdateProjectExploreMutation } from '@/api/project'
import type { ProjectConfigExplore, ConfigExploreData } from '@/types/project'
import { TextEditor } from '@/components/tiptap'
import isEmpty from 'lodash/isEmpty'

const { Title, Text } = Typography
const FILTER_FIELDS = [
    { label: 'Loại hình bất động sản (type_slug)', value: 'type_slug' },
    { label: 'Phân khu (divisive)', value: 'divisive' },
    { label: 'Phân lô (parcel)', value: 'parcel' },
    { label: 'Tòa nhà (block)', value: 'block' },
    { label: 'Số căn/Số ô (number)', value: 'number' },
]
const DISPLAY_FIELDS = [
    { label: 'Phân khu (divisive)', value: 'divisive' },
    { label: 'Phân lô (parcel)', value: 'parcel' },
    { label: 'Số căn/Số ô (number)', value: 'number' },
    { label: 'Diện tích (acreage)', value: 'acreage' },
    { label: 'Mặt tiền (frontispiece)', value: 'frontispiece' },
    { label: 'Mặt hậu (backside)', value: 'backside' },
    { label: 'Mặt đường 1 (gateway_1)', value: 'gateway_1' },
    { label: 'Hướng nhà 1 (direction_house)', value: 'direction_house' },
    { label: 'Mặt đường 2 (gateway_2)', value: 'gateway_2' },
    { label: 'Hướng nhà 2 (direction_house_1)', value: 'direction_house_1' },
    { label: 'Đặc điểm (note)', value: 'note' },
]

export interface ProjectExploreRef {
    save: () => Promise<void>
}

interface ProjectExploreProps {
    projectId?: number
    onEnableChange?: (enabled: boolean) => void
}

const ProjectExplore = forwardRef<ProjectExploreRef, ProjectExploreProps>(({ projectId, onEnableChange }, ref) => {
    const [form] = Form.useForm()
    const displayFieldsValue = Form.useWatch('display_fields', form)
    const enableExploreValue = Form.useWatch('enable_explore', form)

    useEffect(() => {
        if (onEnableChange !== undefined && enableExploreValue !== undefined) {
            onEnableChange(enableExploreValue)
        }
    }, [enableExploreValue, onEnableChange])
    const { project_id } = useParams<{ project_id: string }>()
    const projectIdNumber = projectId || Number(project_id)
    const {
        data: projectData,
        isLoading: isLoadingProject,
        isFetching,
        refetch,
    } = useGetProjectExploreQuery(
        { project_id: projectIdNumber },
        { skip: !projectIdNumber, refetchOnMountOrArgChange: true },
    )
    const [updateProjectExplore] = useUpdateProjectExploreMutation()
    useEffect(() => {
        if (projectData?.data) {
            const { data } = projectData
            const config = data.config_explore
            form.setFieldsValue({
                enable_explore: data.enable_explore || false,
                is_explore: data.is_explore || false,
                enable_explore_map: data.enable_explore_map || false,
                content_explore_map: data.content_explore_map || '',
                filter_fields: config?.find ? Object.keys(config.find) : [],
                display_fields: config?.data || [],
            })
        }
    }, [projectData, form])

    const handleSave = async () => {
        try {
            const values = await form.validateFields()

            let find = {}
            if (!isEmpty(values.filter_fields)) {
                find = FILTER_FIELDS.reduce((accumulated: Record<string, string>, current) => {
                    const key = current.value
                    if (values.filter_fields.includes(key)) {
                        accumulated[key] = current.label
                    }

                    return accumulated
                }, {})
            }

            const configObject: ConfigExploreData = {
                find,
                setting: {},
                data: (values.display_fields || []).filter((item: string | null) => item),
            }

            const payload: ProjectConfigExplore = {
                enable_explore: values.enable_explore,
                is_explore: values.is_explore,
                enable_explore_map: values.enable_explore_map,
                content_explore_map: values.content_explore_map,
                config_explore: configObject,
            }

            await updateProjectExplore({ project_id: projectIdNumber, payload }).unwrap()
            await refetch()
            message.success('Cập nhật cấu hình tra cứu thành công!')
        } catch (error) {
            message.error('Cập nhật thất bại! Vui lòng kiểm tra lại các trường.')
            throw error
        }
    }

    useImperativeHandle(ref, () => ({
        save: handleSave,
    }))
    if (isLoadingProject || isFetching) {
        return (
            <Flex justify="center" className="pt-12">
                <Spin size="large" />
            </Flex>
        )
    }
    return (
        <div className="w-full space-y-6">
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                component={false}
                initialValues={{
                    enable_explore: false,
                    is_explore: false,
                    enable_explore_map: false,
                    content_explore_map: '',
                    filter_fields: [],
                    display_fields: [],
                }}>
                <div className="space-y-6 w-full">
                    <div className="space-y-3">
                        <Form.Item name="enable_explore" valuePropName="checked" noStyle>
                            <Checkbox>Bật tính năng tra cứu</Checkbox>
                        </Form.Item>
                        <Form.Item name="enable_explore_map" valuePropName="checked" noStyle>
                            <Checkbox>Bật tính năng tra cứu Google Maps</Checkbox>
                        </Form.Item>
                        <Form.Item name="is_explore" valuePropName="checked" noStyle>
                            <Checkbox>Bật dự án tra cứu cho Admin</Checkbox>
                        </Form.Item>
                    </div>
                    <Text type="secondary" italic className="block">
                        Lưu ý: Nếu không có dữ liệu tra cứu của dự án, vui lòng không sử dụng tính năng này để tránh gây
                        lỗi hiển thị hoặc lỗi hệ thống.
                    </Text>

                    <Form.Item
                        label={<Text strong>Nội dung trang tra cứu Google Maps</Text>}
                        name="content_explore_map">
                        <TextEditor />
                    </Form.Item>

                    <Text strong>Các trường thông tin được tra cứu</Text>
                    <Text type="secondary" italic className="block">
                        (Lựa chọn chính xác nếu không sẽ gây lỗi do có thể không đủ dữ liệu tra cứu cho dự án.{' '}
                        <Text type="danger">Nếu không nắm rõ, vui lòng không cố sử dụng tính năng này.</Text>)
                    </Text>

                    <Row gutter={[32, 24]}>
                        <Col span={24} md={12}>
                            <Title level={4}>Nhóm điều kiện lọc</Title>
                            <Form.Item name="filter_fields">
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <Flex vertical gap="small">
                                        {FILTER_FIELDS.map(field => (
                                            <Checkbox key={field.value} value={field.value}>
                                                {field.label}
                                            </Checkbox>
                                        ))}
                                    </Flex>
                                </Checkbox.Group>
                            </Form.Item>
                        </Col>

                        <Col span={24} md={12}>
                            <Title level={4}>Nhóm thông tin hiển thị</Title>
                            <Text className="block">
                                Lựa chọn theo đúng thứ tự muốn hiển thị, thứ tự các trường phụ thuộc vào ảnh kết quả tra
                                cứu
                            </Text>
                            <Form.List name="display_fields">
                                {(fields, { add, remove }) => (
                                    <div className="mt-2">
                                        {fields.map(({ key, name, ...restField }) => {
                                            const currentSelectedValues = displayFieldsValue || []
                                            const filteredOptions = DISPLAY_FIELDS.filter(option => {
                                                const isSelected = currentSelectedValues.includes(option.value)
                                                return !isSelected || currentSelectedValues[name] === option.value
                                            })

                                            return (
                                                <Flex key={key} align="start" gap={8} className="mb-2">
                                                    <div style={{ flex: 1 }}>
                                                        <Form.Item {...restField} name={name} className="m-0">
                                                            <Select
                                                                placeholder="Chọn trường"
                                                                options={filteredOptions}
                                                                allowClear
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                    <div>
                                                        <Button
                                                            type="primary"
                                                            danger
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => remove(name)}
                                                        />
                                                    </div>
                                                </Flex>
                                            )
                                        })}
                                        {fields.length < DISPLAY_FIELDS.length && (
                                            <Form.Item>
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}>
                                                    Thêm trường
                                                </Button>
                                            </Form.Item>
                                        )}
                                    </div>
                                )}
                            </Form.List>
                        </Col>
                    </Row>
                </div>
            </Form>
        </div>
    )
})

export default ProjectExplore
