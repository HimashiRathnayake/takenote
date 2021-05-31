import React from 'react'
import { Trash2 } from 'react-feather'
import { confirmAlert } from 'react-confirm-alert' // Import
import UIfx from 'uifx';
import { LabelText } from '@resources/LabelText'
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

  // ===========================================================================
  // Sound Efect
  // ===========================================================================

  const deleteSound = require("../../../sounds/Delete.mp3");
  const deleteClick = new UIfx(deleteSound, {volume: 0.4});

  const deleteCancelSound = require("../../../sounds/DeleteCancel.mp3");
  const deleteCancelClick = new UIfx(deleteCancelSound, {volume: 0.4});

export const showConfirmationAlert = (
  content: string,
  onConfirm: () => void,
  darkTheme: boolean
) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (function Actions() {
        return (
          <ConfirmDialog
            onCancel={() => onClose()}
            onConfirm={() => {
              onConfirm()
              onClose()
            }}
            content={content}
            darkTheme={darkTheme}
          />
        )
      })()
    },
    overlayClassName: 'dimmer',
    closeOnClickOutside: false,
  })
}

interface ConfirmDialogProps {
  onConfirm: () => void
  onCancel: () => void
  heading?: string
  content?: string
  darkTheme?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  onConfirm,
  onCancel,
  heading,
  content,
  darkTheme,
}) => {
  const theme = darkTheme ? ' dark-mode-alert' : ''

  return (
    <div>
      <div className="react-confirm-alert">
        <div className={'react-confirm-alert-body' + theme}>
          <div className="react-confirm-alert-body-heading">
            <Trash2 />
            <h3>{heading}</h3>
          </div>
          <div className="react-confirm-alert-body-content">{content}</div>
          <div className="react-confirm-alert-button-group">
            <button
              className="confirm-button"
              onClick={() => {
                deleteClick.play()
                onConfirm()
              }}
            >
              Yes
            </button>
            <button
              className="cancel-button"
              onClick={() => {
                deleteCancelClick.play()
                onCancel()
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Default props for the script editor component.
 */
ConfirmDialog.defaultProps = {
  content: LabelText.CATEGORY_DELETE_ALERT_CONTENT,
  heading: LabelText.CONFIRM_ALERT_HEADER,
  darkTheme: false,
}
