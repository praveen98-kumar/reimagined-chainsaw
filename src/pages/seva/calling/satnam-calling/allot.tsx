import Button from "@/components/Button";
import {
  CardIcons,
  CardMessage,
  CardWrapper,
} from "@/components/card/CommonCard";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Option } from "@/shared/interfaces/option";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

const AllotSingleSatnamCalling: NextApplicationPage = () => {
  const router = useRouter();
  const callIndex = router.query.callIndex as string;
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const [sevadarList, setSevadarList] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [discipleList, setDiscipleList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [items, setItems] = useState<number[]>([]);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const activeDistrictId =
    active_permission?.region[active_region_index]?.district_id;
  const getSevadarList = async () => {
    try {
      //TOOD: add api endpoint to get sevadar list
      const { data } = await apiClient.get("users", {
        params: {
          seva_type: "satnam_calling",
          district_id: activeDistrictId,
        },
      });
      const updatedList = data.data.result.map((u: any) => ({
        label: u.disciple.name,
        value: u.id,
      }));
      setSevadarList(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  async function getData(page: number, params?: any) {
    if (!loading && hasMore) {
      setLoading(true);
      try {
        //TOOD: add api endpoint
        const { data } = await apiClient.get("satnam_calling", {
          params: {
            ...params,
            page,
            for_allot: 1,
          },
        });
        setHasMore(data.data.total > 10 * page);
        const tempData =
          page == 1
            ? data.data.disciple
            : [...discipleList, ...data.data.disciple];
        setDiscipleList(tempData);
        setPage(page + 1);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  }

  function addItems(e: React.ChangeEvent<HTMLInputElement>, id: number) {
    if (e.target.checked) {
      setItems((p) => [...p, id]);
    } else {
      setItems(items.filter((i) => i !== id));
    }
  }

  async function onSubmit(values: any) {
    if (items.length == 0) {
      return toast.error("Atleast select one call");
    }
    try {
      // TODO: add api endpoint
      await apiClient.post("satnam_calling", {
        user_id: values.sevadarId,
        disciples: items,
      });
      setDiscipleList(
        discipleList.filter(({ id }) => !items.some((i) => i === id))
      );
      toast.success(
        `${items.length} Satnam calls allotted to ${values.sevadarName}`
      );
      setItems([]);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getSevadarList();
    getData(1, {});
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          `Satnam Calling ` + (t("satnam.seva.title.allot") || "Allot Seva"),
      }}
    >
      <div className="p-4 w-full max-w-xl mx-auto space-y-4">
        {/* Sevadar selection */}
        <Formik
          initialValues={{
            sevadarId: 0,
            sevadarName: "",
          }}
          onSubmit={async (values, { resetForm }) => {
            await onSubmit(values);
            resetForm();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Select
                label={tc("select_sevadar") || "Select Sevadar"}
                options={sevadarList}
                value={
                  sevadarList.find(({ value }) => values.sevadarId == value) ??
                  null
                }
                onChange={(opt: any) => {
                  if (opt?.value) {
                    const sevadarName = sevadarList.find(
                      ({ value }) => value == opt.value
                    )!.label;
                    setFieldValue("sevadarId", opt.value);
                    setFieldValue("sevadarName", sevadarName);
                  }
                }}
              />
              <Button
                disabled={items.length == 0 || !values.sevadarId}
                type="submit"
                className="mx-auto"
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>

        {discipleList.length > 0 && (
          <InfiniteScroll
            className="space-y-4"
            dataLength={discipleList.length}
            next={() => getData(page, {})}
            hasMore={hasMore}
            loader={loading && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {discipleList.map(({ id, address, name, mobile_no, form_date }) => (
              <label className="relative mb-4" key={id}>
                <input
                  className="absolute top-3 left-3 rounded checked:text-blue-500"
                  type={"checkbox"}
                  style={{ zIndex: 1 }}
                  name={"order"}
                  id={"order"}
                  onChange={(e) => addItems(e, id)}
                />
                <CardWrapper
                  className={`w-[98%] mb-4 ${
                    items.includes(id) && "ring-blue-200 border-blue-500"
                  }`}
                >
                  <CardMessage
                    className="pl-8 pr-10"
                    message={{
                      name: name,
                      address: address,
                      mobile_no: mobile_no,
                      form_date: dayjs(form_date).format("DD-MM-YYYY"),
                    }}
                  />
                  <CardIcons mobile_no={mobile_no} />
                </CardWrapper>
              </label>
            ))}
          </InfiniteScroll>
        )}
      </div>
    </Layout>
  );
};

AllotSingleSatnamCalling.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default AllotSingleSatnamCalling;
