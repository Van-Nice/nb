import React, { useState, useEffect, useContext} from 'react';
import { FaCog } from 'react-icons/fa';
import styles from '../styles/Settings.module.css';
import parentStyles from '../styles/Home.module.css';
import { UserContext } from '../UserContext';

export default function Settings() {
  // TODO: Get user setting from user id
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {userID} = useContext(UserContext);
  const [settings, setSettings] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={parentStyles.settings}>
      <div className={styles.iconWrapper} onClick={openModal}>
        <FaCog className={styles.icon} />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            {userID ? (
              <div>
                <p><strong>Theme:</strong> {settings.theme}</p>
                <p><strong>Font Family:</strong> {settings.font_family}</p>
                <p><strong>Font Size:</strong> {settings.font_size}</p>
                <p><strong>Line Height:</strong> {settings.line_height}</p>
                <p><strong>Auto Save:</strong> {settings.auto_save ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Auto Save Interval:</strong> {settings.auto_save_interval}</p>
                <p><strong>Highlight Current Line:</strong> {settings.highlight_current_line ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Show Line Numbers:</strong> {settings.show_line_numbers ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Default Language:</strong> {settings.default_language}</p>
                <p><strong>Syntax Highlighting:</strong> {settings.syntax_highlighting ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Editor Layout:</strong> {settings.editor_layout}</p>
                <p><strong>Cursor Blink Rate:</strong> {settings.cursor_blink_rate}</p>
                <p><strong>Bracket Matching:</strong> {settings.bracket_matching ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Snippets Enabled:</strong> {settings.snippets_enabled ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Spell Check:</strong> {settings.spell_check ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Indent Guides:</strong> {settings.indent_guides ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Word Wrap Column:</strong> {settings.word_wrap_column}</p>
              </div>
            ) : (
              <p>Loading settings...</p>
            )}
            <button className={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
