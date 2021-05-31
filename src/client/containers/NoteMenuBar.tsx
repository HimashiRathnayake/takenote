import React, { useEffect, useState, Dispatch, SetStateAction } from 'react'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import { useDispatch, useSelector } from 'react-redux'
import {
  Eye,
  Edit,
  Star,
  Trash2,
  Download,
  RefreshCw,
  Loader,
  Sun,
  Moon,
  Mic,
  MicOff,
  Clipboard as ClipboardCmp,
} from 'react-feather'
import Tooltip from '@material-ui/core/Tooltip'
import UIfx from 'uifx'

import { TestID } from '@resources/TestID'
import { LastSyncedNotification } from '@/components/LastSyncedNotification'
import { NoteItem, CategoryItem } from '@/types'
import { togglePreviewMarkdown, toggleDarkTheme, updateCodeMirrorOption } from '@/slices/settings'
import { toggleFavoriteNotes, toggleTrashNotes } from '@/slices/note'
import { getCategories, getNotes, getSync, getSettings } from '@/selectors'
import { downloadNotes, isDraftNote, getShortUuid, copyToClipboard } from '@/utils/helpers'
import { sync } from '@/slices/sync'
import { showConfirmationAlert } from '@/containers/ConfirmDialog'
import { LabelText } from '@resources/LabelText'

// declare interface IWindow extends Window {
//   webkitSpeechRecognition: any;
// }
// const {webkitSpeechRecognition} : IWindow = <IWindow>window;
// declare global {
//   interface Window { webkitSpeechRecognition: any; }
// }
declare global {
  interface Window {
    webkitAudioContext: typeof window.AudioContext
    webkitSpeechRecognition: typeof window.SpeechRecognition
  }
}
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
const mic = new SpeechRecognition()

interface IProps {
  setIsListening?: Dispatch<SetStateAction<boolean>>
  setText?: Dispatch<SetStateAction<boolean>>
}

type ChildProps = {
  clickAction?: (val: string) => void
  listen?: (val: boolean) => void
}

