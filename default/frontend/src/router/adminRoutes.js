import AdminLayout from '../layouts/AdminLayout.vue';
import Dashboard from '../views/Dashboard.vue';
import Sach from '../views/Sach.vue';
import NhaXuatBan from '../views/NhaXuatBan.vue';
import UserList from '../views/UserList.vue';
import TheoDoiMuonSach from '../views/TheoDoiMuonSach.vue';

export default [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'sach', name: 'Sach', component: Sach },
      { path: 'nhaxuatban', name: 'NhaXuatBan', component: NhaXuatBan },
      { path: 'users', name: 'UserList', component: UserList },
      { path: 'theodoimuonsach', name: 'TheoDoiMuonSach', component: TheoDoiMuonSach },
    ]
  }
];
