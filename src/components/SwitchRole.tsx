import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaCheck, FaChevronDown, FaUser } from "react-icons/fa";
import { updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { RoleSwitch } from "@/shared/interfaces/seva";
import type { RoleLevel } from "@/shared/interfaces/user";
import {
  iconChip,
  menuRowClosed,
  menuRowOpen,
  rowLabel,
  subItem,
  subItemActive,
  subPanel,
} from "./sidebarTheme";

const SwitchRoleComponent = ({
  setShow,
}: {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    all_permission: { group: activeGroup },
    user,
  } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [roles, setRoles] = useState<RoleSwitch[]>([{ group: "", roles: [0] }]);
  const dispatch = useAppDispatch();
  const getRolesFromUser = useCallback(() => {
    const rolesList: RoleLevel[] = [];
    if (user) {
      for (let i = 0; i < user.role_level.length; i += 1) {
        const item = user.permission.some((p) =>
          user.role_level[i].roles.includes(p.role_id),
        );
        if (item) {
          rolesList.push({
            group: user.role_level[i].group,
            roles: user.role_level[i].roles,
          });
        }
      }
    }
    setRoles(rolesList);
  }, [user]);

  const onClick = (roleLevel: RoleLevel) => {
    setOpen(false);
    if (user) {
      dispatch(updateRole(roleLevel));
    }
    setTimeout(() => setShow(false), 500);
    router.reload();
  };

  const getSelectedRole = useCallback(() => {
    const activeRoleExists = localStorage.getItem("active_role");
    return activeRoleExists ? parseInt(activeRoleExists, 10) : 0;
  }, []);

  useEffect(() => {
    getRolesFromUser();
    getSelectedRole();
  }, [getRolesFromUser, getSelectedRole]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => roles.length && setOpen((pre) => !pre)}
        className={open ? menuRowOpen : menuRowClosed}
      >
        <span className={iconChip}>
          <FaUser className="size-4" />
        </span>
        <span className={rowLabel}>Switch Account</span>
        <FaChevronDown
          className={`size-3.5 text-[#9a3412] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={subPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {roles.map(({ group, roles }) => {
              const isActive = group === activeGroup;
              return (
                <button
                  type="button"
                  key={group}
                  onClick={() => onClick({ group, roles })}
                  className={isActive ? subItemActive : subItem}
                >
                  <span>{group}</span>
                  {isActive && <FaCheck className="size-3.5 text-green-700" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwitchRoleComponent;
