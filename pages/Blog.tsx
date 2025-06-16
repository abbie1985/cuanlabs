
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { fetchBlogPosts } from '../services/api';
import { ROUTE_PATHS } from '../constants'; // Added import

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <article className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:shadow-xl transition-shadow duration-300">
    <Link to={`/blog/${post.slug}`} className="block">
      <img src={post.imageUrl} alt={post.title} className="w-full h-56 object-cover" />
    </Link>
    <div className="p-6">
      <p className="text-sm text-gray-500 mb-1">{new Date(post.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} - By {post.author}</p>
      <Link to={`/blog/${post.slug}`}>
        <h2 className="text-2xl font-semibold mb-2 text-darktext hover:text-primary transition-colors">{post.title}</h2>
      </Link>
      <p className="text-gray-700 mb-4 text-sm leading-relaxed h-20 overflow-hidden">{post.summary}</p>
      <Link 
        to={`/blog/${post.slug}`} 
        className="inline-block font-medium text-primary hover:text-primary-hover transition-colors"
      >
        Baca Selengkapnya <i className="fas fa-arrow-right ml-1"></i>
      </Link>
    </div>
  </article>
);


// Placeholder for Single Blog Post Page (not fully implemented in this scope, but shows structure)
export const SingleBlogPostPage: React.FC = () => {
    // const { slug } = useParams<{ slug: string }>(); // React Router's useParams
    // const [post, setPost] = useState<BlogPost | null>(null);
    // useEffect to fetch post by slug
    // For now, a placeholder:
    return (
        <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold">Judul Artikel Blog</h1>
            <p className="text-gray-600 my-4">Ini adalah konten artikel blog...</p>
            <Link to={ROUTE_PATHS.BLOG} className="text-primary hover:underline">&larr; Kembali ke Blog</Link>
        </div>
    );
};


const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await fetchBlogPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Gagal memuat artikel blog. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4">Memuat artikel...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Blog CUANLABS</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Dapatkan insight, tips, dan strategi terbaru seputar dunia digital, bisnis online, dan cara menghasilkan cuan.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Belum ada artikel yang dipublikasikan.</p>
      )}
    </div>
  );
};

export default Blog;
