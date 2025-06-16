import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BlogPost, SeoSuggestions } from '../../types';
import {
    fetchBlogPostBySlug,
    createBlogPostAdmin,
    updateBlogPostAdmin,
    fetchAllBlogPostsAdmin,
    generateSeoSuggestions
} from '../../services/api';
import { ADMIN_ROUTE_PATHS } from '../../constants';

// Helper function to fetch post by ID for editing
const fetchPostByIdForEditing = async (postId: string): Promise<BlogPost | undefined> => {
    const allPosts = await fetchAllBlogPostsAdmin();
    return allPosts.find(p => p.id === postId);
};


const AdminPostForm: React.FC = () => {
  const { postId } = useParams<{ postId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(postId);

  const initialPostState: Partial<BlogPost> = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    author_name: 'CUANLABS Team',
    image_url: '',
    is_published: false,
  };

  const [post, setPost] = useState<Partial<BlogPost>>(initialPostState);
  const [loading, setLoading] = useState<boolean>(false); // For form submission
  const [pageLoading, setPageLoading] = useState<boolean>(false); // For initial data fetch
  const [formError, setFormError] = useState<string | null>(null);
  const [slugWasManuallyEdited, setSlugWasManuallyEdited] = useState<boolean>(false);

  // SEO Suggestions State
  const [seoSuggestions, setSeoSuggestions] = useState<SeoSuggestions | null>(null);
  const [seoLoading, setSeoLoading] = useState<boolean>(false);
  const [seoError, setSeoError] = useState<string | null>(null);


  useEffect(() => {
    if (isEditing && postId) {
      setPageLoading(true);
      fetchPostByIdForEditing(postId)
        .then(data => {
          if (data) {
            setPost(data);
            if (data.slug && data.slug.trim() !== '') {
              setSlugWasManuallyEdited(true); // Existing slug, assume manual or fixed
            } else {
              setSlugWasManuallyEdited(false); // Existing post but empty slug, allow auto-gen
            }
          } else {
            setFormError('Artikel tidak ditemukan.');
            setSlugWasManuallyEdited(false); // Not found, treat as new form
          }
        })
        .catch(err => {
          console.error('Error fetching post details for edit:', err.message || err);
          setFormError(`Gagal memuat data artikel: ${err.message || 'Error tidak diketahui'}`);
          setSlugWasManuallyEdited(false);
        })
        .finally(() => setPageLoading(false));
    } else {
      // New post form: reset state
      setPost(initialPostState);
      setSlugWasManuallyEdited(false);
      setFormError(null);
      setSeoSuggestions(null); // Clear SEO suggestions for new post
      setSeoError(null);
      setPageLoading(false);
    }
  }, [postId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPost(prev => ({ ...prev, [name]: checked }));
    } else {
      // Handle text/select inputs
      setPost(prevPost => {
        const updatedPost = { ...prevPost, [name]: value };

        // If title changed, and it's a new post (or existing post with empty slug)
        // and slug hasn't been manually edited yet, update slug
        if (name === 'title' && (!isEditing || (isEditing && !prevPost.slug)) && !slugWasManuallyEdited) {
          updatedPost.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        }
        return updatedPost;
      });

      // If user directly edits the slug field (for new post, or existing post if slug was empty),
      // mark it as manually edited.
      if (name === 'slug' && (!isEditing || (isEditing && !post.slug))) {
        // Only set to true if the value is not empty, to allow clearing slug to re-enable auto-gen
        if(value.trim() !== '') {
            setSlugWasManuallyEdited(true);
        } else {
            // If user clears the slug, allow auto-generation again from title
            setSlugWasManuallyEdited(false);
             // And immediately regenerate from current title if title exists
            setPost(prev => ({
                ...prev,
                slug: (prev.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
            }));
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    if (!post.title || !post.slug || !post.content) {
        setFormError("Judul, slug, dan konten wajib diisi.");
        setLoading(false);
        return;
    }

    try {
      const postDataToSave: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'> & { published_at?: string | null } = {
        title: post.title!,
        slug: post.slug!,
        summary: post.summary || '',
        content: post.content!,
        author_name: post.author_name || 'CUANLABS Team',
        image_url: post.image_url || 'https://via.placeholder.com/800x400?text=Blog+Image',
        is_published: post.is_published === undefined ? false : post.is_published,
      };

      if (postDataToSave.is_published) {
        if (!post.published_at) {
          postDataToSave.published_at = new Date().toISOString();
        } else {
          postDataToSave.published_at = post.published_at;
        }
      } else {
        postDataToSave.published_at = null;
      }

      if (isEditing && postId) {
        const updatePayload: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>> = {
            ...postDataToSave
        };
        await updateBlogPostAdmin(postId, updatePayload);
      } else {
        const createPayload: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'> & { published_at?: string | null } = postDataToSave;
        await createBlogPostAdmin(createPayload as Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'>);
      }
      navigate(ADMIN_ROUTE_PATHS.ADMIN_POSTS);
    } catch (err: any) {
      console.error('Failed to save post:', err.message || err);
      setFormError(`Gagal menyimpan artikel: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSeoSuggestions = async () => {
    if (!post.title || !post.content) {
        setSeoError("Judul dan Konten artikel harus diisi untuk mendapatkan rekomendasi SEO.");
        return;
    }
    setSeoLoading(true);
    setSeoError(null);
    setSeoSuggestions(null);
    try {
        const contentSummary = post.content.substring(0, 500);
        const suggestions = await generateSeoSuggestions(post.title, contentSummary);
        setSeoSuggestions(suggestions);
    } catch (err: any) {
        console.error("Error generating SEO suggestions:", err.message || err);
        setSeoError(`Gagal mendapatkan rekomendasi SEO: ${err.message || 'Error tidak diketahui'}`);
    } finally {
        setSeoLoading(false);
    }
  };

  if (pageLoading) {
     return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-700">Memuat detail artikel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Artikel' : 'Tulis Artikel Baru'}
      </h1>

      {formError && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{formError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel <span className="text-red-500">*</span></label>
          <input type="text" name="title" id="title" value={post.title || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL friendly) <span className="text-red-500">*</span></label>
          <input type="text" name="slug" id="slug" value={post.slug || ''} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-gray-50" placeholder="otomatis-terisi-atau-edit-manual"/>
           {(!isEditing && !slugWasManuallyEdited) && <p className="text-xs text-gray-500 mt-1">Slug akan terisi otomatis dari judul. Anda bisa mengubahnya manual.</p>}
           {(isEditing && !slugWasManuallyEdited && !post.slug) && <p className="text-xs text-gray-500 mt-1">Slug akan terisi otomatis dari judul jika dikosongkan. Anda bisa mengubahnya manual.</p>}
           {slugWasManuallyEdited && <p className="text-xs text-gray-500 mt-1">Slug diubah manual. Hapus isi untuk mengaktifkan kembali otomatis dari judul.</p>}
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Ringkasan (Opsional)</label>
          <textarea name="summary" id="summary" value={post.summary || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"></textarea>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Konten Artikel <span className="text-red-500">*</span></label>
          <textarea name="content" id="content" value={post.content || ''} onChange={handleChange} rows={15} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" placeholder="Tulis konten Anda di sini. Anda bisa menggunakan Markdown."></textarea>
          <p className="text-xs text-gray-500 mt-1">Anda bisa menggunakan format Markdown untuk styling.</p>
        </div>

        {/* SEO Suggestions Section */}
        <div className="my-6 p-4 border border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bantuan SEO (AI)</h3>
            <button
                type="button"
                onClick={handleGenerateSeoSuggestions}
                disabled={seoLoading || !post.title || !post.content}
                className="mb-3 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md transition-colors disabled:bg-gray-400 flex items-center"
            >
                {seoLoading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Memuat...</>
                ) : (
                    <><i className="fas fa-magic mr-2"></i>Buat Rekomendasi SEO</>
                )}
            </button>
            {seoError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{seoError}</p>}
            {seoSuggestions && (
                <div className="space-y-3 mt-2 text-sm text-gray-600">
                    {seoSuggestions.seoTitle && <div><strong>Judul SEO:</strong> {seoSuggestions.seoTitle}</div>}
                    {seoSuggestions.metaDescription && <div><strong>Meta Deskripsi:</strong> {seoSuggestions.metaDescription}</div>}
                    {seoSuggestions.keywords && seoSuggestions.keywords.length > 0 && (
                        <div><strong>Kata Kunci:</strong> {seoSuggestions.keywords.join(', ')}</div>
                    )}
                     <p className="text-xs text-gray-500">Salin rekomendasi di atas secara manual ke field artikel atau gunakan sebagai inspirasi.</p>
                </div>
            )}
        </div>
        {/* End SEO Suggestions Section */}

        <div>
          <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">Nama Penulis</label>
          <input type="text" name="author_name" id="author_name" value={post.author_name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" />
        </div>
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">URL Gambar Utama</label>
          <input type="url" name="image_url" id="image_url" value={post.image_url || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" placeholder="https://example.com/blog-image.jpg"/>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="is_published" id="is_published" checked={post.is_published || false} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
          <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">Publikasikan Artikel</label>
        </div>
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to={ADMIN_ROUTE_PATHS.ADMIN_POSTS} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
            {loading ? (isEditing ? 'Menyimpan...' : 'Menerbitkan...') : (isEditing ? 'Simpan Perubahan' : (post.is_published ? 'Terbitkan Artikel' : 'Simpan sebagai Draft'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPostForm;