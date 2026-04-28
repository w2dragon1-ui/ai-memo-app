'use client'

import { useEffect, useState, useCallback } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import MarkdownPreview from '@/components/MarkdownPreview'
import { summarizeMemoAction } from '@/app/actions/summarize'

interface MemoDetailModalProps {
  isOpen: boolean
  onClose: () => void
  memo: Memo | null
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetailModal({
  isOpen,
  onClose,
  memo,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => {
        document.removeEventListener('keydown', handleEscKey)
      }
    }
  }, [isOpen, onClose])

  // 메모가 바뀔 때 이전 요약 초기화
  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
  }, [memo?.id])

  const handleSummarize = useCallback(async () => {
    if (!memo) return
    setSummaryLoading(true)
    setSummaryError(null)
    setSummary(null)
    try {
      const result = await summarizeMemoAction(memo.id)
      setSummary(result)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '요약에 실패했습니다.'
      setSummaryError(message)
    } finally {
      setSummaryLoading(false)
    }
  }, [memo])

  if (!isOpen || !memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStickyColor = (category: string) => {
    const colors = {
      personal: 'bg-sky-100',
      work: 'bg-emerald-100',
      study: 'bg-violet-100',
      idea: 'bg-amber-100',
      other: 'bg-stone-100',
    }
    return colors[category as keyof typeof colors] ?? colors.other
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      personal: 'text-blue-800',
      work: 'text-green-800',
      study: 'text-purple-800',
      idea: 'text-yellow-800',
      other: 'text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleEdit = () => {
    onEdit(memo)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  const handleBackdropClick = () => {
    onClose()
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`sticky-note-modal rounded-sm shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${getStickyColor(memo.category)}`}
        onClick={handleContentClick}
      >
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">메모 상세</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-black/10 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 내용 */}
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {memo.title}
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/50 ${getCategoryBadgeColor(memo.category)}`}
              >
                {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                  memo.category}
              </span>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용
              </label>
              <div className="text-gray-900">
                <MarkdownPreview content={memo.content} />
              </div>
            </div>

            {/* 태그 */}
            {memo.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그
                </label>
                <div className="flex gap-2 flex-wrap">
                  {memo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/50 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI 요약 */}
            <div className="pt-4 border-t border-black/10">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  AI 요약
                </label>
                <button
                  onClick={handleSummarize}
                  disabled={summaryLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/60 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-black/10"
                >
                  {summaryLoading ? (
                    <>
                      <svg
                        className="w-3 h-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      요약 중...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {summary ? '다시 요약' : '요약하기'}
                    </>
                  )}
                </button>
              </div>

              {summaryError && (
                <p className="text-sm text-red-600 bg-red-50/70 rounded-lg px-3 py-2">
                  {summaryError}
                </p>
              )}

              {summary && !summaryError && (
                <div className="bg-white/50 rounded-lg px-4 py-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>
              )}

              {!summary && !summaryError && !summaryLoading && (
                <p className="text-xs text-gray-400 italic">
                  요약하기 버튼을 눌러 AI가 메모를 요약하게 하세요.
                </p>
              )}
            </div>

            {/* 날짜 정보 */}
            <div className="pt-4 border-t border-black/10">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">작성일:</span>{' '}
                  {formatDate(memo.createdAt)}
                </div>
                <div>
                  <span className="font-medium">수정일:</span>{' '}
                  {formatDate(memo.updatedAt)}
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                편집
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
