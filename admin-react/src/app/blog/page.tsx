'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import ImageUpload from '../../components/ImageUpload';
import { PlusIcon, PencilIcon, TrashIcon, DocumentTextIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { env } from '../../config/env';
import { getToken } from '../../utils/auth';
import { getProxiedImageUrl } from '../../utils/imageProxy';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_featured: boolean;
  allow_comments: boolean;
  view_count: number;
  reading_time?: number;
  published_at?: string;
  scheduled_at?: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  tags?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  display_order: number;
  post_count: number;
  created_by_name?: string;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  post_count: number;
}

interface BlogStats {
  statusStats: { status: string; count: number }[];
  categoryStats: { name: string; color: string; count: number }[];
  totalStats: {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    scheduled_posts: number;
    new_last_30_days: number;
    total_views: number;
    featured_posts: number;
  };
  popularPosts: { id: string; title: string; view_count: number; published_at: string }[];
  commentsStats: {
    total_comments: number;
    pending_comments: number;
    approved_comments: number;
  };
}

const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800' }
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'tags' | 'settings'>('posts');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'post' | 'category' | 'tag'>('post');
  const [editingItem, setEditingItem] = useState<BlogPost | BlogCategory | BlogTag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [blogSettings, setBlogSettings] = useState({
    blog_page_title: '',
    blog_page_subtitle: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Form state for post creation/editing
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft' as const,
    is_featured: false,
    allow_comments: true,
    reading_time: 5,
    published_at: '',
    scheduled_at: '',
    category_id: '',
    tags: [] as string[]
  });

  // Form state for category
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#6B7280',
    display_order: 0
  });

  // Form state for tag
  const [tagForm, setTagForm] = useState({
    name: '',
    slug: '',
    color: '#3B82F6'
  });

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category_id', categoryFilter);
      
      const [postsRes, categoriesRes, tagsRes, statsRes] = await Promise.all([
        fetch(`${env.API_URL}/api/admin/blog/posts?${params}`, {
          headers: getAuthHeaders()
        }),
        fetch(`${env.API_URL}/api/admin/blog/categories`, {
          headers: getAuthHeaders()
        }),
        fetch(`${env.API_URL}/api/admin/blog/tags`, {
          headers: getAuthHeaders()
        }),
        fetch(`${env.API_URL}/api/admin/blog/stats`, {
          headers: getAuthHeaders()
        })
      ]);

      if (!postsRes.ok || !categoriesRes.ok || !tagsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [postsData, categoriesData, tagsData, statsData] = await Promise.all([
        postsRes.json(),
        categoriesRes.json(),
        tagsRes.json(),
        statsRes.json()
      ]);

      setPosts(postsData.data || []);
      setCategories(categoriesData.data || []);
      setTags(tagsData.data || []);
      setStats(statsData.data);
    } catch (err: unknown) {
      setError('Failed to load blog data');
      console.error('Error fetching data:', err);
      toast.error('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchData();
    loadBlogSettings();
  }, [fetchData]); // loadBlogSettings is stable

  const loadBlogSettings = async () => {
    try {
      const response = await fetch(`${env.API_URL}/api/blog/public/settings`);
      const data = await response.json();
      
      if (data.success && data.data?.settings) {
        setBlogSettings(data.data.settings);
      }
    } catch (err) {
      console.error('Error loading blog settings:', err);
      toast.error('Failed to load blog settings');
    }
  };

  const saveBlogSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await fetch(`${env.API_URL}/api/admin/blog/settings`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogSettings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Blog settings updated successfully');
      } else {
        toast.error(data.message || 'Failed to update blog settings');
      }
    } catch (err) {
      console.error('Error saving blog settings:', err);
      toast.error('Failed to save blog settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const openModal = (type: 'post' | 'category' | 'tag', item?: BlogPost | BlogCategory | BlogTag) => {
    setModalType(type);
    setEditingItem(item || null);
    
    if (type === 'post') {
      if (item && 'title' in item) {
        const blogPost = item as BlogPost;
        setPostForm({
          title: blogPost.title || '',
          slug: blogPost.slug || '',
          excerpt: blogPost.excerpt || '',
          content: blogPost.content || '',
          featured_image: blogPost.featured_image || '',
          meta_title: blogPost.meta_title || '',
          meta_description: blogPost.meta_description || '',
          meta_keywords: blogPost.meta_keywords || '',
          status: blogPost.status || 'draft' as 'draft' | 'published' | 'scheduled' | 'archived',
          is_featured: blogPost.is_featured || false,
          allow_comments: blogPost.allow_comments !== false,
          reading_time: blogPost.reading_time || 5,
          published_at: blogPost.published_at ? new Date(blogPost.published_at).toISOString().slice(0, 16) : '',
          scheduled_at: blogPost.scheduled_at ? new Date(blogPost.scheduled_at).toISOString().slice(0, 16) : '',
          category_id: blogPost.category_id || '',
          tags: []
        });
      } else {
        setPostForm({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          featured_image: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          status: 'draft',
          is_featured: false,
          allow_comments: true,
          reading_time: 5,
          published_at: '',
          scheduled_at: '',
          category_id: '',
          tags: []
        });
      }
    } else if (type === 'category') {
      if (item && 'name' in item) {
        const blogCategory = item as BlogCategory;
        setCategoryForm({
          name: blogCategory.name || '',
          slug: blogCategory.slug || '',
          description: blogCategory.description || '',
          color: blogCategory.color || '#6B7280',
          display_order: blogCategory.display_order || 0
        });
      } else {
        setCategoryForm({
          name: '',
          slug: '',
          description: '',
          color: '#6B7280',
          display_order: 0
        });
      }
    } else if (type === 'tag') {
      if (item && 'name' in item) {
        const blogTag = item as BlogTag;
        setTagForm({
          name: blogTag.name || '',
          slug: blogTag.slug || '',
          color: blogTag.color || '#3B82F6'
        });
      } else {
        setTagForm({
          name: '',
          slug: '',
          color: '#3B82F6'
        });
      }
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setError('');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Auto-generate slug if empty
      const formData = { ...postForm };
      if (!formData.slug && formData.title) {
        formData.slug = generateSlug(formData.title);
      }
      
      // Clean up data - ensure required fields are properly formatted
      const submitData = {
        ...formData,
        // Ensure slug is present
        slug: formData.slug || generateSlug(formData.title),
        // Ensure required fields are not empty
        title: formData.title?.trim() || '',
        content: formData.content?.trim() || '',
        // Clean up optional fields - convert empty strings to null for datetime fields
        published_at: formData.published_at?.trim() || null,
        scheduled_at: formData.scheduled_at?.trim() || null,
        category_id: formData.category_id?.trim() || null,
        // Ensure proper data types
        reading_time: parseInt(formData.reading_time?.toString() || '5'),
        is_featured: Boolean(formData.is_featured),
        allow_comments: Boolean(formData.allow_comments),
        // Ensure tags is an array
        tags: Array.isArray(formData.tags) ? formData.tags : []
      };

      console.log('Submitting blog post data:', submitData);

      const url = editingItem 
        ? `${env.API_URL}/api/admin/blog/posts/${editingItem.id}`
        : `${env.API_URL}/api/admin/blog/posts`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Blog post submission error:', errorData);
        throw new Error(errorData.message || 'Failed to save post');
      }

      const message = editingItem ? 'Blog post updated successfully!' : 'Blog post created successfully!';
      toast.success(message);
      await fetchData();
      closeModal();
    } catch (err: unknown) {
      console.error('Blog post submission error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to save blog post');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const isEditing = editingItem && modalType === 'category';
      const url = isEditing 
        ? `${env.API_URL}/api/admin/blog/categories/${editingItem.id}`
        : `${env.API_URL}/api/admin/blog/categories`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save category');
      }

      toast.success(`Blog category ${isEditing ? 'updated' : 'created'} successfully!`);
      await fetchData();
      closeModal();
    } catch (err: unknown) {
      setError(err.message);
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const isEditing = editingItem && modalType === 'tag';
      const url = isEditing 
        ? `${env.API_URL}/api/admin/blog/tags/${editingItem.id}`
        : `${env.API_URL}/api/admin/blog/tags`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tagForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save tag');
      }

      toast.success(`Blog tag ${isEditing ? 'updated' : 'created'} successfully!`);
      await fetchData();
      closeModal();
    } catch (err: unknown) {
      setError(err.message);
      toast.error(err.message || 'Failed to save tag');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`${env.API_URL}/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      toast.success('Blog post deleted successfully!');
      await fetchData();
    } catch (err: unknown) {
      setError('Failed to delete post');
      toast.error(err.message || 'Failed to delete post');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${env.API_URL}/api/admin/blog/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }

      toast.success('Blog category deleted successfully!');
      await fetchData();
    } catch (err: unknown) {
      setError('Failed to delete category');
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${env.API_URL}/api/admin/blog/tags/${tagId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tag');
      }

      toast.success('Blog tag deleted successfully!');
      await fetchData();
    } catch (err: unknown) {
      setError('Failed to delete tag');
      toast.error(err.message || 'Failed to delete tag');
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Manage blog posts, categories, and tags for your website</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalStats.total_posts.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalStats.published_posts.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalStats.total_views.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Comments</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.commentsStats.total_comments.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Blog Posts
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tags'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Blog Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {/* Filters and Search */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:flex sm:items-center sm:space-x-4">
                    <div className="relative min-w-80 flex-shrink-0">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search posts..."
                        className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 sm:mt-0 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Statuses</option>
                      {STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="mt-1 sm:mt-0 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => openModal('post')}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Table */}
            <div className="flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Post
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                              Loading blog posts...
                            </td>
                          </tr>
                        ) : posts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                              No blog posts found
                            </td>
                          </tr>
                        ) : (
                          posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    {post.featured_image ? (
                                      <img className="h-12 w-12 rounded-lg object-cover" src={getProxiedImageUrl(post.featured_image)} alt="" />
                                    ) : (
                                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center">
                                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                      {post.is_featured === true && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">/{post.slug}</div>
                                    {post.excerpt && (
                                      <div className="text-sm text-gray-500 mt-1 truncate max-w-md">{post.excerpt}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {post.category_name ? (
                                  <span 
                                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                                    style={{ backgroundColor: post.category_color }}
                                  >
                                    {post.category_name}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-500">Uncategorized</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  STATUSES.find(s => s.value === post.status)?.color || 'bg-gray-100 text-gray-800'
                                }`}>
                                  {STATUSES.find(s => s.value === post.status)?.label || post.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {post.view_count.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(post.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => openModal('post', post)}
                                  className="text-orange-600 hover:text-orange-900 mr-3"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Categories</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Organize your blog posts into categories for better navigation
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => openModal('category')}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                {categories.map((category) => (
                  <div key={category.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-500">/{category.slug}</p>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {category.post_count} posts
                        </span>
                        <button
                          onClick={() => openModal('category', category)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600 hover:text-red-900"
                          disabled={category.post_count > 0}
                          title={category.post_count > 0 ? 'Cannot delete category with posts' : 'Delete category'}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">No categories found</p>
                    <p className="mb-4">Create your first blog category to organize your posts.</p>
                    <button
                      onClick={() => openModal('category')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                      Create Category
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Tags</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Create tags to help categorize and filter your blog content
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => openModal('tag')}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <div 
                      key={tag.id} 
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium text-white group"
                      style={{ backgroundColor: tag.color }}
                    >
                      <span>{tag.name}</span>
                      <span className="ml-2 text-xs opacity-75">({tag.post_count})</span>
                      <div className="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal('tag', tag)}
                          className="text-white hover:text-gray-200 p-1"
                          title="Edit tag"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                          className="text-white hover:text-gray-200 p-1"
                          title="Delete tag"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {tags.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-lg font-medium mb-2">No tags found</p>
                    <p className="mb-4">Create your first blog tag to help organize content.</p>
                    <button
                      onClick={() => openModal('tag')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                    >
                      Create Tag
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl min-h-[80vh] max-h-[90vh] shadow-lg rounded-md bg-white overflow-y-auto">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingItem ? 'Edit' : 'Create'} {
                      modalType === 'post' ? 'Blog Post' :
                      modalType === 'category' ? 'Category' : 'Tag'
                    }
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Post Form */}
                {modalType === 'post' && (
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={postForm.title}
                        onChange={(e) => {
                          setPostForm(prev => ({ ...prev, title: e.target.value }));
                          // Always auto-generate slug from title
                          setPostForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {postForm.slug && (
                        <p className="text-xs text-gray-500 mt-1">
                          URL: /blog/{postForm.slug}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Brief description of the post..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                      </label>
                      <textarea
                        required
                        rows={8}
                        value={postForm.content}
                        onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Enter HTML content..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={postForm.category_id}
                          onChange={(e) => setPostForm(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={postForm.status}
                          onChange={(e) => setPostForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'scheduled' | 'archived' }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {STATUSES.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reading Time (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={postForm.reading_time}
                          onChange={(e) => setPostForm(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      <ImageUpload
                        currentImage={postForm.featured_image}
                        onImageUploaded={(imageUrl) => setPostForm(prev => ({ ...prev, featured_image: imageUrl }))}
                        onImageRemoved={() => setPostForm(prev => ({ ...prev, featured_image: '' }))}
                        uploadType="blog"
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={postForm.is_featured}
                        onChange={(e) => setPostForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                        Featured post
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Category Form */}
                {modalType === 'category' && (
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={categoryForm.name}
                          onChange={(e) => {
                            setCategoryForm(prev => ({ ...prev, name: e.target.value }));
                            if (!editingItem && !categoryForm.slug) {
                              setCategoryForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={categoryForm.display_order}
                          onChange={(e) => setCategoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Tag Form */}
                {modalType === 'tag' && (
                  <form onSubmit={handleTagSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={tagForm.name}
                          onChange={(e) => {
                            setTagForm(prev => ({ ...prev, name: e.target.value }));
                            if (!editingItem && !tagForm.slug) {
                              setTagForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                            }
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={tagForm.slug}
                          onChange={(e) => setTagForm(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={tagForm.color}
                        onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Page Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure the title and subtitle displayed on your blog page
                    </p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); saveBlogSettings(); }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blog Page Title
                    </label>
                    <input
                      type="text"
                      value={blogSettings.blog_page_title}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, blog_page_title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="BLOG LISTS"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Main heading displayed at the top of the blog page
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blog Page Subtitle
                    </label>
                    <textarea
                      rows={3}
                      value={blogSettings.blog_page_subtitle}
                      onChange={(e) => setBlogSettings(prev => ({ ...prev, blog_page_subtitle: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Offer a range of fresh juices, smoothies, parfaits, salads, wraps, and other healthy options"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Subtitle text that appears below the main heading
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={settingsLoading}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {settingsLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}