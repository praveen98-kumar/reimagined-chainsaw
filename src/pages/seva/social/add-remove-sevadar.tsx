import { regionHirarchy } from "@/constants/app";
import { Form, Formik, type FormikProps } from "formik";
import { useDistricts, useStates, useTehsils } from "@/hooks/useLocationAPI";
import { useUsersWithRole } from "@/hooks/useUsersWithRole";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getQueryClient } from "@/utils/get-query-client";

import Button from "@/components/Button";
import UserCard from "@/components/card/UserCard";
import Radio from "@/components/input/Radio";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmModal from "@/components/modal/ConfirmModal";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { cn, getOptionArray } from "@/shared/functions/utils";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { Option } from "@/shared/interfaces/option";

interface FormPayload {
  state_id: number;
  district_id: number;
  tehsil_id: number;
  team_leader_id: number;
  mobile_no: string;
  search_by: string;
}

const SOCIAL_MEDIA_TEAM_LEADER_ROLE_ID = 60;
const SOCIAL_MEDIA_SEVADAR_ROLE_ID = 53;

const AddRemoveSevadarPage: NextApplicationPage = () => {
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );
  const [modalData, setModalData] = useState<{
    sevadarId: number;
    mode: "add" | "remove";
  } | null>(null);
  const [isEnable, setIsEnable] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [stateId, setStateId] = useState<number>(0);
  const [districtId, setDistrictId] = useState<number>(0);
  const [tehsilId, setTehsilId] = useState<number>(0);
  const [teamLeaderId, setTeamLeaderId] = useState<number>(0);
  const [mobileNo, setMobileNo] = useState<string>("");
  const formRef = useRef<FormikProps<FormPayload>>(null);
  const queryClient = getQueryClient();
  const roleRegion = (active_permission?.role_region ??
    "ashram") as (typeof regionHirarchy)[number];

  const roleRegionIndex = useMemo(() => {
    return regionHirarchy.indexOf(roleRegion);
  }, [roleRegion]);

  const activeRegion = active_permission?.region[active_region_index];

  const { data: states } = useStates(2, {
    enabled: roleRegionIndex < 2,
  });
  const { data: districts } = useDistricts(stateId, {
    enabled: stateId !== 0 && roleRegionIndex < 4,
  });
  const { data: tehsils } = useTehsils(districtId, {
    enabled: districtId !== 0,
  });

  const { data: teamLeaders } = useUsersWithRole(
    SOCIAL_MEDIA_TEAM_LEADER_ROLE_ID,
    { districtId: activeRegion?.district_id },
    {
      enabled: !!activeRegion?.district_id,
    },
  );

  const teamLeaderOptions = useMemo(() => {
    return teamLeaders ? getOptionArray(teamLeaders, "name", "id") : [];
  }, [teamLeaders]);

  const {
    data: sevadarList,
    isFetching,
    refetch,
  } = useUsersWithRole(
    SOCIAL_MEDIA_SEVADAR_ROLE_ID,
    {
      tehsilId,
      mobileNo,
      teamLeaderId,
    },
    {
      enabled: isEnable,
    },
  );

  const filteredSevadarList = useMemo(() => {
    return sevadarList?.filter(
      (sevadar) =>
        sevadar.team_leader_id === teamLeaderId || !sevadar.team_leader_id,
    );
  }, [sevadarList, teamLeaderId]);

  async function addOrRemoveUser(
    mode: "add" | "remove" = "add",
    sevadarId: number,
  ) {
    try {
      const response = await apiClient.post("sm_seva_team_map", {
        mode,
        leader_id: teamLeaderId,
        sevadar_ids: [sevadarId],
      });
      toast.success(response?.data?.message);
      setModalData(null);
      setIsEnable(true);
      setTimeout(async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "users_with_role",
            SOCIAL_MEDIA_SEVADAR_ROLE_ID,
            undefined,
            tehsilId,
            mobileNo,
          ],
        });
        setIsEnable(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error?.error);
    }
  }

  useEffect(() => {
    if (roleRegionIndex >= 2 && activeRegion?.state_id) {
      setStateId(activeRegion.state_id);
    }
    if (roleRegionIndex >= 4 && activeRegion?.district_id) {
      setDistrictId(activeRegion.district_id);
    }
  }, [roleRegionIndex, activeRegion]);

  return (
    <Layout
      headerProps={{ isBack: true, heading: "Add Sevadar To TeamLeader" }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={{
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            team_leader_id: 0,
            mobile_no: "",
            search_by: "tehsil_id",
          }}
          onSubmit={async (values) => {
            if (values.search_by === "team_leader_id" && teamLeaderId === 0) {
              toast.error("Select Team Leader");
              return;
            }
            if (values.search_by === "mobile_no" && mobileNo.length !== 10) {
              toast.error("Invalid Mobile Number");
              return;
            }
            if (values.search_by === "tehsil_id" && tehsilId === 0) {
              toast.error("Select Tehsil");
              return;
            }
            await refetch();
          }}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              {roleRegionIndex < 2 && (
                <Select
                  required
                  options={states}
                  name="state_id"
                  label="State"
                  placeholder="Select State/राज्य चुनें"
                  value={
                    states?.find((r) => r.value === values.state_id) ?? null
                  }
                  onChange={(e: any) => {
                    setFieldValue("state_id", e?.value ?? 0);
                    setStateId((e?.value as number) ?? 0);
                  }}
                />
              )}
              {roleRegionIndex < 4 && (
                <Select
                  options={districts}
                  name="district_id"
                  label="District"
                  placeholder="Select District/ज़िला चुनें"
                  value={
                    districts?.find((r) => r.value === values.district_id) ??
                    null
                  }
                  onChange={(e: any) => {
                    setFieldValue("district_id", e?.value ?? 0);
                    setDistrictId((e?.value as number) ?? 0);
                  }}
                />
              )}
              <Select
                required
                options={teamLeaderOptions}
                name="team_leader_id"
                label="Team Leader"
                placeholder="Select Team Leader"
                value={
                  teamLeaderOptions?.find(
                    (r) => r.value === values.team_leader_id,
                  ) ?? null
                }
                onChange={(e: any) => {
                  setFieldValue("team_leader_id", e?.value ?? 0);
                  setTeamLeaderId((e?.value as number) ?? 0);
                }}
              />
              <Radio
                required
                name="search_by"
                label="Search By"
                options={[
                  { label: "Tehsil", value: "tehsil_id" },
                  { label: "Mobile Number", value: "mobile_no" },
                  { label: "Sevadar List", value: "team_leader_id" },
                ]}
                onChange={(e) => {
                  handleChange(e);
                  setFieldValue("search_by", e.target.value);
                  setFieldValue("mobile_no", "");
                  setMobileNo("");
                  setTehsilId(0);
                }}
              />
              {values.search_by === "tehsil_id" ? (
                <Select
                  required={values.search_by === "tehsil_id"}
                  options={tehsils}
                  name="tehsil_id"
                  label="Tehsil"
                  placeholder="Select Tehsil"
                  value={
                    tehsils?.find((r) => r.value === values.tehsil_id) ?? null
                  }
                  isClearable
                  onChange={(e: any) => {
                    setFieldValue("tehsil_id", e?.value ?? 0);
                    setTehsilId((e?.value as number) ?? 0);
                  }}
                />
              ) : values.search_by === "mobile_no" ? (
                <TextInput
                  required={values.search_by === "mobile_no"}
                  name="mobile_no"
                  label="Mobile No."
                  onChange={(e) => {
                    handleChange(e);
                    setMobileNo(e.target.value);
                  }}
                  placeholder="Enter mobile number"
                  type={"tel"}
                  maxLength={10}
                />
              ) : null}
              <Button
                disabled={
                  isFetching ||
                  teamLeaderId === 0 ||
                  (tehsilId === 0 &&
                    mobileNo.length !== 10 &&
                    values.search_by !== "team_leader_id")
                }
                loading={isFetching}
                type="submit"
                className="mx-auto"
              >
                Search
              </Button>
            </Form>
          )}
        </Formik>
        <div className="flex flex-col gap-2">
          {filteredSevadarList?.map((u) => (
            <UserCard user={{ ...u }} key={u.id}>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModalData({
                      sevadarId: u.id,
                      mode: u.team_leader_id ? "remove" : "add",
                    });
                    setShowDialog(true);
                  }}
                  type="button"
                  className={cn(
                    "px-3 py-1 text-white rounded text-sm font-bold cursor-pointer",
                    u.team_leader_id ? "Remove bg-red-500" : "bg-emerald-500",
                  )}
                >
                  {u.team_leader_id ? "Remove" : "Add"}
                </button>
              </div>
            </UserCard>
          ))}
          {isFetching && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
        </div>
        {modalData && (
          <ConfirmModal
            show={showDialog}
            onClose={() => {
              setShowDialog(false);
              setModalData(null);
            }}
            onConfirm={() =>
              addOrRemoveUser(modalData.mode, modalData.sevadarId)
            }
            title={
              modalData?.mode === "add"
                ? "Do you want to add sevadar to team leader?"
                : "Do you want to remove sevadar?"
            }
          />
        )}
      </div>
    </Layout>
  );
};

AddRemoveSevadarPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default AddRemoveSevadarPage;
