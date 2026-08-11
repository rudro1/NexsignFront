
// import Landing        from '@/pages/Landing';
// import Dashboard      from '@/pages/Dashboard';
// import DocumentEditor from '@/pages/DocumentEditor';
// import SignerView     from '@/pages/SignerView';
// import AdminDashboard from '@/pages/AdminDashboard';
// import Templates      from '@/pages/Templates';
// import Audit          from '@/pages/Audit';
// import Auth           from '@/pages/Auth';
// import NewTemplate    from '@/pages/NewTemplate';
// import Layout         from './Layout.jsx';

// export const PAGES = {
//   landing:        Landing,
//   dashboard:      Dashboard,
//   DocumentEditor: DocumentEditor,
//   templates:      Templates,
//   'new-template': NewTemplate,
//   audit:          Audit,
//   sign:           SignerView,
//   admin:          AdminDashboard,
//   login:          Auth,
//   register:       Auth,
// };

// export const pagesConfig = {
//   mainPage: 'landing',
//   Pages:    PAGES,
//   Layout:   Layout,
// };
// src/pages.config.js
// NOTE: App.jsx uses lazy() routes directly.
// This file only exists for any legacy/external consumers.

export const ROUTE_MAP = {
  landing:          '/',
  pricing:          '/pricing',
  login:            '/login',
  register:         '/register',
  dashboard:        '/dashboard',
  documentEditor:   '/document-editor',
  templates:        '/templates',
  newTemplate:      '/templates/new',
  templateDetail:   '/templates/:id',
  documentDetail:   '/documents/:id',
  audit:            '/audit/:id',
  sign:             '/sign/:token',
  templateSign:     '/template-sign/:token',
  admin:            '/admin',
};

export default ROUTE_MAP;