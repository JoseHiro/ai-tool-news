import Link from 'next/link'
import { DISCLAIMER_SHORT } from '@/lib/disclaimer'

export const metadata = {
  title: '免責事項 — DevKnow',
}

export default function TermsPage() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          style={{ color: 'var(--text-muted)' }}
          className="mb-6 inline-block text-sm transition-colors hover:text-[var(--text)]"
        >
          ← トップへ
        </Link>
        <h1 style={{ color: 'var(--text)' }} className="mb-6 text-2xl font-bold">
          免責事項
        </h1>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <section>
            <h2 style={{ color: 'var(--text)' }} className="mb-2 font-semibold">
              AI 生成コンテンツについて
            </h2>
            <p>{DISCLAIMER_SHORT}</p>
            <p className="mt-3">
              重要な判断（投資、契約、医療・法律上の判断など）を行う際は、必ず一次情報や専門家の助言を参照してください。
            </p>
          </section>
          <section>
            <h2 style={{ color: 'var(--text)' }} className="mb-2 font-semibold">
              情報の正確性
            </h2>
            <p>
              当サービスは、AI および外部ソースをもとに情報を整理・要約しています。掲載内容の正確性、完全性、最新性について保証しません。リンク先の第三者サービスやツールの仕様は予告なく変更される場合があります。
            </p>
          </section>
          <section>
            <h2 style={{ color: 'var(--text)' }} className="mb-2 font-semibold">
              個人開発アイデアについて
            </h2>
            <p>
              アイデア分析・スコアは参考情報です。市場規模や収益見込みなどは調査時点の推測を含みます。事業判断はご自身の責任で行ってください。
            </p>
          </section>
          <section>
            <h2 style={{ color: 'var(--text)' }} className="mb-2 font-semibold">
              サービスの変更
            </h2>
            <p>
              本免責事項は、必要に応じて予告なく変更することがあります。変更後もサービスを利用された場合、変更後の内容に同意したものとみなします。
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
