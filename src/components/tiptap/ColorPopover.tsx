import { useTiptapUpdated } from '@/hooks/useTiptapUpdated'
import { blue, cyan, green, red, yellow } from '@ant-design/colors'
import { Button, Col, ColorPicker, Divider, Row, Space, Tooltip } from 'antd'
import type { AggregationColor } from 'antd/es/color-picker/color'
import { useCallback, useMemo, useState } from 'react'
import {
    MdFormatColorFill,
    MdFormatColorText,
    MdOutlineKeyboardArrowDown,
    MdOutlineKeyboardArrowUp,
} from 'react-icons/md'

const TYPE_MAP = {
    color: { tooltip: 'Text Color', set: 'setColor', unset: 'unsetColor' },
    background: { tooltip: 'Background Color', set: 'setBackgroundColor', unset: 'unsetBackgroundColor' },
} as const

type Type = keyof typeof TYPE_MAP
interface Props {
    type: Type
}

const Icon = ({ type, color }: { type: Type; color?: string }) => {
    const IconComponent = type === 'color' ? MdFormatColorText : MdFormatColorFill

    return <IconComponent color={color} />
}

export const ColorPopover = ({ type }: Props) => {
    const [open, setOpen] = useState(false)
    const [color, setColor] = useState<string>()
    const { editor } = useTiptapUpdated()

    const { tooltip, set, unset } = useMemo(() => TYPE_MAP[type], [type])

    const onApplyColor = useCallback(
        (hex?: string) => {
            if (!hex) {
                editor?.commands[unset]()
            } else {
                editor?.commands[set](hex)
            }
            editor?.commands.focus()
        },
        [editor, set, unset],
    )

    const handleChangeComplete = useCallback(
        (value: AggregationColor) => {
            if (value.cleared) {
                setColor(undefined)
                onApplyColor()
            } else {
                const hex = value.toHexString()
                setColor(hex)
                onApplyColor(hex)
            }
        },
        [onApplyColor],
    )

    return (
        <Tooltip title={tooltip}>
            <Space.Compact>
                <Button
                    size="small"
                    icon={<Icon type={type} color={color} />}
                    tabIndex={-1}
                    onClick={() => onApplyColor(color)}
                />

                <ColorPicker
                    value={color}
                    onChangeComplete={handleChangeComplete}
                    open={open}
                    onOpenChange={setOpen}
                    allowClear
                    presets={[{ colors: [...blue, ...red, ...green, ...cyan, ...yellow], label: null }]}
                    styles={{ popupOverlayInner: { width: 480 } }}
                    panelRender={(_, { components: { Picker, Presets } }) => {
                        return (
                            <Row justify="space-between" wrap={false}>
                                <Col span={12}>
                                    <Presets />
                                </Col>
                                <Divider type="vertical" style={{ height: 'auto' }} />
                                <Col flex="auto">
                                    <Picker />
                                </Col>
                            </Row>
                        )
                    }}>
                    <Button
                        size="small"
                        icon={open ? <MdOutlineKeyboardArrowUp /> : <MdOutlineKeyboardArrowDown />}
                        tabIndex={-1}
                    />
                </ColorPicker>
            </Space.Compact>
        </Tooltip>
    )
}
