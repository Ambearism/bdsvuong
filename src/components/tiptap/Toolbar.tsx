import { ColorPopover, ImagePopover, LinkPopover, VideoPopover } from '@/components/tiptap'
import { useTiptapUpdated } from '@/hooks/useTiptapUpdated'
import { Button, Space, Tooltip } from 'antd'
import { GoTasklist } from 'react-icons/go'
import {
    MdFormatAlignCenter,
    MdFormatAlignJustify,
    MdFormatAlignLeft,
    MdFormatAlignRight,
    MdFormatBold,
    MdFormatItalic,
    MdFormatListBulleted,
    MdFormatListNumbered,
    MdFormatStrikethrough,
    MdFormatUnderlined,
    MdOutlineLinkOff,
    MdRedo,
    MdSubscript,
    MdSuperscript,
    MdUndo,
} from 'react-icons/md'

// const _headings: Level[] = [1, 2, 3, 4, 5, 6]

interface Props {
    textOnly?: boolean
}

export const Toolbar = ({ textOnly = false }: Props) => {
    const { editor } = useTiptapUpdated()

    return (
        <Space wrap>
            <Space.Compact block>
                <Tooltip title="Undo">
                    <Button
                        size="small"
                        icon={<MdUndo />}
                        disabled={!editor?.can()?.undo()}
                        onClick={() => editor?.commands?.undo()}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Redo">
                    <Button
                        size="small"
                        icon={<MdRedo />}
                        disabled={!editor?.can()?.redo()}
                        onClick={() => editor?.commands?.redo()}
                        tabIndex={-1}
                    />
                </Tooltip>
            </Space.Compact>
            <Space.Compact block>
                <Tooltip title="Bold">
                    <Button
                        size="small"
                        icon={<MdFormatBold />}
                        onClick={() => editor?.commands?.toggleBold()}
                        type={editor?.isActive('bold') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Italic">
                    <Button
                        size="small"
                        icon={<MdFormatItalic />}
                        onClick={() => editor?.commands?.toggleItalic()}
                        type={editor?.isActive('italic') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Underline">
                    <Button
                        size="small"
                        icon={<MdFormatUnderlined />}
                        onClick={() => editor?.commands?.toggleUnderline()}
                        type={editor?.isActive('underline') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Strike through">
                    <Button
                        size="small"
                        icon={<MdFormatStrikethrough />}
                        onClick={() => editor?.commands?.toggleStrike()}
                        type={editor?.isActive('strike') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
            </Space.Compact>
            <Space.Compact block>
                <Tooltip title="Align Left">
                    <Button
                        size="small"
                        icon={<MdFormatAlignLeft />}
                        onClick={() => editor?.commands?.toggleTextAlign('left')}
                        type={editor?.isActive({ textAlign: 'left' }) ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Align Right">
                    <Button
                        size="small"
                        icon={<MdFormatAlignRight />}
                        onClick={() => editor?.commands?.toggleTextAlign('right')}
                        type={editor?.isActive({ textAlign: 'right' }) ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Align Center">
                    <Button
                        size="small"
                        icon={<MdFormatAlignCenter />}
                        onClick={() => editor?.commands?.toggleTextAlign('center')}
                        type={editor?.isActive({ textAlign: 'center' }) ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Align Justify">
                    <Button
                        size="small"
                        icon={<MdFormatAlignJustify />}
                        onClick={() => editor?.commands?.toggleTextAlign('justify')}
                        type={editor?.isActive({ textAlign: 'justify' }) ? 'primary' : undefined}
                    />
                </Tooltip>
            </Space.Compact>
            <Space.Compact block>
                <ColorPopover type="color" />
            </Space.Compact>
            <Space.Compact block>
                <ColorPopover type="background" />
            </Space.Compact>
            {/* <Space.Compact block>
                <Tooltip title="Heading">
                    <Dropdown
                        menu={{
                            items: _headings.map(level => ({
                                key: `heading_${level}`,
                                label: `Heading ${level}`,
                                onClick: () => editor?.commands?.toggleHeading({ level }),
                            })),
                        }}
                        placement="bottom"
                        trigger={['click']}>
                        <Button size="small" icon={<FaHeading />} tabIndex={-1} />
                    </Dropdown>
                </Tooltip>
            </Space.Compact> */}
            <Space.Compact block>
                <LinkPopover />
                <Tooltip title="Unlink">
                    <Button
                        size="small"
                        icon={<MdOutlineLinkOff />}
                        tabIndex={-1}
                        onClick={() => editor?.commands?.unsetLink()}
                    />
                </Tooltip>
                {!textOnly && <ImagePopover />}
                {!textOnly && <VideoPopover />}
            </Space.Compact>
            <Space.Compact block>
                <Tooltip title="Bullet List">
                    <Button
                        size="small"
                        icon={<MdFormatListBulleted />}
                        onClick={() => editor?.commands?.toggleBulletList()}
                        type={editor?.isActive('bulletList') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Number List">
                    <Button
                        size="small"
                        icon={<MdFormatListNumbered />}
                        onClick={() => editor?.commands?.toggleOrderedList()}
                        type={editor?.isActive('orderedList') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Task List">
                    <Button
                        size="small"
                        icon={<GoTasklist />}
                        onClick={() => editor?.commands?.toggleTaskList()}
                        type={editor?.isActive('taskList') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
            </Space.Compact>
            <Space.Compact block>
                <Tooltip title="Superscript">
                    <Button
                        size="small"
                        icon={<MdSuperscript />}
                        onClick={() => editor?.commands?.toggleSuperscript()}
                        type={editor?.isActive('superscript') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
                <Tooltip title="Subscript">
                    <Button
                        size="small"
                        icon={<MdSubscript />}
                        onClick={() => editor?.commands?.toggleSubscript()}
                        type={editor?.isActive('subscript') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>
            </Space.Compact>
            {/* <Space.Compact block>
                <Tooltip title="Blockquote">
                    <Button
                        size="small"
                        icon={<MdFormatQuote />}
                        onClick={() => editor?.commands?.toggleBlockquote()}
                        type={editor?.isActive('blockquote') ? 'primary' : undefined}
                        tabIndex={-1}
                    />
                </Tooltip>

                <Tooltip title="Indent Right">
                    <Button size="small" icon={<MdFormatIndentIncrease />} disabled tabIndex={-1} />
                </Tooltip>
                <Tooltip title="Indent Left">
                    <Button size="small" icon={<MdFormatIndentDecrease />} disabled tabIndex={-1} />
                </Tooltip>
            </Space.Compact> */}
        </Space>
    )
}
