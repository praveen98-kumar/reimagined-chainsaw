import Button from "@/components/Button";
import Layout from "@/components/Layout";
import Switch from "@/components/input/Switch";
import TextInput from "@/components/input/TextInput";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { FormikProps, FormikValues, Formik, Form } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { BiEdit } from "react-icons/bi";
import { FaQuestionCircle } from "react-icons/fa";
import * as Yup from "yup";

export interface JsonObj {
  id: number;
  name: string;

  [k: string]: string | number | boolean;
}

const LanguageForm = ({
  item,
  setShowEditModal,
  existingItems,
}: {
  item?: JsonObj;
  setShowEditModal?: React.Dispatch<React.SetStateAction<boolean>>;
  existingItems?: Array<JsonObj>;
}) => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormikProps<{ name: string }>>(null);

  const isLanguageExists = existingItems?.some(
    ({ name }) => name === formRef.current?.values.name,
  );

  const schema = Yup.object({
    name: Yup.string()
      .required("Language Name is required")
      .test("test-existing", "Language already exists", (v) =>
        existingItems ? existingItems.some(({ name }) => name !== v) : true,
      ),
    short_name: Yup.string()
      .required("Language Shortname Name is required")
      .test(
        "test-shortname-existing",
        "Language Shortname already exists",
        (v) =>
          existingItems
            ? existingItems.some(({ name }) => name !== v) && v?.length == 2
            : true,
      ),
  });

  const addChannel = async (values: FormikValues) => {
    setLoading(true);
    try {
      await apiClient.post("languages", values);
      toast.success(`${values.name} language added successfully`);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
      setShowEditModal && setShowEditModal(false);
    }
  };

  const editChannel = async (values: FormikValues) => {
    setLoading(true);
    try {
      await apiClient.put(`languages/${item!.id}`, values);
      toast.success(`${values.name} language edited successfully`);
      setShowEditModal && setShowEditModal(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: item?.name ?? "",
        short_name: item?.short_name ?? "",
      }}
      validationSchema={schema}
      onSubmit={(values, { resetForm }) => {
        if (item) {
          editChannel(values);
        } else {
          addChannel(values);
        }
        resetForm();
      }}
    >
      {({ values }) => (
        <Form>
          <TextInput
            name="name"
            required
            label="Language Name"
            placeholder="Enter Language name"
          />
          <TextInput
            name="short_name"
            required
            maxLength={2}
            label="Language Short Name"
            placeholder="Enter Language Short name"
          />
          <Button
            loading={loading}
            className="w-full disabled:bg-gray-300 disabled:text-gray-600"
            type="submit"
            disabled={
              item ? item?.name === values.name : (isLanguageExists ?? false)
            }
          >
            {item ? "Save Changes" : "Add Language"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const LanguageItem = ({ item }: { item: JsonObj }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [, setLoading] = useState(false);

  const deleteLanguage = async (item: JsonObj) => {
    setLoading(true);
    try {
      await apiClient.delete(`languages/${item!.id}`);
      toast.success(`${item.name} Language deleted successfully`);
      setShowEditModal && setShowEditModal(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 py-1.5 rounded-md border border-gray-700 flex items-center justify-between w-full">
      <div className="flex-1 overflow-hidden text-ellipsis pr-4">
        {item.name}
      </div>
      <div className="flex flex-row items-center space-x-2">
        <button
          onClick={() => setShowEditModal(true)}
          className="font-medium font-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md"
        >
          <BiEdit className="w-6 h-6" />
        </button>
      </div>
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={() => {}}
        withCloseHandler={false}
      >
        <div className="space-y-8 mb-8">
          <LanguageForm item={item} setShowEditModal={setShowEditModal} />
        </div>
      </Modal>
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          deleteLanguage(item);
        }}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            {tq("delete_language", { name: item.name })}
          </p>
        </div>
      </Modal>
    </div>
  );
};

const Languages: NextApplicationPage = () => {
  const [languages, setLanguages] = useState<Array<JsonObj>>([]);
  const { t: th } = useTranslation("heading");
  const { t: tc } = useTranslation("common");

  const getLanguages = async () => {
    try {
      const { data } = await apiClient.get("languages");
      setLanguages(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLanguages();
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: th("book_language") ?? "Manage Books Languages",
      }}
    >
      <div className="p-4 w-full max-w-sm items-center mx-auto">
        <LanguageForm />
        <h3 className="mt-4 mb-2 font-bold text-gray-900">{tc("languages")}</h3>
        <div className="flex flex-col items-center space-y-3">
          {[...languages].map((item) => (
            <LanguageItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "home",
        "heading",
        "question",
      ])),
    },
  };
};

export default Languages;
