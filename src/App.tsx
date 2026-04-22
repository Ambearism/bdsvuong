import '@/assets/styles/index.scss'
import Loading from '@/components/Loading'
import PermissionRoute from '@/components/routes/PermissionRoute'
import { ACTION, RESOURCE_TYPE } from '@/config/permission'
import NotFound from '@/pages/NotFound'
import { Suspense } from 'react'
import { lazyLoad } from '@/utils/lazyLoad'
import { Route, Routes, Outlet } from 'react-router'
import ListProductLocation from '@/pages/products/ListProductLocation'
import LeaseContractHub from '@/pages/lease-contracts/hub'
import PaymentsHub from '@/pages/lease-contracts/hub/PaymentsHub'
import DebtNotesHub from '@/pages/lease-contracts/hub/DebtNotesHub'
import CashflowHub from '@/pages/lease-contracts/hub/CashflowHub'
import TimelineHubLeaseContract from '@/pages/lease-contracts/hub/TimelineHubLeaseContract'
const PrivateLayout = lazyLoad(() => import('@/components/layouts/PrivateLayout'), 'PrivateLayout')
const PublicLayout = lazyLoad(() => import('@/components/layouts/PublicLayout'), 'PublicLayout')
const PrivateRoute = lazyLoad(() => import('@/components/routes/PrivateRoute'), 'PrivateRoute')
const PublicRoute = lazyLoad(() => import('@/components/routes/PublicRoute'), 'PublicRoute')
const Login = lazyLoad(() => import('@/pages/Login'), 'Login')
const ProjectList = lazyLoad(() => import('@/pages/projects/ProjectList'), 'ProjectList')
const ProjectExploreList = lazyLoad(() => import('@/pages/projects/ProjectExploreList'), 'ProjectExploreList')
const ProjectExploreInfoList = lazyLoad(
    () => import('@/pages/projects/ProjectExploreInfoList'),
    'ProjectExploreInfoList',
)
const CreateProject = lazyLoad(() => import('@/pages/projects/CreateProject'), 'CreateProject')
const UpdateProject = lazyLoad(() => import('@/pages/projects/UpdateProject'), 'UpdateProject')
const ProductList = lazyLoad(() => import('@/pages/products/ListProduct'), 'ProductList')
const CreateProduct = lazyLoad(() => import('@/pages/products/CreateProduct'), 'CreateProduct')
const UpdateProduct = lazyLoad(() => import('@/pages/products/UpdateProduct'), 'UpdateProduct')
const ProductHub = lazyLoad(() => import('@/pages/products/hub/ProductHub'), 'ProductHub')
const OverviewHubProduct = lazyLoad(() => import('@/pages/products/hub/OverviewHubProduct'), 'OverviewHubProduct')
const TimelineHubProduct = lazyLoad(() => import('@/pages/products/hub/TimelineHubProduct'), 'TimelineHubProduct')
const LeadsAndDealsHubProduct = lazyLoad(
    () => import('@/pages/products/hub/LeadsAndDealsHubProduct'),
    'LeadsAndDealsHubProduct',
)
const Media360HubProduct = lazyLoad(() => import('@/pages/products/hub/Media360HubProduct'), 'Media360HubProduct')
const ProductTypes = lazyLoad(() => import('@/pages/products/types/ProductTypes'), 'ProductTypes')
const NewsList = lazyLoad(() => import('@/pages/news/NewsList'), 'NewsList')
const CreateNews = lazyLoad(() => import('@/pages/news/CreateNews'), 'CreateNews')
const UpdateNews = lazyLoad(() => import('@/pages/news/UpdateNews'), 'UpdateNews')
const DetailGroupCustomer = lazyLoad(() => import('@/pages/group-customer/DetailGroupCustomer'), 'DetailGroupCustomer')
const ListGroupCustomer = lazyLoad(() => import('@/pages/group-customer/ListGroupCustomer'), 'ListGroupCustomer')
const ListCustomer = lazyLoad(() => import('@/pages/customers/ListCustomer'), 'ListCustomer')
const CreateCustomer = lazyLoad(() => import('@/pages/customers/CreateCustomer'), 'CreateCustomer')
const UpdateCustomer = lazyLoad(() => import('@/pages/customers/UpdateCustomer'), 'UpdateCustomer')
const BasicConfig = lazyLoad(() => import('@/pages/config-webs/BasicConfig'), 'BasicConfig')
const RolePage = lazyLoad(() => import('@/pages/config-roles/RolePage'), 'RolePage')
const ListTour360 = lazyLoad(() => import('@/pages/tour360s/ListTour360'), 'ListTour360')
const CreateTour360 = lazyLoad(() => import('@/pages/tour360s/CreateTour360'), 'CreateTour360')
const UpdateTour360 = lazyLoad(() => import('@/pages/tour360s/UpdateTour360'), 'UpdateTour360')
const Tour360Link = lazyLoad(() => import('@/pages/tour360s/tour360-link/Tour360Link'), 'Tour360Link')
const AlbumList = lazyLoad(() => import('@/pages/albums/AlbumList'), 'AlbumList')
const CreateAlbum = lazyLoad(() => import('@/pages/albums/CreateAlbum'), 'CreateAlbum')
const UpdateAlbum = lazyLoad(() => import('@/pages/albums/UpdateAlbum'), 'UpdateAlbum')
const ListImage360Page = lazyLoad(() => import('@/pages/image-360/ListImage360Page'), 'ListImage360Page')
const LinkImage360Page = lazyLoad(() => import('@/pages/image-360/LinkImage360Page'), 'LinkImage360Page')
const CreateImage360 = lazyLoad(() => import('@/pages/image-360/CreateImage360'), 'CreateImage360')
const UpdateImage360 = lazyLoad(() => import('@/pages/image-360/UpdateImage360'), 'UpdateImage360')
const ListConsign = lazyLoad(() => import('@/pages/consigns/ListConsign'), 'ListConsign')
const ListContact = lazyLoad(() => import('@/pages/contacts/ListContact'), 'ListContact')
const GroupLinkProductList = lazyLoad(
    () => import('@/pages/group-link-products/GroupLinkProductList'),
    'GroupLinkProductList',
)
const UpdateGroupLinkProduct = lazyLoad(
    () => import('@/pages/group-link-products/UpdateGroupLinkProduct'),
    'UpdateGroupLinkProduct',
)
const LeadList = lazyLoad(() => import('@/pages/leads/LeadList'), 'LeadList')
const CreateLead = lazyLoad(() => import('@/pages/leads/CreateLead'), 'CreateLead')
const UpdateLead = lazyLoad(() => import('@/pages/leads/UpdateLead'), 'UpdateLead')
const DealList = lazyLoad(() => import('@/pages/deals/DealList'), 'DealList')
const CreateDeal = lazyLoad(() => import('@/pages/deals/CreateDeal'), 'CreateDeal')
const UpdateDeal = lazyLoad(() => import('@/pages/deals/UpdateDeal'), 'UpdateDeal')
const OpportunityHub = lazyLoad(() => import('@/pages/opportunities/OpportunityHub'), 'OpportunityHub')
const ConvertToTransaction = lazyLoad(
    () => import('@/pages/opportunities/ConvertToTransaction'),
    'ConvertToTransaction',
)
const TransactionList = lazyLoad(() => import('@/pages/transactions/TransactionList'), 'TransactionList')
const CreateTransaction = lazyLoad(() => import('@/pages/transactions/CreateTransaction'), 'CreateTransaction')
const UpdateTransaction = lazyLoad(() => import('@/pages/transactions/UpdateTransaction'), 'UpdateTransaction')
const DashboardLayout = lazyLoad(() => import('@/pages/dashboard/DashboardLayout'), 'DashboardLayout')
const OverviewDashboard = lazyLoad(() => import('@/pages/dashboard/OverviewDashboard'), 'OverviewDashboard')
const ProductDetailsDashboard = lazyLoad(
    () => import('@/pages/dashboard/ProductDetailsDashboard'),
    'ProductDetailsDashboard',
)
const ListAccountPage = lazyLoad(() => import('@/pages/accounts/ListAccountPage'), 'ListAccountPage')
const CreateAccountPage = lazyLoad(() => import('@/pages/accounts/CreateAccountPage'), 'CreateAccountPage')
const UpdateAccountPage = lazyLoad(() => import('@/pages/accounts/UpdateAccountPage'), 'UpdateAccountPage')
const CostCategoryPage = lazyLoad(() => import('@/pages/cost-categories/CostCategoryPage'), 'CostCategoryPage')
const GoogleCallback = lazyLoad(() => import('@/pages/google/GoogleCallback'), 'GoogleCallback')
const GoogleConnectionPage = lazyLoad(() => import('@/pages/google/GoogleConnectionPage'), 'GoogleConnectionPage')
const SalesPerformance = lazyLoad(() => import('@/pages/dashboard/SalesPerformance'), 'SalesPerformance')
const CustomerHub = lazyLoad(() => import('@/pages/customers/hub/CustomerHub'), 'CustomerHub')
const OverviewHubCustomer = lazyLoad(() => import('@/pages/customers/hub/OverviewHubCustomer'), 'OverviewHubCustomer')
const TimelineHubCustomer = lazyLoad(() => import('@/pages/customers/hub/TimelineHubCustomer'), 'TimelineHubCustomer')
const LeadsAndDealsHubCustomer = lazyLoad(
    () => import('@/pages/customers/hub/LeadsAndDealsHubCustomer'),
    'LeadsAndDealsHubCustomer',
)
const LinkedProductsHubCustomer = lazyLoad(
    () => import('@/pages/customers/hub/LinkedProductsHubCustomer'),
    'LinkedProductsHubCustomer',
)
const CustomerRelationsHubCustomer = lazyLoad(
    () => import('@/pages/customers/hub/CustomerRelationsHubCustomer'),
    'CustomerRelationsHubCustomer',
)
const PipelineList = lazyLoad(() => import('@/pages/pipelines/PipelineList'), 'PipelineList')
const LeaseContractList = lazyLoad(() => import('@/pages/lease-contracts/LeaseContractList'), 'LeaseContractList')
const CreateLeaseContract = lazyLoad(() => import('@/pages/lease-contracts/CreateLeaseContract'), 'CreateLeaseContract')
const UpdateLeaseContract = lazyLoad(() => import('@/pages/lease-contracts/UpdateLeaseContract'), 'UpdateLeaseContract')
const LeaseContractPaymentApproval = lazyLoad(
    () => import('@/pages/lease-contracts/LeaseContractPaymentApproval'),
    'LeaseContractPaymentApproval',
)
const CareManagement = lazyLoad(() => import('@/pages/care/CareManagement'), 'CareManagement')
const CareCaseDetail = lazyLoad(() => import('@/pages/care/CareCaseDetail'), 'CareCaseDetail')
const Forbidden = lazyLoad(() => import('@/pages/Forbidden'), 'Forbidden')

