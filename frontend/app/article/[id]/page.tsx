"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Download, Share2, Clock, User, Calendar, RefreshCw, BookOpen, Eye, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getTaskOutput } from "@/lib/api"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Separator } from "@/components/ui/separator"

interface TaskOutputResponse {
  success: boolean;
  content: string;
  source: 'database' | 'file';
  message?: string;
  output_file?: string;
  metadata?: {
    created_at: string;
    title: string;
    status: string;
  };
}

export default function ArticlePage() {
  const [article, setArticle] = useState<TaskOutputResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readingTime, setReadingTime] = useState(0)
  const { token, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  // 计算阅读时间（假设每分钟阅读200个字）
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // 检查登录状态
  useEffect(() => {
    if (!authLoading && !token) {
      toast.error("请先登录")
      router.push("/login")
    }
  }, [token, authLoading, router])

  // 获取文章内容
  const fetchArticle = async () => {
    if (!token || !taskId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getTaskOutput(token, taskId)
      setArticle(response)
      if (response.content) {
        setReadingTime(calculateReadingTime(response.content))
      }
    } catch (error: any) {
      setError(error.message || "获取文章内容失败")
      toast.error("获取文章失败", {
        description: error.message || "网络错误或服务器异常",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && taskId) {
      fetchArticle()
    }
  }, [token, taskId])

  // 如果正在加载认证状态或未登录，显示加载状态
  if (authLoading || !token) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full mb-4"></div>
              <p className="text-lg text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // 格式化时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 下载文章
  const handleDownload = () => {
    if (!article?.content) return
    
    const blob = new Blob([article.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.metadata?.title || '文章'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("文章已下载")
  }

  // 分享文章
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.metadata?.title || '文章',
          text: '查看这篇文章',
          url: window.location.href,
        })
      } catch (error) {
        console.log('分享取消或失败')
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success("链接已复制到剪贴板")
      }).catch(() => {
        toast.error("复制链接失败")
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          {/* 顶部操作栏 */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchArticle}
                disabled={isLoading}
                className="hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              {article && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="flex items-center gap-2 hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <Download className="h-4 w-4" />
                    下载
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center gap-2 hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <Share2 className="h-4 w-4" />
                    分享
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
                </div>
                <p className="text-xl font-medium text-slate-700 dark:text-slate-300">正在加载精彩内容...</p>
                <p className="text-sm text-muted-foreground mt-2">请稍候片刻</p>
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {error && !isLoading && (
            <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:border-red-800 dark:from-red-950 dark:to-pink-950 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                  内容加载失败
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
                <Button onClick={fetchArticle} variant="outline" className="hover:shadow-md transition-all duration-200">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新加载
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 文章内容 */}
          {article && !isLoading && (
            <div className="space-y-8">
              {/* 文章头部信息 */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight mb-4">
                        {article.metadata?.title || '文章详情'}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {article.metadata?.created_at && (
                          <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                            <Calendar className="h-4 w-4" />
                            {formatDate(article.metadata.created_at)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                          <Clock className="h-4 w-4" />
                          约 {readingTime} 分钟阅读
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                          <BookOpen className="h-4 w-4" />
                          文档 #{taskId.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

                            {/* 文章正文 */}
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                <CardContent className="p-0">
                  {/* 文章内容区域 */}
                  <div className="p-8 lg:p-12">
                    <div className="markdown-content font-serif">
                      <style jsx>{`
                        .markdown-content ol li {
                          margin-bottom: 0.25rem;
                        }
                        .markdown-content ol li p {
                          margin-bottom: 0.25rem;
                          display: inline;
                        }
                        .markdown-content h2:has(+ ol) {
                          margin-bottom: 1rem;
                        }
                        .markdown-content h2 + ol {
                          margin-top: 0.5rem;
                        }
                        .markdown-content ol li a {
                          word-break: break-all;
                        }
                      `}</style>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          // 自定义标题渲染
                          h1: ({ children, ...props }) => (
                            <h1 {...props} className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700 leading-tight font-serif">
                              {children}
                            </h1>
                          ),
                          h2: ({ children, ...props }) => (
                            <h2 {...props} className="text-3xl font-bold text-slate-800 dark:text-slate-200 mt-12 mb-6 leading-tight font-serif">
                              {children}
                            </h2>
                          ),
                          h3: ({ children, ...props }) => (
                            <h3 {...props} className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mt-8 mb-4 leading-tight font-serif">
                              {children}
                            </h3>
                          ),
                          h4: ({ children, ...props }) => (
                            <h4 {...props} className="text-xl font-semibold text-slate-600 dark:text-slate-400 mt-6 mb-3 leading-tight font-serif">
                              {children}
                            </h4>
                          ),
                          // 自定义段落渲染
                          p: ({ children, ...props }) => (
                            <p {...props} className="text-base leading-7 text-slate-800 dark:text-slate-200 mb-4 text-justify font-serif tracking-wide">
                              {children}
                            </p>
                          ),
                          // 自定义列表渲染
                          ul: ({ children, ...props }) => (
                            <ul {...props} className="list-disc list-outside space-y-1 mb-4 ml-6 text-slate-800 dark:text-slate-200 font-serif">
                              {children}
                            </ul>
                          ),
                          ol: ({ children, ...props }) => (
                            <ol {...props} className="list-decimal list-outside space-y-1 mb-4 ml-6 text-slate-800 dark:text-slate-200 font-serif">
                              {children}
                            </ol>
                          ),
                          li: ({ children, ...props }) => (
                            <li {...props} className="text-base leading-6 mb-1 pl-2">
                              {children}
                            </li>
                          ),
                          // 自定义引用渲染
                          blockquote: ({ children, ...props }) => (
                            <blockquote {...props} className="border-l-3 border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800/30 pl-4 pr-3 py-2 my-4 text-slate-700 dark:text-slate-300 font-serif text-sm leading-relaxed">
                              {children}
                            </blockquote>
                          ),
                          // 自定义代码渲染
                          code: ({ children, ...props }) => (
                            <code {...props} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
                              {children}
                            </code>
                          ),
                          // 自定义代码块渲染
                          pre: ({ children, ...props }) => (
                            <div className="relative group my-8">
                              <pre {...props} className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-6 rounded-xl shadow-lg overflow-x-auto">
                                {children}
                              </pre>
                              <button
                                onClick={() => {
                                  const codeElement = (children as any)?.props?.children;
                                  const code = typeof codeElement === 'string' ? codeElement : '';
                                  navigator.clipboard.writeText(code);
                                  toast.success("代码已复制");
                                }}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                复制
                              </button>
                            </div>
                          ),
                          // 自定义表格渲染
                          table: ({ children, ...props }) => (
                            <div className="overflow-x-auto my-8 rounded-lg shadow-sm">
                              <table {...props} className="min-w-full border-collapse bg-white dark:bg-slate-900">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children, ...props }) => (
                            <th {...props} className="bg-slate-100 dark:bg-slate-800 px-6 py-4 text-left font-semibold text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                              {children}
                            </th>
                          ),
                          td: ({ children, ...props }) => (
                            <td {...props} className="px-6 py-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                              {children}
                            </td>
                          ),
                          // 自定义链接渲染
                          a: ({ href, children, ...props }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              {...props}
                              className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline underline-offset-2 decoration-1 hover:decoration-2 transition-all font-serif"
                            >
                              {children}
                            </a>
                          ),
                          // 自定义水平线渲染
                          hr: ({ ...props }) => (
                            <hr {...props} className="my-12 border-slate-200 dark:border-slate-700" />
                          ),
                          // 自定义强调文本
                          strong: ({ children, ...props }) => (
                            <strong {...props} className="font-bold text-slate-900 dark:text-slate-100">
                              {children}
                            </strong>
                          ),
                          em: ({ children, ...props }) => (
                            <em {...props} className="italic text-slate-600 dark:text-slate-400">
                              {children}
                            </em>
                          ),
                        }}
                      >
                        {article.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 文章底部信息 */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>文章已完成加载</span>
                      </div>
                      {article.output_file && (
                        <div className="flex items-center gap-2">
                          <span>输出文件: {article.output_file}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        保存文章
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        分享链接
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
} 