export type GroupCustomerFlat = {
    id: number
    name: string
    content?: string | null
    parent_id?: number | null
    created_at: string
    updated_at: string
}

export type GroupCustomerItem = GroupCustomerFlat & {
    parent?: GroupCustomerItem | null
    children: GroupCustomerItem[]
}

export function attachParentToFlat(items: GroupCustomerFlat[]): GroupCustomerItem[] {
    const map = new Map<number, GroupCustomerItem>()
    items.forEach(it => {
        map.set(it.id, { ...it, parent_id: it.parent_id ?? null, children: [], parent: null })
    })
    const result: GroupCustomerItem[] = []
    map.forEach(node => {
        if (node.parent_id != null) {
            const p = map.get(node.parent_id)
            if (p) node.parent = { ...p, children: [], parent: null }
        }
        result.push(node)
    })
    return result
}

export function buildPartialTree(items: GroupCustomerFlat[]): GroupCustomerItem[] {
    const map = new Map<number, GroupCustomerItem>()
    items.forEach(it => {
        map.set(it.id, { ...it, parent_id: it.parent_id ?? null, children: [], parent: null })
    })

    const roots: GroupCustomerItem[] = []

    map.forEach(node => {
        if (node.parent_id != null) {
            const parent = map.get(node.parent_id)
            if (parent) {
                node.parent = { ...parent, parent: null, children: [] }
                parent.children.push(node)
            } else {
                roots.push(node)
            }
        } else {
            roots.push(node)
        }
    })

    return roots
}
