export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">关于本站</h1>
      <div className="bg-white rounded-lg p-6 space-y-4 text-gray-700 leading-relaxed">
        <p>
          诈骗案例曝光平台是一个开放的社区，旨在让更多人分享自己遇到的诈骗经历，
          通过真实的案例帮助他人识别骗局，避免上当受骗。
        </p>
        <h2 className="text-lg font-semibold text-gray-900">我们的使命</h2>
        <p>
          每一个诈骗案例的分享，都可能帮助一个人避免损失。我们相信，信息的透明和共享
          是防范诈骗最有力的工具。
        </p>
        <h2 className="text-lg font-semibold text-gray-900">如何分享</h2>
        <p>
          注册账号后，点击"发布案例"按钮，填写诈骗方式、经过和细节。
          你还可以上传相关截图或证据，帮助其他人更好地识别类似骗局。
        </p>
        <h2 className="text-lg font-semibold text-gray-900">免责声明</h2>
        <p className="text-sm text-gray-500">
          本站内容由用户分享，仅供参考和警示。如遇到疑似诈骗情况，请及时报警。
        </p>
      </div>
    </div>
  );
}
