import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BlogPost } from '@/lib/data'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 使用自动生成的封面 (由 just build 保证存在)
  const coverImage = `/blog/covers/${post.slug}.png`

  return (
    <Link href={`/blog/${post.slug}`}>
      <motion.article
        className="group cursor-pointer"
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative overflow-hidden rounded-lg bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-colors duration-300 hover:bg-gray-900/70 shadow-lg hover:shadow-xl hover:shadow-black/20">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <time className="font-medium">{formatDate(post.date)}</time>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <span className="font-medium">{post.readTime}</span>
              {post.featured && (
                <>
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  <span className="text-blue-400 font-medium">Featured</span>
                </>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-full border border-gray-700/50 hover:bg-gray-700/60 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 4 && (
                <span className="px-3 py-1 text-xs text-gray-400">
                  +{post.tags.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}
