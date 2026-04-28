'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownPreviewProps {
  content: string
  emptyMessage?: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-800 mt-3 mb-1 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-800 leading-relaxed mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1 text-gray-800 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-800 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-3 text-gray-600 italic bg-blue-50 rounded-r">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = !!className
    return isBlock ? (
      <code className={`${className} block`}>{children}</code>
    ) : (
      <code className="px-1.5 py-0.5 bg-gray-100 text-rose-600 rounded text-sm font-mono">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-3 overflow-x-auto text-sm font-mono">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 hover:underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-gray-700">{children}</em>
  ),
  hr: () => <hr className="border-gray-200 my-4" />,
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200">{children}</tbody>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-gray-700">{children}</td>
  ),
  del: ({ children }) => (
    <del className="line-through text-gray-500">{children}</del>
  ),
  input: ({ checked, disabled }) => (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      readOnly
      className="mr-1.5 accent-blue-600"
    />
  ),
}

export default function MarkdownPreview({
  content,
  emptyMessage = '미리보기할 내용이 없습니다.',
}: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="text-gray-400 text-sm italic py-4 text-center">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="prose-container text-sm leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  )
}
