import Image from '@tiptap/extension-image'
import type { Attributes } from '@tiptap/core'

export const LinkableImage = Image.extend({
    name: 'image',

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            href: {
                default: null,
            },
        }
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Attributes }) {
        if (HTMLAttributes.href) {
            return [
                'a',
                {
                    href: HTMLAttributes.href,
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                },
                ['img', { ...HTMLAttributes, href: null }],
            ]
        }
        return ['img', HTMLAttributes]
    },
})
