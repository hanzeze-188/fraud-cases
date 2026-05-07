'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface Props {
  caseId: number;
}

export function CaseShareButton({ caseId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/cases/${caseId}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('链接已复制到剪贴板，可以粘贴到微信分享');
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        分享
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">分享到微信</h3>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 border border-gray-200 rounded-lg">
                <QRCodeSVG value={url} size={180} />
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mb-4">扫二维码在微信中打开</p>
            <button
              onClick={copyLink}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 mb-2"
            >
              复制链接
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full text-gray-400 text-sm hover:text-gray-600"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
