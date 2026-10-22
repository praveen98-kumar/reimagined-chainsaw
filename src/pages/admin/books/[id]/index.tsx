import Button from "@/components/Button";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next/types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Modal from "@/components/modal/Modal";
import { Form, Formik } from "formik";
import { Option } from "@/shared/interfaces/option";
import Select from "@/components/input/Select";
import * as Yup from "yup";
import Switch from "@/components/input/Switch";

const schema = Yup.object({
  language_id: Yup.number()
    .required("Add one of the language")
    .min(1, "Add one of the language"),
});

const BookById = () => {
  const router = useRouter();
  const bookId = router.query?.id ?? null;
  const { t: tc } = useTranslation("common");
  const [book, setBook] = useState<{ [k: string]: any }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  async function getBook() {
    if (bookId == null) {
      router.back();
    }
    try {
      const { data } = await apiClient.get(`book/${bookId}`);
      setBook(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    getBook();
  }, []);

  const [allLanguages, setAllLanguages] = useState<Array<Option>>([]);
  async function getAllLanguages() {
    try {
      const { data } = await apiClient.get("languages?short_list=1");
      const temp = data.data.map((l: any) => ({ label: l.name, value: l.id }));
      setAllLanguages(temp);
    } catch (error) {}
  }
  const formRef = useRef<any>(null);
  useEffect(() => {
    if (allLanguages.length === 0 && showModal) {
      getAllLanguages();
    }
  }, [allLanguages, showModal]);

  const toggleBookLanguageActive = async ({
    active,
    language_id,
    book_language_id,
  }: {
    active: boolean;
    language_id: number;
    book_language_id: number;
  }) => {
    if (!bookId) {
      return;
    }
    setLoading(true);
    try {
      if (!active) {
        await apiClient.put(`book/${bookId}`, {
          title: book.title,
          language_id: book.languages[0]["id"],
          book_language_id: book.languages[0]["book_language_id"],
        });
      } else {
        await apiClient.delete(`book/${bookId}`, {
          data: {
            book_language_id,
          },
        });
      }
      setBook((prev) => ({
        ...prev,
        languages: [...book.languages].map((l) =>
          l.id == language_id ? { ...l, active: !active } : l
        ),
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookActive = async (active: boolean) => {
    if (!bookId) {
      return;
    }
    setLoading(true);
    try {
      if (!active) {
        await apiClient.put(`book/${bookId}`, {
          title: book.title,
          language_id: book.languages[0]["id"],
          book_language_id: book.languages[0]["book_language_id"],
        });
      } else {
        await apiClient.delete(`book/${bookId}`, {
          data: {
            book_id: bookId,
          },
        });
      }
      setBook((prev) => ({ ...prev, active: !active }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: book?.title + " Book",
      }}
    >
      <div className="p-4 w-full max-w-sm items-center mx-auto space-y-4">
        <h3 className="font-bold text-3xl text-slate-800 mb-4">{book.title}</h3>

        <h4 className="text-xl font-semibold underline underline-offset-2">
          {tc("language")}
        </h4>
        <div className="flex flex-col space-y-2 w-full">
          {Array.isArray(book.languages) &&
            book.languages.map((lang) => (
              <div
                className="flex items-center justify-between border-b border-gray-200 p-1"
                key={lang.id}
              >
                <p>{lang.name}</p>

                <Switch
                  disabled={loading}
                  value={lang.active}
                  checked={lang.active == true}
                  onChange={async () => {
                    await toggleBookLanguageActive({
                      active: lang.active,
                      language_id: lang.id,
                      book_language_id: lang.book_language_id,
                    });
                  }}
                />
              </div>
            ))}
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full">
          {tc("add_language")}
        </Button>
        <Button
          onClick={() => toggleBookActive(book.active)}
          disabled={loading}
          className={`w-full ${book.active ? "bg-red-500" : "bg-emerald-500"}`}
        >
          {book.active ? "Deactivate" : "Activate"}
        </Button>
      </div>
      <Modal
        modalClasses="h-1/2"
        show={showModal}
        onConfirm={() => {
          formRef?.current?.handleSubmit();
        }}
        onClose={() => setShowModal(false)}
      >
        <Formik
          initialValues={{ language_id: 0 }}
          onSubmit={async (d) => {
            if (bookId !== null) {
              setLoading(true);
              try {
                await apiClient.put(`book/${bookId}`, {
                  title: book.title,
                  language_id: d.language_id,
                  book_language_id: d.language_id,
                });
                toast("Language added successfully");
              } catch (error) {
                console.error(error);
              } finally {
                setLoading(false);
              }
            }
          }}
          innerRef={formRef}
          validationSchema={schema}
        >
          {({ setFieldValue, touched, errors }) => (
            <Form className="z-40">
              <Select
                className="h-10"
                label="Select Languages"
                options={allLanguages}
                isOptionDisabled={(option: any) =>
                  book.languages.find((l: any) => l.id == option.value)
                    ? true
                    : false
                }
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
      </Modal>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default BookById;
