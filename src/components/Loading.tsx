import { Flex, Spin } from 'antd'

const Loading = () => {
    return (
        <Flex align="center" justify="center" className="h-screen">
            <Spin size="large" />
        </Flex>
    )
}

export default Loading
