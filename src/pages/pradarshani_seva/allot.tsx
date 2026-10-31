import type { GetStaticProps } from "next";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import { Fragment, useCallback, useEffect, useState } from "react";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import type { AllotedTehsil } from "../users/[userId]";
import type { Option } from "@/shared/interfaces/option";

import Layout from "@/components/Layout";
import useLocalstorage from "@/hooks/useLocalstorage";
import DiscipleCard from "@/components/card/DiscipleCard";
import { RoleCard } from "@/components/card/UserCard";
import { getAshrams } from "@/shared/functions/location";
import Select from "@/components/input/Select";
import Button from "@/components/Button";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http";
import { isValidUser } from "@/shared/functions/utils";

const PRADARSHANI_SEVADAR_ROLE_ID = 62;
const PradarshaniAllotSevaPage: NextApplicationPage = () => {
  const { t } = useTranslation("common");
  const [allotedTehsils, setAllotedTehsils] = useState<AllotedTehsil[]>([]);
  const [disciple] = useLocalstorage<any>("selectedDisciple");
  const [show, setShow] = useState<boolean>(false);
  const [ashrams, setAshrams] = useState<Option[]>([]);
  const [sevadarId, setsevadarId] = useState<number | null>(null);
  const [selectedAshram, setSelectedAshram] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [locationId, setLocationId] = useState<number | null>(null);

  const [userExist, setUserExist] = useState<boolean>(true);

  const loadAshrams = useCallback(async () => {
    const list = await getAshrams();
    setAshrams(list);
  }, []);

  const removeRole = async () => {
    if (!locationId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.delete(
        `set_remove_user_in_queue/${locationId}`,
      );
      setAllotedTehsils([]);
      setShow(false);
      toast.success(response.data?.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error);
      }
    } finally {
      setIsLoading(false);
      setShow(false);
    }
  };
  const loadAllotedRole = useCallback(async () => {
    if (router.query?.discipleId) {
      try {
        const { data } = await apiClient.get(
          `user/0?disciple_id=${router.query.discipleId}&role_id=${PRADARSHANI_SEVADAR_ROLE_ID}`,
        );
        setsevadarId(data.data.id);
        setAllotedTehsils(data?.data?.allotted_tehsil ?? []);
      } catch (error) {
        if (error instanceof AxiosError) {
          setUserExist(false);
          console.error(error?.response?.data?.error);
        }
      }
    }
  }, [router.query?.discipleId]);

  useEffect(() => {
    loadAllotedRole();
  }, [loadAllotedRole]);
  useEffect(() => {
    loadAshrams();
  }, [loadAshrams]);

  const handleAssign = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("allot_roles", {
        user_id: userExist ? sevadarId : 0,
        roles: [
          {
            role_id: PRADARSHANI_SEVADAR_ROLE_ID,
            namdan_center_id: selectedAshram?.value,
            country_id: selectedAshram?.country_id,
            state_id: selectedAshram?.state_id,
          },
        ],
        ...(!userExist && disciple),
      });
      toast.success(response.data?.message);
      router.back();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("allot_seva"),
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <DiscipleCard disciple={{ ...disciple, ...disciple?.disciple }} />
        {allotedTehsils.length > 0 ? (
          <div className="space-y-2">
            <p className="font-bold text-primary mb-4 capitalize">
              Allotted Locations
            </p>
            {allotedTehsils.map((el: any, i) => (
              <RoleCard
                key={i.toString()}
                role={el}
                showDelete={isValidUser("add_pradarshani_sevadar")}
                onDeleteClick={() => {
                  setLocationId(el.id);
                  setShow(true);
                }}
              />
            ))}
          </div>
        ) : (
          <Fragment>
            <Select
              options={ashrams}
              label={t("ashram")}
              name="ashram_id"
              placeholder={t("select_ashram") ?? "Select Ashram"}
              value={
                ashrams.find((c) => c.value === selectedAshram?.value) ?? null
              }
              onChange={(opt: any) => setSelectedAshram(opt)}
              isDisabled={isLoading}
              required
            />

            <Button type="button" onClick={handleAssign} disabled={isLoading}>
              Submit
            </Button>
          </Fragment>
        )}

        <Modal
          show={show}
          onClose={() => setShow(false)}
          onConfirm={removeRole}
          loading={isLoading}
        >
          <div className="space-y-8 mb-8 text-center">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl">Are you sure to remove role?</p>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

PradarshaniAllotSevaPage.requireAuth = true;

export default PradarshaniAllotSevaPage;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pradarshani"])),
    },
  };
};
