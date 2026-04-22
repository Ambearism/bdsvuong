import { useCurrentEditor } from '@tiptap/react'
import { useEffect, useState } from 'react'

export function useTiptapUpdated() {
    const { editor } = useCurrentEditor()
    const [, setEditorState] = useState<number>(0)

    useEffect(() => {
        if (!editor) return

        const updateHandler = () => setEditorState(x => x + 1)

        editor.on('selectionUpdate', updateHandler)
        editor.on('transaction', updateHandler)

        return () => {
            editor.off('selectionUpdate', updateHandler)
            editor.off('transaction', updateHandler)
        }
    }, [editor])

    return { editor }
}
