import { useEffect, useState, type ReactElement } from 'react'
import type { FieldId } from './types'
import { useStore } from './lib/storage'
import ClockView from './views/ClockView'
import DreamsView from './views/DreamsView'
import PyramidView from './views/PyramidView'
import TimelineView from './views/TimelineView'
import HabitsView from './views/HabitsView'
import SettingsView from './views/SettingsView'
import DreamDetail from './components/DreamDetail'
import DreamEditor from './components/DreamEditor'
import Geo from './components/Geo'
import {
  IconClock,
  IconGear,
  IconHabit,
  IconList,
  IconMoon,
  IconPyramid,
  IconSun,
  IconTimeline,
} from './components/icons'

type Tab = 'clock' | 'dreams' | 'pyramid' | 'timeline' | 'habits'

const TABS: { id: Tab; label: string; title: string; eyebrow: string; Icon: () => ReactElement }[] = [
  { id: 'clock', label: '人生時計', title: '人生時計', eyebrow: 'Life Clock', Icon: IconClock },
  { id: 'dreams', label: '夢リスト', title: 'やりたいことリスト', eyebrow: 'Dreams', Icon: IconList },
  { id: 'pyramid', label: 'ピラミッド', title: '夢・人生ピラミッド', eyebrow: 'Pyramid', Icon: IconPyramid },
  { id: 'timeline', label: '年表', title: '未来年表', eyebrow: 'Timeline', Icon: IconTimeline },
  { id: 'habits', label: '習慣', title: 'DWMYリスト', eyebrow: 'Habits', Icon: IconHabit },
]

export default function App() {
  const store = useStore()
  const [tab, setTab] = useState<Tab>('clock')
  const [field, setField] = useState<FieldId | 'all'>('all')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [composingDream, setComposingDream] = useState(false)
  const [composingHabit, setComposingHabit] = useState(false)
  /** 年表から開いた夢の詳細 */
  const [peek, setPeek] = useState<string | null>(null)
  const [peekEdit, setPeekEdit] = useState(false)

  const current = TABS.find((t) => t.id === tab)!

  // タブを切り替えたら先頭へ戻す
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  // テーマは html 要素の data-theme で切り替える。ブラウザUIの色も合わせる
  const theme = store.data.settings.theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#ffffff' : '#04101c')
  }, [theme])

  const peekDream = peek ? (store.data.dreams.find((d) => d.id === peek) ?? null) : null

  const jumpToField = (f: FieldId) => {
    setField(f)
    setTab('dreams')
  }

  return (
    <div className="shell">
      <header className="header">
        <div className="header-title">
          <Geo size={10} gap={2} />
          <h1>
            <span className="eyebrow">{current.eyebrow}</span>
            {current.title}
          </h1>
        </div>
        <nav className="tabbar">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} aria-current={tab === id} onClick={() => setTab(id)}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => store.setSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
            aria-label={theme === 'dark' ? '白い背景に切り替える' : '黒い背景に切り替える'}
            title={theme === 'dark' ? '白い背景に切り替える' : '黒い背景に切り替える'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>
          <button className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="設定を開く">
            <IconGear />
          </button>
        </div>
      </header>

      <main className={`main view-${tab}`}>
        {store.error && <div className="notice">{store.error}</div>}

        {tab === 'clock' && (
          <ClockView settings={store.data.settings} onOpenSettings={() => setSettingsOpen(true)} />
        )}

        {tab === 'dreams' && (
          <DreamsView
            dreams={store.data.dreams}
            field={field}
            onFieldChange={setField}
            onSave={store.upsertDream}
            onDelete={store.removeDream}
            composing={composingDream}
            onComposingChange={setComposingDream}
          />
        )}

        {tab === 'pyramid' && (
          <PyramidView
            dreams={store.data.dreams}
            settings={store.data.settings}
            onJumpToField={jumpToField}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {tab === 'timeline' && (
          <TimelineView dreams={store.data.dreams} settings={store.data.settings} onOpen={setPeek} />
        )}

        {tab === 'habits' && (
          <HabitsView
            habits={store.data.habits}
            dreams={store.data.dreams}
            onSave={store.upsertHabit}
            onDelete={store.removeHabit}
            composing={composingHabit}
            onComposingChange={setComposingHabit}
          />
        )}
      </main>

      {settingsOpen && (
        <SettingsView
          data={store.data}
          onChange={store.setSettings}
          onReplaceAll={store.replaceAll}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {peekDream && !peekEdit && (
        <DreamDetail
          dream={peekDream}
          onChange={store.upsertDream}
          onEdit={() => setPeekEdit(true)}
          onClose={() => setPeek(null)}
        />
      )}

      {peekDream && peekEdit && (
        <DreamEditor
          dream={peekDream}
          isNew={false}
          onSave={(d) => {
            store.upsertDream(d)
            setPeekEdit(false)
          }}
          onDelete={(id) => {
            store.removeDream(id)
            setPeekEdit(false)
            setPeek(null)
          }}
          onClose={() => setPeekEdit(false)}
        />
      )}
    </div>
  )
}
