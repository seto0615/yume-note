import { useRef, useState } from 'react'
import type { AppData, Settings } from '../types'
import { normalize } from '../lib/storage'
import Modal from '../components/Modal'

interface Props {
  data: AppData
  onChange: (patch: Partial<Settings>) => void
  onReplaceAll: (data: AppData) => void
  onClose: () => void
}

export default function SettingsView({ data, onChange, onReplaceAll, onClose }: Props) {
  const { settings } = data
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yume-note-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File | undefined) => {
    if (!file) return
    setImportError(null)
    try {
      const parsed = JSON.parse(await file.text())
      const next = normalize(parsed)
      if (
        !confirm(
          `いま入っているデータを、このファイルの内容（夢 ${next.dreams.length}件・習慣 ${next.habits.length}件）で上書きします。よろしいですか？`,
        )
      )
        return
      onReplaceAll(next)
    } catch {
      setImportError('このファイルは読み込めませんでした。書き出したJSONを選んでください。')
    }
  }

  return (
    <Modal title="設定" onClose={onClose}>
      <div className="field">
        <label htmlFor="set-name">名前</label>
        <input
          id="set-name"
          type="text"
          value={settings.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="呼ばれたい名前"
        />
      </div>

      <div className="section-label" style={{ marginTop: 8 }}>
        背景
      </div>

      <div className="field">
        <div className="theme-picker">
          <button
            type="button"
            aria-pressed={settings.theme === 'dark'}
            onClick={() => onChange({ theme: 'dark' })}
          >
            <span className="swatch" style={{ background: '#04101c' }} />
            黒
          </button>
          <button
            type="button"
            aria-pressed={settings.theme === 'light'}
            onClick={() => onChange({ theme: 'light' })}
          >
            <span className="swatch" style={{ background: '#ffffff' }} />
            白
          </button>
        </div>
        <div className="hint">ヘッダーのアイコンからも切り替えられます。</div>
      </div>

      <div className="section-label">人生時計</div>

      <div className="field">
        <label htmlFor="set-birth">生年月日</label>
        <input
          id="set-birth"
          type="date"
          value={settings.birthDate}
          onChange={(e) => onChange({ birthDate: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="set-life">想定寿命（歳）</label>
        <input
          id="set-life"
          type="number"
          min={1}
          max={150}
          value={settings.lifeExpectancy}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v)) onChange({ lifeExpectancy: v })
          }}
        />
        <div className="hint">
          何歳まで生きるつもりかを自分で決める。残り日数はここから逆算される。
        </div>
      </div>

      <div className="section-label">究極の目標</div>

      <div className="field">
        <label htmlFor="set-goal">なりたい自分・人生観</label>
        <textarea
          id="set-goal"
          value={settings.ultimateGoal}
          onChange={(e) => onChange({ ultimateGoal: e.target.value })}
          placeholder="ピラミッドの頂点に置く一文。"
        />
      </div>

      <div className="section-label">データ</div>

      <div className="about" style={{ marginBottom: 12 }}>
        夢・習慣・写真はすべてこの端末のブラウザ内（localStorage）にだけ保存されます。サーバーには一切送信されません。
        端末を変えるとき、履歴を消すときは、下から書き出して持ち運んでください。
      </div>

      {importError && <div className="notice">{importError}</div>}

      <div className="row" style={{ marginBottom: 10 }}>
        <button className="btn btn-sm" onClick={exportJson}>
          書き出す
        </button>
        <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
          読み込む
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => void importJson(e.target.files?.[0])}
      />

      <div className="about">
        夢 {data.dreams.length}件 ／ 習慣 {data.habits.length}件
      </div>

      <div className="section-label">このアプリについて</div>
      <div className="about">
        熊谷正寿『一冊の手帳で夢は必ずかなう』および夢手帳・熊谷式の考え方を参考に、個人用として作った非公式のWebアプリです。GMOインターネットグループとは関係ありません。
        <br />
        公式アプリ「夢が、かなうアプリ。byGMO」は{' '}
        <a href="https://shop.kumagai.com/app/" target="_blank" rel="noreferrer">
          shop.kumagai.com/app
        </a>{' '}
        から。
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary btn-block" onClick={onClose}>
          閉じる
        </button>
      </div>
    </Modal>
  )
}
