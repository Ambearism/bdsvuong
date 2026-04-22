import React, { useMemo, useState } from 'react'
import { Card, Input, Tree } from 'antd'
import type { FormInstance } from 'antd'
import type { NamePath } from 'antd/es/form/interface'
import { useGetGroupCustomerListQuery } from '@/api/group-customer'
import type { GroupCustomerFlat, GroupCustomerItem } from '@/utils/tree'
import { buildPartialTree } from '@/utils/tree'
import type { GroupCustomerListParams } from '@/types/group-customer'

type Props = {
    form: FormInstance<{ group_ids: string }>
    fieldName?: NamePath
    title?: string
    perPage?: number
    className?: string
    style?: React.CSSProperties
    checkStrictly?: boolean
}

type TreeNode = { title: string; key: number; children?: TreeNode[] }

const toTreeData = (nodes: GroupCustomerItem[]): TreeNode[] =>
    nodes.map(n => ({
        title: n.name,
        key: Number(n.id),
        children: n.children?.length ? toTreeData(n.children) : undefined,
    }))

const filterTree = (nodes: TreeNode[], q: string): TreeNode[] => {
    if (!q) return nodes
    const query = q.toLowerCase()
    const dfs = (arr: TreeNode[]): TreeNode[] =>
        arr
            .map(n => {
                const keepSelf = String(n.title).toLowerCase().includes(query)
                const keptChildren = n.children ? dfs(n.children) : []
                if (keepSelf || keptChildren.length) {
                    return { ...n, children: keptChildren.length ? keptChildren : undefined }
                }
                return null
            })
            .filter(Boolean) as TreeNode[]
    return dfs(nodes)
}

//[1,2,3] -> "#1#2#3#"
const formatGroupIdsString = (ids: (number | string)[]): string => (ids.length ? `#${ids.map(String).join('#')}#` : '')

const setFormValue = (form: FormInstance, name: NamePath, value: string) => {
    if (typeof form.setFieldValue === 'function') {
        form.setFieldValue(name, value)
    } else {
        if (Array.isArray(name)) {
            const lastKey = name[name.length - 1] as string | number
            form.setFieldsValue({ [lastKey]: value })
        } else {
            form.setFieldsValue({ [name]: value })
        }
    }
}

const GroupCustomerPicker: React.FC<Props> = ({
    form,
    fieldName = 'group_ids',
    title = 'Nhóm',
    perPage = 2000,
    className,
    style,
    checkStrictly = true,
}) => {
    const [search, setSearch] = useState('')
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])

    const { data } = useGetGroupCustomerListQuery({
        page: 1,
        per_page: perPage,
    } as GroupCustomerListParams)

    const flatItems = useMemo<GroupCustomerFlat[]>(() => {
        const list = ((data?.data?.items ?? data?.data) as GroupCustomerItem[]) ?? []
        return Array.isArray(list) ? (list as GroupCustomerFlat[]) : []
    }, [data])

    const treeRoots = useMemo<GroupCustomerItem[]>(() => buildPartialTree(flatItems), [flatItems])

    const treeData = useMemo<TreeNode[]>(() => toTreeData(treeRoots), [treeRoots])

    const filteredTree = useMemo<TreeNode[]>(() => filterTree(treeData, search), [treeData, search])

    const handleCheck = (keys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
        const raw = Array.isArray(keys) ? keys : keys.checked

        const idsNum = raw.map(x => Number(x)).filter(x => Number.isFinite(x))

        setCheckedKeys(idsNum)

        // ghi ngược về form là CHUỖI "#...#"
        const asString = formatGroupIdsString(idsNum)
        setFormValue(form, fieldName, asString)
    }

    return (
        <Card
            title={title}
            className={className}
            style={style}
            styles={{ body: { padding: 12, paddingTop: 8 } }} // AntD 5: dùng styles.body
        >
            <Input
                placeholder="Tìm nhanh"
                allowClear
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 12 }}
            />

            <div style={{ maxHeight: 520, overflow: 'auto', paddingRight: 6 }}>
                <Tree
                    checkable
                    selectable={false}
                    showLine={false}
                    checkedKeys={checkedKeys}
                    onCheck={handleCheck}
                    checkStrictly={checkStrictly}
                    treeData={filteredTree}
                    defaultExpandAll
                />
            </div>
        </Card>
    )
}

export default GroupCustomerPicker