export const NoteMenuBar: React.FC<ChildProps> = (
  { clickAction = () => {} },
  { listen = () => {} }
) => {
  // ok now
  1 // ===========================================================================
  // SpeechReconginition
  // ===========================================================================

  // const recognition = new webkitSpeechRecognition();
  // console.log(window.webkitSpeechRecognition)
  if (!('webkitSpeechRecognition' in window)) {
    console.log('#################################', 'webkitSpeechRecognition' in window)
  }

  mic.continuous = true
  mic.interimResults = true
  mic.lang = 'en-US'

  const [isListening, setIsListening] = useState(false)
  console.log('1', isListening)
  const [text, setText] = useState<any | null>(null)
  const [savedNotes, setSavedNotes] = useState<any | null>([])

  const handleSaveNote = () => {
    setSavedNotes([...savedNotes, text])
    setText('')
  }

  useEffect(() => {
    handleListen()
    listen(isListening)
    console.log('2', isListening)
    console.log('this is before clicking')
  }, [isListening])

  const handleListen = () => {
    if (isListening) {
      mic.start()
      console.log('start Mic on Click')
      console.log('3', isListening)
    } else {
      mic.stop()
      mic.continuous = false
      console.log('Stopped Mic on Click')
      console.log('4', isListening)
    }

    mic.onstart = () => {
      console.log('4', isListening)
      console.log('Mics on start function')
    }

    mic.onend = () => {
      clickAction(text)
      setText('')
    }

    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('')
      console.log('5', isListening)
      console.log(transcript)
      setText(transcript)
      console.log('This is before tran script-----------------', transcript)

      console.log('This is after tran script-----------------', transcript)
      mic.onerror = (event) => {
        console.log(event.error)
      }
    }
  }

  // ===========================================================================
  // Selectors
  // ===========================================================================

  const { notes, activeNoteId } = useSelector(getNotes)
  const { categories } = useSelector(getCategories)
  const { syncing, lastSynced, pendingSync } = useSelector(getSync)
  const { darkTheme } = useSelector(getSettings)

  // ===========================================================================
  // Other
  // ===========================================================================

  const copyNoteIcon = <ClipboardCmp size={18} aria-hidden="true" focusable="false" />
  const successfulCopyMessage = 'Note copied!'
  const activeNote = notes.find((note) => note.id === activeNoteId)!
  const shortNoteUuid = getShortUuid(activeNoteId)

  // ===========================================================================
  // Sound Efect
  // ===========================================================================

  const favouriteSound = require('../../../sounds/Favourite.wav')
  const favouriteClick = new UIfx(favouriteSound, { volume: 0.4 })

  const deleteSound = require('../../../sounds/Delete.wav')
  const deleteClick = new UIfx(deleteSound, { volume: 0.4 })

  const downloadSound = require('../../../sounds/Download.mp3')
  const downloadClick = new UIfx(downloadSound, { volume: 0.4 })

  const copySound = require('../../../sounds/Copy.mp3')
  const copyClick = new UIfx(copySound, { volume: 0.4 })

  const refreshSound = require('../../../sounds/Refresh.mp3')
  const refreshClick = new UIfx(refreshSound, { volume: 0.4 })

  const editSound = require('../../../sounds/Edit.mp3')
  const editClick = new UIfx(editSound, { volume: 0.4 })

  const previewSound = require('../../../sounds/Preview.mp3')
  const previewClick = new UIfx(previewSound, { volume: 0.4 })

  const alertSound = require('../../../sounds/Alert.mp3')
  const alertClick = new UIfx(alertSound, { volume: 0.4 })

  const buttonClick = require('../../../sounds/Click.mp3')
  const click = new UIfx(buttonClick, { volume: 0.4 })

  const themeChangeSound = require('../../../sounds/ThemeChange.mp3')
  const themeChangeclick = new UIfx(themeChangeSound, { volume: 0.4 })

  // ===========================================================================
  // State
  // ===========================================================================

  const [uuidCopiedText, setUuidCopiedText] = useState<string>('')
  const [isToggled, togglePreviewIcon] = useState<boolean>(false)

  // ===========================================================================
  // Hooks
  // ===========================================================================

  useEffect(() => {
    if (uuidCopiedText === successfulCopyMessage) {
      const timer = setTimeout(() => {
        setUuidCopiedText('')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [uuidCopiedText])

  // ===========================================================================
  // Dispatch
  // ===========================================================================

  const dispatch = useDispatch()

  const _togglePreviewMarkdown = () => dispatch(togglePreviewMarkdown())
  const _toggleTrashNotes = (noteId: string) => dispatch(toggleTrashNotes(noteId))
  const _toggleFavoriteNotes = (noteId: string) => dispatch(toggleFavoriteNotes(noteId))
  const _sync = (notes: NoteItem[], categories: CategoryItem[]) =>
    dispatch(sync({ notes, categories }))
  const _toggleDarkTheme = () => dispatch(toggleDarkTheme())
  const _updateCodeMirrorOption = (key: string, value: any) =>
    dispatch(updateCodeMirrorOption({ key, value }))

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const downloadNotesHandler = () => {
    downloadClick.play()
    downloadNotes([activeNote], categories)
  }
  const favoriteNoteHandler = () => {
    favouriteClick.play()
    _toggleFavoriteNotes(activeNoteId)
  }
  const trashNoteHandler = () => {
    if (activeNote.trash) {
      alertClick.play()
      showConfirmationAlert(
        LabelText.NOTE_DELETE_ALERT_CONTENT,
        () => {
          deleteClick.play()
          _toggleTrashNotes(activeNoteId)
        },
        darkTheme
      )
    } else {
      alertClick.play()
      showConfirmationAlert(
        LabelText.NOTE_TO_TRASH_ALERT_CONTENT,
        () => {
          deleteClick.play()
          _toggleTrashNotes(activeNoteId)
        },
        darkTheme
      )
    }
  }
  const syncNotesHandler = () => {
    refreshClick.play()
    _sync(notes, categories)
  }
  const toggleDarkThemeHandler = () => {
    themeChangeclick.play()
    _toggleDarkTheme()
    _updateCodeMirrorOption('theme', darkTheme ? 'base16-light' : 'new-moon')
  }
  const togglePreviewHandler = () => {
    if (isToggled) {
      editClick.play()
    } else {
      previewClick.play()
    }
    togglePreviewIcon(!isToggled)
    _togglePreviewMarkdown()
  }

  return (
    <section className="note-menu-bar">
      {activeNote && !isDraftNote(activeNote) ? (
        <nav>
          <Popup
            trigger={
              <Tooltip title="Voice to Text" arrow>
                <button className="note-menu-bar-button">
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </Tooltip>
            }
            position="top center"
            onOpen={() => {
              setIsListening((prevState) => !prevState)
            }}
            onClose={() => {
              setIsListening((prevState) => !prevState)
            }}
            modal
            className={darkTheme ? 'dark-theme-popup' : 'light-theme-popoup'}
          >
            {(close: any) => (
              <div className="popup-text-container">
                <Mic />
                <h2>Speak Now ...</h2>
                <text className="popup-text">{text}</text>
                <button className="popup-button" onClick={() => close()}>
                  Done
                </button>
              </div>
            )}
          </Popup>
          <button
            className="note-menu-bar-button"
            onClick={togglePreviewHandler}
            data-testid={TestID.PREVIEW_MODE}
          >
            {isToggled ? (
              <Tooltip title="Edit" arrow>
                <Edit size={18} />
              </Tooltip>
            ) : (
              <Tooltip title="Preview" arrow>
                <Eye size={18} />
              </Tooltip>
            )}
          </button>
          {!activeNote.scratchpad && (
            <>
              <button className="note-menu-bar-button" onClick={favoriteNoteHandler}>
                {activeNote.favorite ? (
                  <Tooltip title="Remove from Favourites" arrow>
                    <Star size={18} fill="#5183f5" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Add to Favourites" arrow>
                    <Star size={18} />
                  </Tooltip>
                )}
              </button>
              <button className="note-menu-bar-button trash" onClick={trashNoteHandler}>
                <Tooltip title="Delete" arrow>
                  <Trash2 size={18} />
                </Tooltip>
              </button>
            </>
          )}
          <button className="note-menu-bar-button">
            <Tooltip title="Download" arrow>
              <Download size={18} onClick={downloadNotesHandler} />
            </Tooltip>
          </button>
          <Tooltip title="Copy" arrow>
            <button
              className="note-menu-bar-button uuid"
              onClick={() => {
                copyClick.play()
                copyToClipboard(`{{${shortNoteUuid}}}`)
                setUuidCopiedText(successfulCopyMessage)
              }}
              data-testid={TestID.UUID_MENU_BAR_COPY_ICON}
            >
              {copyNoteIcon}
              {uuidCopiedText && <span className="uuid-copied-text">{uuidCopiedText}</span>}
            </button>
          </Tooltip>
        </nav>
      ) : (
        <div />
      )}
      <nav>
        <LastSyncedNotification datetime={lastSynced} pending={pendingSync} syncing={syncing} />
        <Tooltip title="Refresh" arrow>
          <button
            className="note-menu-bar-button"
            onClick={syncNotesHandler}
            data-testid={TestID.TOPBAR_ACTION_SYNC_NOTES}
          >
            {syncing ? <Loader size={18} className="rotating-svg" /> : <RefreshCw size={18} />}
          </button>
        </Tooltip>
        <button className="note-menu-bar-button" onClick={toggleDarkThemeHandler}>
          {darkTheme ? (
            <Tooltip title="Light Mode" arrow>
              <Sun size={18} />
            </Tooltip>
          ) : (
            <Tooltip title="Dark Mode" arrow>
              <Moon size={18} />
            </Tooltip>
          )}
        </button>
      </nav>
    </section>
  )
}