import ForbiddenModal from '@/components/modals/ForbiddenModal'

const App = () => {
    return (
        <>
            <ForbiddenModal />
            <Routes>
                <Route
                    element={
                        <Suspense fallback={<Loading />}>
                            <PublicRoute>
                                <PublicLayout />
                            </PublicRoute>
                        </Suspense>
                    }>
                    <Route path="/login" element={<Login />} />
                </Route>
                <Route
                    element={
                        <Suspense fallback={<Loading />}>
                            <PrivateRoute>
                                <PrivateLayout />
                            </PrivateRoute>
                        </Suspense>
                    }>
                    <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<OverviewDashboard />} />
                        <Route
                            path="overview"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.DASHBOARD} action={ACTION.READ}>
                                    <OverviewDashboard />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="product-details"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.DASHBOARD} action={ACTION.READ}>
                                    <ProductDetailsDashboard />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route
                        path="/reports-product-details"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.REPORT} action={ACTION.READ}>
                                <ProductDetailsDashboard standalone />
                            </PermissionRoute>
                        }
                    />
                    <Route
                        path="/reports-sales-performance"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.REPORT} action={ACTION.READ}>
                                <SalesPerformance />
                            </PermissionRoute>
                        }
                    />
                    <Route path="/projects">
                        <Route index element={<ProjectList />} />
                        <Route path="explore" element={<ProjectExploreList />} />
                        <Route path=":project_id/explores" element={<ProjectExploreInfoList />} />
                        <Route path="create" element={<CreateProject />} />
                        <Route path=":project_id/update" element={<UpdateProject />} />
                    </Route>

                    <Route path="/products">
                        <Route path=":product_id/hub" element={<ProductHub />}>
                            <Route index element={<OverviewHubProduct />} />
                            <Route path="overview" element={<OverviewHubProduct />} />
                            <Route path="media-360" element={<Media360HubProduct />} />
                            <Route path="timeline" element={<TimelineHubProduct />} />
                            <Route path="leads-deals" element={<LeadsAndDealsHubProduct />} />
                        </Route>
                        <Route path="types" element={<ProductTypes />} />
                        <Route index element={<ProductList />} />
                        <Route path=":typeTransactionParam/:typeProductParam" element={<ProductList />} />
                        <Route path="create" element={<CreateProduct />} />
                        <Route path=":product_id/update" element={<UpdateProduct />} />
                    </Route>
                    <Route path="product-locations" element={<ListProductLocation />} />

                    <Route path="/customer-groups">
                        <Route index element={<ListGroupCustomer />} />
                        <Route path=":groupCustomerIdParam/detail" element={<DetailGroupCustomer />} />
                    </Route>

                    <Route path="/news">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.NEW} action={ACTION.READ}>
                                    <NewsList />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="create"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.NEW} action={ACTION.CREATE}>
                                    <CreateNews />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path=":news_id/update"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.NEW} action={ACTION.UPDATE}>
                                    <UpdateNews />
                                </PermissionRoute>
                            }
                        />
                    </Route>

                    <Route path="/customers">
                        <Route index element={<ListCustomer />} />
                        <Route path="create" element={<CreateCustomer />} />
                        <Route path=":customerId/update" element={<UpdateCustomer />} />
                        <Route path=":customer_id/hub" element={<CustomerHub />}>
                            <Route index element={<OverviewHubCustomer />} />
                            <Route path="overview" element={<OverviewHubCustomer />} />
                            <Route path="products-projects" element={<LinkedProductsHubCustomer />} />
                            <Route path="relations" element={<CustomerRelationsHubCustomer />} />
                            <Route path="timeline" element={<TimelineHubCustomer />} />
                            <Route path="leads-deals" element={<LeadsAndDealsHubCustomer />} />
                        </Route>
                    </Route>

                    <Route path="/accounts">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.STAFF} action={ACTION.READ}>
                                    <ListAccountPage />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="create"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.STAFF} action={ACTION.CREATE}>
                                    <CreateAccountPage />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path=":account_id/update"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.STAFF} action={ACTION.UPDATE}>
                                    <UpdateAccountPage />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route
                        path="/configs-role"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.ROLE} action={ACTION.READ}>
                                <RolePage />
                            </PermissionRoute>
                        }
                    />
                    <Route
                        path="/basic-config"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.SETTING} action={ACTION.READ}>
                                <BasicConfig />
                            </PermissionRoute>
                        }
                    />
                    <Route
                        path="/configs-cost-categories"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.TAX_CONFIGURATION} action={ACTION.READ}>
                                <CostCategoryPage />
                            </PermissionRoute>
                        }
                    />
                    <Route path="/tour360s">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.TOUR_360} action={ACTION.READ}>
                                    <ListTour360 />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="create"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.TOUR_360} action={ACTION.CREATE}>
                                    <CreateTour360 />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path=":tourId/update"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.TOUR_360} action={ACTION.UPDATE}>
                                    <UpdateTour360 />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route path="/tour360-link">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.TOUR_360} action={ACTION.READ}>
                                    <Tour360Link />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route path="/albums">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.ALBUM_360} action={ACTION.READ}>
                                    <AlbumList />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="create"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.ALBUM_360} action={ACTION.CREATE}>
                                    <CreateAlbum />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path=":album_id/update"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.ALBUM_360} action={ACTION.UPDATE}>
                                    <UpdateAlbum />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route path="/image-360">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.VIEW_360} action={ACTION.READ}>
                                    <ListImage360Page />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="link"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.VIEW_360} action={ACTION.READ}>
                                    <LinkImage360Page />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path="create"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.VIEW_360} action={ACTION.CREATE}>
                                    <CreateImage360 />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path=":image_360_id/update"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.VIEW_360} action={ACTION.UPDATE}>
                                    <UpdateImage360 />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route path="/consigns">
                        <Route
                            index
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.DEAL} action={ACTION.READ}>
                                    <ListConsign />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route path="/contacts">
                        <Route index element={<ListContact />} />
                    </Route>
                    <Route
                        path="/group-link-products"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.GROUP_LINK} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<GroupLinkProductList />} />
                        <Route path=":id/update" element={<UpdateGroupLinkProduct />} />
                    </Route>

                    <Route
                        path="/leads"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.LEAD} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<LeadList />} />
                        <Route path="create" element={<CreateLead />} />
                        <Route path=":opportunityId/update" element={<UpdateLead />} />
                        <Route path=":opportunityId/hub" element={<OpportunityHub type="lead" />} />
                    </Route>

                    <Route
                        path="/pipelines"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.PIPELINE_PROCESS} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<PipelineList />} />
                    </Route>

                    <Route
                        path="/care"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.CARE_CASE} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<CareManagement />} />
                        <Route path=":id" element={<CareCaseDetail />} />
                    </Route>

                    <Route
                        path="/deals"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.DEAL} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<DealList />} />
                        <Route path="create" element={<CreateDeal />} />
                        <Route path=":opportunityId/update" element={<UpdateDeal />} />
                        <Route path=":opportunityId/hub" element={<OpportunityHub type="deal" />} />
                        <Route path=":opportunityId/convert-to-transaction" element={<ConvertToTransaction />} />
                    </Route>

                    <Route
                        path="/transactions"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.CONTRACT} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<TransactionList />} />
                        <Route path="create" element={<CreateTransaction />} />
                        <Route path=":transactionId/update" element={<UpdateTransaction />} />
                    </Route>
                    <Route
                        path="/lease-contracts"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.LEASE_CONTRACT} action={ACTION.READ}>
                                <Outlet />
                            </PermissionRoute>
                        }>
                        <Route index element={<LeaseContractList />} />
                        <Route path=":lease_contract_id/hub" element={<LeaseContractHub />}>
                            <Route index element={<PaymentsHub />} />
                            <Route path="payments" element={<PaymentsHub />} />
                            <Route path="cashflow" element={<CashflowHub />} />
                            <Route path="debt-notes" element={<DebtNotesHub />} />
                            <Route path="history" element={<TimelineHubLeaseContract />} />
                        </Route>
                        <Route
                            path="create"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.LEASE_CONTRACT} action={ACTION.CREATE}>
                                    <CreateLeaseContract />
                                </PermissionRoute>
                            }
                        />
                        <Route
                            path=":lease_contract_id/update"
                            element={
                                <PermissionRoute module={RESOURCE_TYPE.LEASE_CONTRACT} action={ACTION.UPDATE}>
                                    <UpdateLeaseContract />
                                </PermissionRoute>
                            }
                        />
                    </Route>
                    <Route
                        path="/lease-contracts-payments"
                        element={
                            <PermissionRoute module={RESOURCE_TYPE.CASH_FLOW} action={ACTION.READ}>
                                <LeaseContractPaymentApproval />
                            </PermissionRoute>
                        }
                    />
                    <Route path="/settings-google-calendar" element={<GoogleConnectionPage />} />
                </Route>
                <Route path="/403" element={<Forbidden />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/google/callback" element={<GoogleCallback />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    )
}

export default App
