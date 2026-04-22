import { Flex, Typography } from 'antd'

const { Text } = Typography

interface NameDisplayProps {
    name?: string
    onClick: () => void
}

export const NameDisplay = ({ name, onClick }: NameDisplayProps) => {
    return (
        <Flex justify="center" align="center" className="w-full px-1 cursor-pointer min-h-8" onClick={onClick}>
            <Text className="text-xs text-center truncate" title={name} type="secondary">
                {name}
            </Text>
        </Flex>
    )
}
