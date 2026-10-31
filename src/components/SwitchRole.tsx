import { User } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { RoleSwitch } from "@/shared/interfaces/seva";
import type { RoleLevel } from "@/shared/interfaces/user";

import SidebarSection, {
  ActiveCheck,
  sidebarOptionClass,
} from "./SidebarSection";

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
    <SidebarSection
      Icon={User}
      title="Switch Account"
      open={open}
      onToggle={() => roles.length && setOpen((pre) => !pre)}
    >
      {roles.map(({ group, roles }) => (
        <button
          type="button"
          key={group}
          onClick={() => onClick({ group, roles })}
          className={sidebarOptionClass(group === activeGroup)}
        >
          <span>{group}</span>
          {group === activeGroup && <ActiveCheck />}
        </button>
      ))}
    </SidebarSection>
  );
};

export default SwitchRoleComponent;
