import React, { useState } from "react";
import styles from "../styles/MenuBar.module.css";

// MenuBar Component
const MenuBar = ({ onMenuAction }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);


  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setActiveSubMenu(null); // Close any open submenus
  };

  const handleMenuItemClick = (action, hasSubItems) => {
    if (hasSubItems) {
      setActiveSubMenu(activeSubMenu === action ? null : action);
    } else {
      onMenuAction(action);
      setActiveMenu(null);
      setActiveSubMenu(null);
    }
  };

  const handleMouseEnterMenu = (menuName) => {
    setActiveMenu(menuName); // Open the dropdown on hover
    setActiveSubMenu(null);
  };

  const handleMouseLeaveMenu = () => {
    setActiveMenu(null); // Close the dropdown when mouse leaves the menu area
    setActiveSubMenu(null);
  };

  // Define the menu structure
  const menus = [
    {
      name: "File",
      items: [
        { action: "New", label: "New" },
        { action: "Download",
          label: "Download",
          subItems: [
            {action: "DownloadTXT", label: "Plain Text (.txt)"},
            { action: "DownloadHTML", label: "Web Page (.html)" },
            { action: "DownloadMD", label: "Markdown (.md)" },
            { action: "DownloadPDF", label: "PDF Document .pdf" },
            { action: "DownloadDOCX", label: "Microsoft Word (.docx)" },
          ] 
        },
        { action: "Open", label: "Open" },
        { action: "Rename", label: "Rename" },
        { action: "Move", label: "Move" },
        { action: "Delete", label: "Delete" },
        { action: "Print", label: "Print" },
      ],
    },
    {
      name: "Edit",
      items: [
        { action: "Undo", label: "Undo" },
        { action: "Redo", label: "Redo" },
        { action: "Cut", label: "Cut" },
        { action: "Copy", label: "Copy" },
        { action: "Paste", label: "Paste" },
      ],
    },
  ];

  return (
    <div className={styles.menuWrapper}>
      {menus.map((menu) => (
        <div
          key={menu.name}
          className={styles.menuItem}
          onMouseEnter={() => handleMouseEnterMenu(menu.name)}
          onMouseLeave={handleMouseLeaveMenu}
        >
          <span onClick={() => handleMenuClick(menu.name)}>{menu.name}</span>
          {activeMenu === menu.name && (
            <div className={styles.dropdown}>
              {menu.items.map((item) => (
                <div
                  key={item.action}
                  className={styles.dropdownItem}
                  onClick={() =>
                    handleMenuItemClick(item.action, item.subItems)
                  }
                  onMouseEnter={() =>
                    item.subItems && setActiveSubMenu(item.action)
                  }
                  onMouseLeave={() =>
                    item.subItems && setActiveSubMenu(null)
                  }
                >
                  {item.label}
                  {item.subItems && (
                    <span className={styles.submenuArrow}>▶</span>
                  )}
                  {activeSubMenu === item.action && item.subItems && (
                    <div className={styles.subDropdown}>
                      {item.subItems.map((subItem) => (
                        <div
                          key={subItem.action}
                          className={styles.dropdownItem}
                          onClick={() => handleMenuItemClick(subItem.action)}
                        >
                          {subItem.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;
