import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

const NotFound = () => {
    const navigate = useNavigate()
    const goHome = () => navigate('/')
    return (
        <Result
            status="404"
            title="404"
            subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
            extra={
                <Button type="primary" onClick={goHome}>
                    Về trang chủ
                </Button>
            }
        />
    )
}

export default NotFound
