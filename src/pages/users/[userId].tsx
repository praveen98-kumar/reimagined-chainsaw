import Button from "@/components/Button";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { isValidUser, objectWithValues } from "@/shared/functions/utils";
import { regionHirarchy } from "@/constants/app";
import { Form, Formik, FormikValues } from "formik";
import useLocalstorage from "@/hooks/useLocalstorage";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Modal from "@/components/modal/Modal";
import { FaQuestionCircle } from "react-icons/fa";
import DiscipleCard from "@/components/card/DiscipleCard";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import { GetStaticPaths, GetStaticPathsContext, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { RoleCard } from "@/components/card/UserCard";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/store";
import { NextApplicationPage } from "@/shared/interfaces/app";

interface AllotedTehsil {
  id: number;
  tehsil_id: string;
  district_id: string;
  tehsil_name: string;
  district_name: string;
  local: boolean;

  [k: string]: string | number | boolean;
}

const schema = Yup.object({
  region_level: Yup.number(),
  country_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level == 1
      ? passSchema
          .required("Country is required.")
          .test("country_id", "Country is required", (v: any) => Number(v) > 0)
      : passSchema,
  ),
  state_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level == 2
      ? passSchema
          .required("State is required.")
          .test("state_id", "State is required", (v: any) => Number(v) > 0)
      : passSchema,
  ),
  division_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level == 3
      ? passSchema
          .required("Division is required.")
          .test(
            "division_id",
            "Division is required",
            (v: any) => Number(v) > 0,
          )
      : passSchema,
  ),
  district_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level == 4
      ? passSchema
          .required("District is required.")
          .test(
            "district_id",
            "District is required",
            (v: any) => Number(v) > 0,
          )
      : passSchema,
  ),
  tehsil_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level == 5
      ? passSchema
          .required("Tehsil is required.")
          .test("tehsil_id", "Tehsil is required", (v: any) => Number(v) > 0)
      : passSchema,
  ),
});

