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
import Tooltip from '@material-ui/core/Tooltip'
import UIfx from 'uifx';

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
  // Sound Efect
  // ===========================================================================

  const favouriteSound = require("../../../sounds/Favourite.wav");
  const favouriteClick = new UIfx(favouriteSound, {volume: 0.4});

  const deleteSound = require("../../../sounds/Delete.mp3");
  const deleteClick = new UIfx(deleteSound, {volume: 0.4});

  const downloadSound = require("../../../sounds/Download.mp3");
  const downloadClick = new UIfx(downloadSound, {volume: 0.4});

  const copySound = require("../../../sounds/Copy.mp3");
  const copyClick = new UIfx(copySound, {volume: 0.4});

  const refreshSound = require("../../../sounds/Refresh.mp3");
  const refreshClick = new UIfx(refreshSound, {volume: 0.4});

  const editSound = require("../../../sounds/Edit.mp3");
  const editClick = new UIfx(editSound, {volume: 0.4});

  const previewSound = require("../../../sounds/Preview.mp3");
  const previewClick = new UIfx(previewSound, {volume: 0.4});

  const alertSound = require("../../../sounds/Alert.mp3");
  const alertClick = new UIfx(alertSound, {volume: 0.4});


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
  const togglePreviewHandler = () => {
    if(isToggled) {
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
      </nav>
    </section>
  )
}
