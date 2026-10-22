import Button from "@/components/Button";
import Layout from "@/components/Layout";
import TextInput from "@/components/input/TextInput";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect, useRef, useState, forwardRef } from "react";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { Option } from "@/shared/interfaces/option";
import Select from "@/components/input/Select";

const addLanguageSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  hi_title: Yup.string().nullable().optional(),
  language_id: Yup.number()
    .required("Add one of the language")
    .min(1, "Add one of the language"),
});

export type AddLanguagePayload = Yup.InferType<typeof addLanguageSchema>;

const addFormInitialValues: AddLanguagePayload = {
  title: "",
  hi_title: "",
  language_id: 0,
};

interface BookItem {
  id: number;
  title: string;
  languages: Array<any>;
}

export const BookForm = forwardRef<
  FormikProps<AddLanguagePayload>,
  { onSubmit: (data: AddLanguagePayload) => void }
>(({ onSubmit }, ref) => {
  const [allLanguages, setAllLanguages] = useState<Array<Option>>([]);
  async function getAllLanguages() {
    try {
      const { data } = await apiClient.get("languages?short_list=1");
      const temp = data.data.map((l: any) => ({ label: l.name, value: l.id }));
      setAllLanguages(temp);
    } catch (error) {}
  }
  useEffect(() => {
    if (allLanguages.length === 0) {
      getAllLanguages();
    }
  }, [allLanguages]);
  return (
    <Formik
      innerRef={ref}
      validationSchema={addLanguageSchema}
      initialValues={addFormInitialValues}
      onSubmit={onSubmit}
      withCloseHandler={false}
    >
      {({ values, setFieldValue, touched, errors }) => (
        <Form>
          <TextInput label="Title" name="title" value={values.title} />
          <TextInput
            label="Hindi Title"
            name="hi_title"
            value={values.hi_title ?? ""}
          />
          <Select
            label="Select Languages"
            options={allLanguages}
            name="languages"
            onChange={(e: any) => {
              setFieldValue("language_id", e.value);
            }}
            // @ts-ignore
            error={errors.language_id}
            // @ts-ignore
            touched={touched.language_id}
          />
        </Form>
      )}
    </Formik>
  );
});

const BookItem = ({ id, title }: BookItem) => (
  <div className="px-2 py-1.5 rounded-md border border-gray-700 flex items-center justify-between w-full">
    <div className="flex-1 overflow-hidden text-ellipsis pr-4">{title}</div>

    <Link
      href={`/admin/books/${id}`}
      className="font-medium font-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md"
    >
      View
    </Link>
  </div>
);

const ManageBooks = () => {
  const [books, setBooks] = useState<Array<BookItem>>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  async function getAllBooks() {
    try {
      const { data } = await apiClient.get("books");
      setBooks(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  const formRef = useRef<any>(null);

  useEffect(() => {
    getAllBooks();
  }, []);

  async function onSubmit(data: AddLanguagePayload) {
    setLoading(true);
    try {
      const { data: resData } = await apiClient.post("books", data);
      toast.success("Book added successfully");
      if (resData) {
        setBooks((prev) => [
          ...prev,
          { id: resData.id, title: data.title, languages: [] },
        ]);
      }
      formRef?.current?.resetForm();
      setShowModal(false);
    } catch (error) {
      console.log(error);
      toast.error("Could not add language");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Books",
      }}
    >
      <div className="p-4 w-full flex flex-col max-w-sm items-center mx-auto space-y-4">
        <div className="flex-1 h-full w-full space-y-4">
          {books.map((b) => (
            <BookItem key={b.id} {...b} />
          ))}
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full mx-auto">
          Add New Book
        </Button>
      </div>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          formRef?.current.handleSubmit();
        }}
      >
        <div className="space-y-8 mb-8">
          <BookForm ref={formRef} onSubmit={onSubmit} />
        </div>
      </Modal>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default ManageBooks;
