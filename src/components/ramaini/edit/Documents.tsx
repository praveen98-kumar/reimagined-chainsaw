import { useFormikContext } from "formik";
import React, { useState } from "react";
import DocumentItem from "./DocumentItem";
import ImagePreviewModal from "../image-preview-modal";

type DocumentsProps = {
  personType: "groom" | "bride";
  isFormDisabled?: boolean;
};

const Documents = ({ personType, isFormDisabled }: DocumentsProps) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const [previewImage, setPreviewImage] = useState<any>(null);

  const capitalizedPersonType = personType === "groom" ? "Ladka" : "Ladki";

  const documents = [
    {
      label: `Photo`,
      field: `${personType}_photo`,
      urlField: `${personType}_photo_url`,
    },
    {
      label: "Signature",
      field: `${personType}_signature`,
      urlField: `${personType}_signature_url`,
    },
    {
      label: "Guardian Signature",
      field: `${personType}_guardian_signature`,
      urlField: `${personType}_guardian_signature_url`,
    },
    {
      label: "Marksheet",
      field: `${personType}_marksheet`,
      urlField: `${personType}_marksheet_url`,
    },
    {
      label: "Aadhar Card Front",
      field: `${personType}_aadhar_card_front`,
      urlField: `${personType}_aadhar_card_front_url`,
    },
    {
      label: "Aadhar Card Back",
      field: `${personType}_aadhar_card_back`,
      urlField: `${personType}_aadhar_card_back_url`,
    },
    {
      label: "Father Aadhar Card Front",
      field: `${personType}_father_aadhar_card_front`,
      urlField: `${personType}_father_aadhar_card_front_url`,
    },
    {
      label: "Father Aadhar Card Back",
      field: `${personType}_father_aadhar_card_back`,
      urlField: `${personType}_father_aadhar_card_back_url`,
    },
    {
      label: "Mother Aadhar Card Front",
      field: `${personType}_mother_aadhar_card_front`,
      urlField: `${personType}_mother_aadhar_card_front_url`,
    },
    {
      label: "Mother Aadhar Card Back",
      field: `${personType}_mother_aadhar_card_back`,
      urlField: `${personType}_mother_aadhar_card_back_url`,
    },
    {
      label: "Naamdiksha Form",
      field: `${personType}_naamdiksha_form`,
      urlField: `${personType}_naamdiksha_form_url`,
    },
  ];

  const handleUpdate = (field: string, urlField: string, file: File) => {
    setFieldValue(field, file);
    setFieldValue(urlField, URL.createObjectURL(file));
  };

  const handlePreview = (imageUrl: string, label: string) => {
    if (imageUrl) {
      setPreviewImage({
        images: [
          {
            id: "1",
            url: imageUrl,
            name: label,
            size: 0,
            type: "image",
          },
        ],
        initialIndex: 0,
      });
    }
  };

  const images = documents.map(({ label, field, urlField }) => ({
    id: field,
    url: values?.[field] || values?.[urlField],
    name: `${capitalizedPersonType} ${label}`,
    type: "image",
  }));

  return (
    <div>
      <h2 className="text-xl font-bold border-b pb-2 pt-4">
        {capitalizedPersonType} Documents
      </h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {documents.map(({ label, field, urlField }) => (
          <DocumentItem
            key={field}
            label={label}
            imageUrl={values[urlField] || values[field] || "/placeholder.svg"}
            onUpdate={(file) => handleUpdate(field, urlField, file)}
            onPreview={() =>
              handlePreview(values[urlField] || values[field], label)
            }
            isFormDisabled={isFormDisabled}
          />
        ))}
        {values?.[`${personType}_marital_status`] === "yes" && (
          <DocumentItem
            isFormDisabled={isFormDisabled}
            label={"Divorce Paper"}
            imageUrl={
              values[`${personType}_divorce_paper_url`] ||
              values[`${personType}_divorce_paper`] ||
              "/placeholder.svg"
            }
            onUpdate={(file) =>
              handleUpdate(
                `${personType}_divorce_paper`,
                `${personType}_divorce_paper_url`,
                file
              )
            }
            onPreview={() =>
              handlePreview(
                values[`${personType}_divorce_paper_url`] ||
                  values[`${personType}_divorce_paper`],
                "Divorce Paper"
              )
            }
          />
        )}
      </div>
      {previewImage && (
        <ImagePreviewModal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          // @ts-ignore
          images={images}
          initialIndex={0}
        />
      )}
    </div>
  );
};

export default Documents;
