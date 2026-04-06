import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import PurchaseCart from '../views/PurchaseCart.vue'
import InquiryDetail from '../views/InquiryDetail.vue'
import Inquiries from '../views/Inquiries.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import ProfileEdit from '../views/ProfileEdit.vue'
import LevelIntro from '../views/LevelIntro.vue'
import ShopManage from '../views/ShopManage.vue'
import ShopInfoManage from '../views/ShopInfoManage.vue'
import CategoryManage from '../views/CategoryManage.vue'
import ProductManage from '../views/ProductManage.vue'
import InquiryManage from '../views/InquiryManage.vue'
import UserManage from '../views/UserManage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/purchase', name: 'PurchaseCart', component: PurchaseCart },
  { path: '/inquiry/:id', name: 'InquiryDetail', component: InquiryDetail },
  { path: '/inquiries', name: 'Inquiries', component: Inquiries },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/profile-edit', name: 'ProfileEdit', component: ProfileEdit },
  { path: '/level-intro', name: 'LevelIntro', component: LevelIntro },
  { path: '/shop-manage', name: 'ShopManage', component: ShopManage },
  { path: '/shop-info-manage', name: 'ShopInfoManage', component: ShopInfoManage },
  { path: '/category-manage', name: 'CategoryManage', component: CategoryManage },
  { path: '/product-manage', name: 'ProductManage', component: ProductManage },
  { path: '/inquiry-manage', name: 'InquiryManage', component: InquiryManage },
  { path: '/user-manage', name: 'UserManage', component: UserManage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
