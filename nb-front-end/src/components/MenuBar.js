import React, { useState } from "react";
import styles from "../styles/MenuBar.module.css";

// MenuBar Component
const MenuBar = ({ onMenuAction }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (action) => {
    onMenuAction(action);
    setActiveMenu(null);
  };

  const handleMouseEnter = (menuName) => {
    setActiveMenu(menuName); // Open the dropdown on hover
  };

  const handleMouseLeave = () => {
    setActiveMenu(null); // Close the dropdown when mouse leaves the menu area
  };

  // Define the menu structure
  const menus = [
    {
      name: "File",
      items: [
        { action: "New", label: "New" },
        { action: "Save", label: "Save" },
        { action: "Download", label: "Download" },
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
          onMouseEnter={() => handleMouseEnter(menu.name)}
          onMouseLeave={handleMouseLeave}
        >
          <span onClick={() => handleMenuClick(menu.name)}>{menu.name}</span>
          {activeMenu === menu.name && (
            <div className={styles.dropdown}>
              {menu.items.map((item) => (
                <div
                  key={item.action}
                  onClick={() => handleMenuItemClick(item.action)}
                  className={styles.dropdownItem}
                >
                  {item.label}
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
