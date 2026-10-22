import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { RoleSwitch } from "@/shared/interfaces/seva";
import type { RoleLevel } from "@/shared/interfaces/user";

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
      <motion.div
        onClick={() => roles.length && setOpen((pre) => !pre)}
        className={`bg-gray-100 p-2 py-3 border border-gray-300  ${
          open ? "rounded-t-md" : "rounded-md"
        } flex w-full items-center space-between`}
      >
        <FaUser className="mr-4" />
        <span className="font-bold text-gray-700 cursor-pointer">
          Switch Account
        </span>
      </motion.div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="p-2 space-y-1 bg-gray-900 rounded-b-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", maxHeight: "full", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {roles.map(({ group, roles }) => (
              <button
                type="button"
                key={group}
                onClick={() => onClick({ group, roles })}
                className={`${
                  group === activeGroup
                    ? "bg-white text-gray-800"
                    : "text-white"
                } rounded-md p-2 flex w-full items-center space-between cursor-pointer`}
              >
                <span className="font-bold">{group}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SwitchRoleComponent;