const Sevadar: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const [show, setShow] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState(false);
  const formRef = useRef<any>(null);
  const router = useRouter();
  const [allotedTehsils, setAllotedTehsils] = useState<AllotedTehsil[]>([]);
  const [newAllotTehsils, setNewAllotTehsils] = useState<AllotedTehsil[]>([]);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const active_region = active_permission?.region[active_region_index];
  const userSevaRegionIndex = regionHirarchy.findIndex(
    (r) => r == (active_permission?.role_region ?? "ashram"),
  );
  const [userRoleId, setUserRoleId] = useState(0);
  const [disciple] = useLocalstorage<any>("selectedDisciple");
  // const [non_android, setnon_android] = useState<boolean>(
  //   disciple?.non_android
  // );
  const [seva_type] = useLocalstorage("sevaType");
  const [role_type] = useLocalstorage<string>("roleType");
  const [role_id, setRole_id] = useState(0);
  const [sevadar, setSevadar] = useState<any>(null);
  const [selectedTehsil, setSelectedTehsil] = useState<AllotedTehsil>();
  const [sevaRegionIndex, setRegionIndex] = useState(0);
  const [hasAllotted, setHasAllotted] = useState(false);
  const [userExist, setUserExist] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const closeModal = () => {
    setShow(false);
  };

  const updateSevdarPermission = useMemo(() => {
    if (typeof seva_type === "string") {
      return seva_type
        .toString()
        .replace("book_", "")
        .concat("_seva_update_sevadar");
    } else {
      return undefined;
    }
  }, [role_type]);
  const removeSevdarPermission = useMemo(() => {
    if (typeof seva_type === "string") {
      if (seva_type === "jyada_ruchi") {
        return "jyada_ruchi_remove_sevadar";
      }
      if (seva_type === "satnam_calling") {
        return "satnam_calling_remove_sevadar";
      }
      if (seva_type === "namdan_calling") {
        return "namdan_calling_remove_sevadar";
      }
      if (seva_type === "social_media") {
        return "remove_social_media_sevadar";
      }
      return seva_type
        .toString()
        .replace("book_", "")
        .concat("_seva_remove_sevadar");
    } else {
      return undefined;
    }
  }, [role_type]);

  const removeTehsil = async () => {
    setRemoveLoading(true);
    try {
      if (!selectedTehsil?.local) {
        if (selectedTehsil?.role_id) {
          const response = await apiClient.delete(
            `set_remove_user_in_queue/${selectedTehsil?.id}`,
          );
          toast.success(response.data?.message);
        }
      }
      setAllotedTehsils([
        ...allotedTehsils.filter(
          (item) =>
            (role_type == "book_delivery_sevadar" &&
              item.tehsil_id !== selectedTehsil?.tehsil_id) ||
            (role_type != "book_delivery_sevadar" &&
              item.district_id !== selectedTehsil?.district_id),
        ),
      ]);
      if (
        sevaRegionIndex == userSevaRegionIndex &&
        [
          "book_calling_sevadar",
          "jyada_ruchi_sevadar",
          "namdan_calling_sevadar",
          "satnam_calling_sevadar",
          "old_calling_sevadar",
        ].includes(role_type)
      ) {
        setFirstNewAllotment();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    } finally {
      setRemoveLoading(false);
    }
    setShow(false);
  };

  useEffect(() => {
    if (router.query.userId) {
      (async () => {
        try {
          const { data: roleData } = await apiClient.get("roles");
          const role = roleData.data.find((d: any) => d.name == role_type);
          setRole_id(role.id);
          if (formRef.current) {
            const index = regionHirarchy.findIndex(
              (item) => item == role?.region,
            );
            setRegionIndex(index);
            formRef.current.setFieldValue("region_level", index);
          }
          const { data } = await apiClient.get(
            `user/0?disciple_id=${router.query?.userId}&role_id=${role.id}`,
          );
          setSevadar(data.data);
          if (data.data) {
            disciple.country_id = data.data.country_id;
            disciple.state_id = data.data.state_id;
            disciple.district_id = data.data.district_id;
            disciple.tehsil_id = data.data.tehsil_id;
          }
          let temp = data.data.allotted_tehsil;

          temp = temp.filter((t: AllotedTehsil) => t.role_id == role.id);
          for (let i = 0; i < temp.length; i++) {
            temp[i]["local"] = false;
          }
          setAllotedTehsils(temp);
          if (
            temp == 0 &&
            sevaRegionIndex == userSevaRegionIndex &&
            [
              "book_calling_sevadar",
              "jyada_ruchi_sevadar",
              "namdan_calling_sevadar",
              "satnam_calling_sevadar",
              "old_calling_sevadar",
            ].includes(role_type)
          ) {
            setFirstNewAllotment();
          }
          setUserExist(true);
        } catch (error) {
          setSevadar(disciple);
          if (
            sevaRegionIndex == userSevaRegionIndex &&
            [
              "book_calling_sevadar",
              "jyada_ruchi_sevadar",
              "namdan_calling_sevadar",
              "satnam_calling_sevadar",
              "old_calling_sevadar",
            ].includes(role_type)
          ) {
            setFirstNewAllotment();
          }
        }
      })();
    }
  }, [
    router.isReady,
    formRef,
    role_type,
    sevaRegionIndex,
    userSevaRegionIndex,
  ]);

  const addRole = (values: any) => {
    const tempRole = {
      ...values,
      role: role_type,
      key: values?.tehsil_id || values?.district_id,
    };
    setNewAllotTehsils([...newAllotTehsils, tempRole]);
  };
  const onUpdate = async () => {
    const roles = newAllotTehsils.map(({ key, title, ...rest }) => ({
      role_id,
      ...rest,
      ...(active_region?.state_id && { state_id: active_region?.state_id }),
    }));

    if (!roles.length) {
      toast.error("Please add new seva localtion.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("allot_roles", {
        user_id: !userExist ? 0 : sevadar?.id,
        roles,
        ...(!userExist && disciple),
      });
      toast.success(response.data?.message);
      router.back();
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userSevaRegionIndex === sevaRegionIndex) {
      const alreadyHasPermission = allotedTehsils.some(
        ({ tehsil_id, district_id }: any) =>
          userSevaRegionIndex == 4
            ? Number(district_id) == active_region?.district_id
            : userSevaRegionIndex == 5
              ? Number(tehsil_id) == active_region?.tehsil_id
              : false,
      );
      setHasAllotted(alreadyHasPermission);
    }
  }, [
    allotedTehsils,
    userSevaRegionIndex,
    sevaRegionIndex,
    active_region,
    role_type,
  ]);

  const setFirstNewAllotment = () => {
    const temp = objectWithValues({
      role_id,
      country_id: active_region?.country_id,
      state_id: active_region?.state_id,
      district_id: active_region?.district_id,
      city_id: active_region?.city_id,
      division_id: active_region?.division_id,
      tehsil_id: active_region?.tehsil_id,
      local: false,
      id: 0,
      role_type: role_type,
      title: active_region?.district_name,
    });
    // @ts-ignore
    setNewAllotTehsils([temp]);
  };

  return (
    <Layout headerProps={{ isBack: true, heading: "Sevadar Profile" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <DiscipleCard disciple={{ ...disciple, ...disciple?.disciple }} />

        {/* Allotted Tehsil List */}
        {allotedTehsils.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold text-primary mb-4 capitalize">
              Allotted Locations
            </p>
            {allotedTehsils.map((el: any, i) => (
              <RoleCard
                key={i}
                role={el}
                showUpdate={
                  updateSevdarPermission
                    ? isValidUser(updateSevdarPermission)
                    : false
                }
                onEditClick={() => {
                  setUserRoleId(el.id);
                  setShowEdit(true);
                }}
                showDelete={
                  removeSevdarPermission
                    ? isValidUser(removeSevdarPermission)
                    : false
                }
                onDeleteClick={() => {
                  setSelectedTehsil(el);
                  setShow(true);
                }}
              />
            ))}
          </div>
        )}
        {newAllotTehsils.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-gray-700">
            <p className="font-bold text-primary mb-4 capitalize">
              New locations to be added
            </p>
            {newAllotTehsils.map((el: any, i) => (
              <div
                key={i}
                className="flex items-center capitalize justify-between px-2"
              >
                <p>{`${role_type.toString().replace(/_/g, " ")} (${
                  el.title
                })`}</p>
                {!(el.role_id == 27 && active_permission?.role_id == 19) && // Book Calling
                  !(el.role_id == 28 && active_permission?.role_id == 20) && // Jyada Ruchi
                  !(el.role_id == 48 && active_permission?.role_id == 47) && // Old Calling
                  !(el.role_id == 43 && active_permission?.role_id == 42) && // Satnam Calling
                  !(el.role_id == 38 && active_permission?.role_id == 37) && ( // Namedan Calling
                    <button
                      onClick={() => {
                        setNewAllotTehsils(
                          [...newAllotTehsils].filter(
                            (_, index) => i !== index,
                          ),
                        );
                      }}
                      className="text-sm px-2 py-1 bg-red-400 font-bold text-white rounded"
                    >
                      Remove
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}

        {[
          "book_order_sevadar",
          "book_calling_sevadar",
          "jyada_ruchi_sevadar",
          "namdan_calling_sevadar",
          "satnam_calling_sevadar",
          "social_media_sevadar",
        ].includes(role_type) &&
        userSevaRegionIndex > 0 &&
        (allotedTehsils.length > 0 || newAllotTehsils.length > 0) ? null : (
          <Formik
            initialValues={{
              region_level: sevaRegionIndex,
              country_id: 2,
              state_id: 0,
              division_id: 0,
              district_id: 0,
              tehsil_id: 0,
              title: "",
            }}
            innerRef={formRef}
            validationSchema={schema}
            onSubmit={(values, { resetForm, setFieldValue }) => {
              const { region_level, ...rest } = values;
              addRole(objectWithValues(rest));
              resetForm();
              setFieldValue("region_level", sevaRegionIndex);
            }}
          >
            {({ values, setFieldValue }) =>
              values.region_level > 0 ? (
                <Form>
                  <UserwiseDropdown
                    showDivision={userSevaRegionIndex == 3}
                    useHirarchy
                    conditionalFields={{
                      country_id: false,
                      state_id: values.region_level >= 2,
                      division_id: values.region_level === 3,
                      district_id: values.region_level >= 4,
                      tehsil_id: values.region_level >= 5,
                    }}
                    isOptionDisabled={{
                      district_id:
                        values.region_level < 5
                          ? (option) =>
                              [...allotedTehsils, ...newAllotTehsils].some(
                                (e) => e.district_id === option.value,
                              )
                          : undefined,
                      tehsil_id: (option) =>
                        [...allotedTehsils, ...newAllotTehsils].some(
                          (e) => e.tehsil_id === option.value,
                        ),
                    }}
                    isDisabled={{
                      district_id:
                        (role_type == "book_order_sevadar" ||
                          role_type == "social_media_sevadar") &&
                        userSevaRegionIndex > 0 &&
                        (allotedTehsils.length > 0 ||
                          newAllotTehsils.length > 0),
                      tehsil_id:
                        (role_type == "book_order_sevadar" ||
                          role_type == "social_media_sevadar") &&
                        userSevaRegionIndex > 0 &&
                        (allotedTehsils.length > 0 ||
                          newAllotTehsils.length > 0),
                    }}
                    onChange={{
                      state_id: ({ label }) =>
                        values.region_level == 2 &&
                        setFieldValue("title", label),
                      division_id: ({ label }) =>
                        values.region_level == 3 &&
                        setFieldValue("title", label),
                      district_id: ({ label }) =>
                        values.region_level == 4 &&
                        setFieldValue("title", label),
                      tehsil_id: ({ label }) =>
                        values.region_level == 5 &&
                        setFieldValue("title", label),
                    }}
                  />
                  {sevaRegionIndex != userSevaRegionIndex ? (
                    <Button type="submit" className="mx-auto py-2">
                      + Add Location
                    </Button>
                  ) : null}
                </Form>
              ) : null
            }
          </Formik>
        )}

        {/* Add Sevadar Submission button */}
        {(sevaRegionIndex == userSevaRegionIndex && hasAllotted) ||
        (allotedTehsils.length > 0 &&
          [
            "book_order_sevadar",
            "book_calling_sevadar",
            "jyada_ruchi_sevadar",
            "namdan_calling_sevadar",
            "satnam_calling_sevadar",
            "old_calling_sevadar",
            "social_media_sevadar",
          ].includes(role_type)) ? null : (
          <div className="flex items-center justify-center space-x-6 pt-8 pb-6">
            <Button
              className="bg-green-600 w-1/2 text-white inline-flex font-bold px-7 py-3 rounded-xl disabled:bg-green-300"
              type="button"
              loading={loading}
              disabled={
                newAllotTehsils.length == 0 &&
                sevaRegionIndex != userSevaRegionIndex
              }
              onClick={onUpdate}
            >
              {tc("submit")}
            </Button>
          </div>
        )}

        {/* Remove Sevadar Modal */}
        <Modal
          show={show}
          onClose={closeModal}
          onConfirm={() => removeTehsil()}
          loading={removeLoading}
        >
          <div className="space-y-8 mb-8 text-center">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl">Are you sure to remove role?</p>
          </div>
        </Modal>

        {/* Edit Sevadar Modal */}
        <EditOrderSevaModal
          userRoleId={userRoleId}
          show={showEdit}
          setShow={setShowEdit}
        />
      </div>
    </Layout>
  );
};

interface EditOrderSevaModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  userRoleId?: number;
}

const EditOrderSevaModal = ({
  show,
  setShow,
  userRoleId,
}: EditOrderSevaModalProps) => {
  const formRef = useRef<any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const editSevadarLocation = async (values: FormikValues) => {
    setLoading(true);
    try {
      if (userRoleId && userRoleId != 0) {
        const { data } = await apiClient.post("transfer_sevadar", {
          ...values,
          user_role_id: userRoleId,
        });
        toast.success(data.message);
        setShow(false);
        router.reload();
      }
    } catch (error) {
      console.error(`Cannot change sevadar location `, error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      show={show}
      onClose={() => setShow(false)}
      onConfirm={() => {
        formRef.current?.handleSubmit();
      }}
      disableClosing={loading}
      loading={loading}
    >
      <div className="space-y-8 mb-8">
        <Formik
          innerRef={formRef}
          initialValues={{
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            move_order: true,
          }}
          onSubmit={editSevadarLocation}
        >
          {() => (
            <Form>
              <UserwiseDropdown conditionalFields={{ country_id: false }} />
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

Sevadar.requireAuth = true;

export const getStaticPaths: GetStaticPaths = (_: GetStaticPathsContext) => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};

export default Sevadar;
