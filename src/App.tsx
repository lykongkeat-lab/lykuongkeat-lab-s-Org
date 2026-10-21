import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';

// Public Pages
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CategoryPage from './pages/CategoryPage';
import TagPage from './pages/TagPage';
import SearchPage from './pages/SearchPage';
import CVPage from './pages/CVPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Admin Core & Pages
import Login from './pages/admin/Login';
import RequireAdmin from './components/admin/RequireAdmin';
import Dashboard from './pages/admin/Dashboard';
import PostsAdmin from './pages/admin/PostsAdmin';
import PostEditor from './pages/admin/PostEditor';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import CommentsAdmin from './pages/admin/CommentsAdmin';
import AdsAdmin from './pages/admin/AdsAdmin';
import MediaAdmin from './pages/admin/MediaAdmin';
import CVAdmin from './pages/admin/CVAdmin';
import MessagesAdmin from './pages/admin/MessagesAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/tag/:slug" element={<TagPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cv" element={<CVPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Dashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/posts"
            element={
              <RequireAdmin>
                <PostsAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/posts/new"
            element={
              <RequireAdmin>
                <PostEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/posts/edit/:id"
            element={
              <RequireAdmin>
                <PostEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RequireAdmin>
                <CategoriesAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <RequireAdmin>
                <CommentsAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/ads"
            element={
              <RequireAdmin>
                <AdsAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/media"
            element={
              <RequireAdmin>
                <MediaAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/cv"
            element={
              <RequireAdmin>
                <CVAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <RequireAdmin>
                <MessagesAdmin />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RequireAdmin>
                <SettingsAdmin />
              </RequireAdmin>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
