import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

const Forbidden = () => {
    const navigate = useNavigate()
    const goHome = () => navigate('/')
    return (
        <Result
            status="403"
            title="403"
            subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
            extra={
                <Button type="primary" onClick={goHome}>
                    Về trang chủ
                </Button>
            }
        />
    )
}

export default Forbidden
