import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Eye,
  Edit,
  Star,
  Trash2,
  Download,
  RefreshCw,
  Loader,
  Clipboard as ClipboardCmp,
} from 'react-feather'
import Tooltip from '@material-ui/core/Tooltip'

import { TestID } from '@resources/TestID'
import { LastSyncedNotification } from '@/components/LastSyncedNotification'
import { NoteItem, CategoryItem } from '@/types'
import {
  togglePreviewMarkdown,
  updateCodeMirrorOption,
} from '@/slices/settings'
import { toggleFavoriteNotes, toggleTrashNotes } from '@/slices/note'
import { getCategories, getNotes, getSync, getSettings } from '@/selectors'
import { downloadNotes, isDraftNote, getShortUuid, copyToClipboard } from '@/utils/helpers'
import { sync } from '@/slices/sync'
import { showConfirmationAlert } from '@/containers/ConfirmDialog'
import { LabelText } from '@resources/LabelText'

export const NoteMenuBar = () => {
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
  const _updateCodeMirrorOption = (key: string, value: any) =>
    dispatch(updateCodeMirrorOption({ key, value }))

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const downloadNotesHandler = () => downloadNotes([activeNote], categories)
  const favoriteNoteHandler = () => _toggleFavoriteNotes(activeNoteId)
  const trashNoteHandler = () => {
    if (activeNote.trash) {
      showConfirmationAlert(
        LabelText.NOTE_DELETE_ALERT_CONTENT,
        () => {
          _toggleTrashNotes(activeNoteId)
        },
        darkTheme
      )
    } else {
      showConfirmationAlert(
        LabelText.NOTE_TO_TRASH_ALERT_CONTENT,
        () => _toggleTrashNotes(activeNoteId),
        darkTheme
      )
    }
  }
  const syncNotesHandler = () => _sync(notes, categories)
  const togglePreviewHandler = () => {
    togglePreviewIcon(!isToggled)
    _togglePreviewMarkdown()
  }

  return (
    <section className="note-menu-bar">
      {activeNote && !isDraftNote(activeNote) ? (
        <nav>
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
                    <Star size={18} fill="black" />
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
      </nav>
    </section>
  )
}


