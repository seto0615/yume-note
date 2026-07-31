/* 夢ノート — オフライン用 Service Worker
 *
 * HTML はネットワーク優先（デプロイした更新をすぐ反映）、
 * ハッシュ付きアセットとフォントはキャッシュ優先（オフラインでも開ける）。
 */

const CACHE = 'yume-note-v1'
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  // アプリシェルだけ先に温めておく。失敗してもインストールは通す。
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([self.registration.scope]))
      .catch(() => undefined),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin
  const isFont = FONT_HOSTS.includes(url.hostname)
  if (!sameOrigin && !isFont) return

  // ページ遷移：ネットワーク優先、落ちたらキャッシュのアプリシェル
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(self.registration.scope, copy))
          return res
        })
        .catch(() =>
          caches
            .match(self.registration.scope)
            .then((hit) => hit ?? Response.error()),
        ),
    )
    return
  }

  // それ以外：キャッシュ優先
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit
      return fetch(request)
        .then((res) => {
          // opaque を含め、取れたものは保存しておく
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => hit ?? Response.error())
    }),
  )
})
