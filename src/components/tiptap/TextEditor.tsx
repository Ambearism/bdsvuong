import { useUploadImagesMutation } from '@/api/image'
import { Iframe } from '@/components/tiptap/extensions/Iframe'
import { Toolbar } from '@/components/tiptap'
import { IMAGE_TYPE } from '@/config/constant'
import type { UploadImageResponse } from '@/types/image'
import { isChangeOrigin } from '@tiptap/extension-collaboration'
import { Highlight } from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Mention } from '@tiptap/extension-mention'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { Typography as TipTapTypography } from '@tiptap/extension-typography'
import { UniqueID } from '@tiptap/extension-unique-id'
import { Selection } from '@tiptap/extensions'
import { EditorContent, EditorContext, useEditor, type Content } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Card, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const { Text } = Typography

interface Props {
    value?: Content
    onChange?: (value: Content) => void
    hasError?: boolean
    textOnly?: boolean
}

export const TextEditor = ({ value, onChange, hasError, textOnly = false }: Props) => {
    const [isContentLoaded, setIsContentLoaded] = useState(false)
    const [uploadImages] = useUploadImagesMutation()

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        extensions: [
            StarterKit.configure({
                heading: false,
                blockquote: false,
                codeBlock: false,
                horizontalRule: false,
                link: {
                    openOnClick: false,
                    enableClickSelection: true,
                },
            }),
            ...(!textOnly
                ? [
                      Image.configure({
                          allowBase64: true,
                      }),
                      Iframe,
                  ]
                : []),
            TextAlign.configure({
                types: textOnly ? ['heading', 'paragraph'] : ['heading', 'paragraph', 'image', 'iframe'],
            }),
            Mention,
            Mathematics,
            Superscript,
            Subscript,
            TextStyleKit,
            TaskList,
            TaskItem.configure({ nested: true, HTMLAttributes: { class: 'not-real-estate' } }),
            Highlight.configure({ multicolor: true }),
            Selection,
            UniqueID.configure({
                types: textOnly
                    ? [
                          'table',
                          'paragraph',
                          'bulletList',
                          'orderedList',
                          'taskList',
                          'heading',
                          'blockquote',
                          'codeBlock',
                      ]
                    : [
                          'table',
                          'paragraph',
                          'bulletList',
                          'orderedList',
                          'taskList',
                          'heading',
                          'blockquote',
                          'codeBlock',
                          'image',
                          'iframe',
                      ],
                filterTransaction: transaction => !isChangeOrigin(transaction),
            }),
            TipTapTypography,
        ],
        content: '',
        onUpdate: ({ editor: e }) => {
            onChange?.(e?.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'real-estate real-estate-slate lg:real-estate-lg focus:outline-none max-w-full min-h-60 max-h-100 overflow-y-auto',
            },
            handleDrop: (view, event, _slice, moved) => {
                if (textOnly) {
                    return false
                }

                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'))
                    if (files.length > 0) {
                        event.preventDefault()
                        const formData = new FormData()
                        formData.append('folder', 'text-editor')
                        formData.append('type', String(IMAGE_TYPE.IMAGE_EDITOR))
                        files.forEach(file => {
                            formData.append('files', file)
                        })

                        uploadImages(formData)
                            .unwrap()
                            .then(res => {
                                if (res.data && res.data.length > 0) {
                                    const { schema } = view.state
                                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                                    const nodes = res.data
                                        .filter((file: UploadImageResponse) => file.path)
                                        .map((file: UploadImageResponse) =>
                                            schema.node('image', { src: file.path, width: 1280, height: 720 }),
                                        )

                                    if (coordinates && nodes.length > 0) {
                                        view.dispatch(view.state.tr.insert(coordinates.pos, nodes))
                                    }
                                }
                            })
                            .catch(err => {
                                console.error('Upload failed', err)
                            })
                        return true
                    }
                }
                return false
            },
        },
    })

    useEffect(() => {
        if (editor && value && !isContentLoaded) {
            editor.commands.setContent(value, {})
            setIsContentLoaded(true)
        }
    }, [editor, value, isContentLoaded])

    const provider = useMemo(() => ({ editor }), [editor])

    if (!editor) return null

    return (
        <>
            {!textOnly && <Text strong>Kích thước khuyến nghị của ảnh là 1280 × 720 px.</Text>}
            <EditorContext.Provider value={provider}>
                <Card
                    size="small"
                    title={<Toolbar textOnly={textOnly} />}
                    className={hasError ? '!border-red-500' : ''}>
                    <EditorContent editor={editor} />
                </Card>
            </EditorContext.Provider>
        </>
    )
}
