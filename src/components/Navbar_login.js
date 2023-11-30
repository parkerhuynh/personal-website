import { menuItems_login } from "../menuItems";
import MenuItems from "./MenuItems";
const Navbar_login = () => {
  return (
    <nav >
      <ul className="menus p-0 m-0">
        {menuItems_login.map((menu, index) => {
          const depthLevel = 0;
          return <MenuItems items={menu} key={index} depthLevel={depthLevel} />;
        })}
      </ul>
    </nav>
  );
};

export default Navbar_login;
