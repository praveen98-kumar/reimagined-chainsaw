import apiClient from "@/http/index";
import { formatDate } from "@/shared/functions/utils";
import { WeddingRegistrationData } from "@/shared/interfaces/ramaini";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";

// Function to convert image to base64 via Next.js API route (to avoid CORS)
async function imageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(
      `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return "";
  }
}

export default function PrintPage() {
  const router = useRouter();
  if (!router.query.formId) {
    return null;
  }

  return <PrintComponent formId={router.query.formId as string} />;
}
function PrintComponent({ formId }: { formId: string }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] =
    React.useState<WeddingRegistrationData | null>(null);
  const [processedImages, setProcessedImages] = React.useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const printPage = async () => {
      if (!printRef.current) return;

      try {
        // window.print();
        // Create canvas from the form element
        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210 * 0.9; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add image to PDF
        pdf.addImage(imgData, "PNG", 5, 0, imgWidth, imgHeight);

        // Save the PDF
        pdf.save(`ramaini-form-${formId}.pdf`);
        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate PDF");
      }
    };
    const downloadPDF = async () => {
      try {
        const { data } = await apiClient.get(`/member/${formId}`);
        const memberData = data?.data;

        // Process external images to avoid CORS issues
        const imageFields = [
          "groom_photo",
          "groom_signature",
          "groom_guardian_signature",
          "bride_photo",
          "bride_signature",
          "bride_guardian_signature",
        ];

        const imagePromises = imageFields.map(async (field) => {
          if (
            memberData[field] &&
            memberData[field].includes("digitaloceanspaces.com")
          ) {
            try {
              const base64 = await imageToBase64(memberData[field]);
              return { field, base64 };
            } catch (error) {
              console.error(`Failed to process ${field}:`, error);
              return { field, base64: "" };
            }
          }
          return { field, base64: memberData[field] || "" };
        });

        const processedImageResults = await Promise.all(imagePromises);
        const processedImagesMap = processedImageResults.reduce(
          (acc, { field, base64 }) => {
            acc[field] = base64;
            return acc;
          },
          {} as Record<string, string>
        );

        setProcessedImages(processedImagesMap);
        setFormData(memberData);

        setTimeout(async () => {
          await printPage();
        }, 1500); // Give more time for images to load
      } catch (error) {
        console.error(error);
        toast.error("Failed to load form data");
      }
    };

    downloadPDF();
  }, [formId]);

  return (
    <div
      ref={printRef}
      className="bg-white text-black mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
      }}
    >
      {formData && (
        <RamainiVivahForm data={formData} processedImages={processedImages} />
      )}
    </div>
  );
}

const RamainiVivahForm: React.FC<{
  data: WeddingRegistrationData;
  processedImages: Record<string, string>;
}> = ({ data, processedImages }) => {
  return (
    <div className="container max-w-[800px] my-0 mx-auto">
      <div className="text-center relative">
        <img
          className="w-full m-0 border-none"
          src="/assets/images/Ramaini_Sapath_Patra.webp"
          alt="रमैनी शपथ पत्र"
        />
      </div>

      <div className="page4 px-4 relative">
        <img
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 w-[500px] h-[500px] rounded-full"
          src="/assets/images/bg.jpg"
          alt=""
        />

        <div className="flex justify-between">
          <p className="font-bold text-[16px]">
            <strong>दिनांक : {formatDate(data.bride_wedding_date)}</strong>
          </p>
          <p className="font-bold text-[16px]">
            <strong>
              रमैनी क्रमांक : {formatDate(data.bride_wedding_date) ?? ""}
            </strong>
          </p>
        </div>

        <div className=" my-1 mx-0 text-[16px]">
          विषय:{" "}
          <strong>
            विवाह (रमैणी) हेतु अनुरोधा - दोनों परिवारों की सहमति सहित
          </strong>
        </div>

        <p>सत साहेब जी,</p>

        <div className="text-justify mb-1">
          <div className="indent-[4rem] leading-[1.4rem] text-sm">
            निवेदन है कि निम्नलिखित वर व वधू के परिवारों ने आपसी सहमति से अपने
            बच्चों का विवाह <strong>(रमैणी)</strong> सतलोक आश्रम के नियमों
            अनुसार कराने का आग्रह किया है। दोनों पक्षों ने लिखित सहमति-पत्र
            प्रस्तुत किया है, जिसकी प्रतियां का परीक्षण हमारे स्तर पर कर लिया
            गया है। अत: <strong>सतलोक आश्रम रमैणी सेवा मुंडका</strong> की ओर से
            संचालक द्वारा <strong>{formatDate(data.bride_wedding_date)}</strong>{" "}
            को _____________ बजे निम्नलिखित जानकारी के आधार पर विवाह रमैणी
            सम्पन्न करवाए जाने का आग्रह है। कृपया निम्नलिखित नामों की रमैणी
            आगामी निर्धारित{" "}
            <strong>दिनांक: {formatDate(data.bride_wedding_date)}</strong> पर
            सतलोक आश्रम की व्यवस्था अनुसार करवाई जाए।
          </div>
          <div className="border-2 border-gray-800 rounded-2xl px-2 p-1 mt-1">
            <p className="text-sm font-[550] text-center">
              निवेदन: सतगुरु जी के विश्व कल्याण मिशन के अंतर्गत दहेज-मुक्त विवाह
              की परम्परा स्थापित करने हेतु रमैणी का आयोजन समागम <br />
              के समय सत्संग आरंभ में ही किया जाए। केवल विशेष परिस्थितियों में ही
              इसका आयोजन नामदान केंद्र अथवा सत्संग स्थल पर किया जाए।
            </p>
          </div>
          <div className="max-w-6xl mx-auto my-1.5">
            <div className="grid grid-cols-2 gap-4">
              {/* लड़के के परिवार की जानकारी */}
              <div className="border-r-2 border-gray-600 pr-1">
                <h2 className="text-lg font-semibold  pb-1 text-center">
                  लड़के के परिवार की जानकारी
                </h2>
                <div className="space-y-1 text-sm">
                  <p className="w-full flex">
                    लड़के का नाम:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.groom_full_name}
                    </span>
                  </p>
                  <p className="w-full flex">
                    लड़के की जन्मतिथि:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {formatDate(data.groom_dob)}
                    </span>
                  </p>
                  <p className="w-full flex">
                    लड़के के पिता का नाम:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.groom_father_name}
                    </span>
                  </p>
                  <p className="w-full flex">
                    लड़के की माता का नाम:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.groom_mother_name}
                    </span>
                  </p>
                  <p className="w-full flex">
                    पूरा पता:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.groom_address}
                    </span>
                  </p>
                  <div className="flex flex-row gap-2">
                    <p className="w-full flex">
                      तहसील:{" "}
                      <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                        {data.groom_tehsil}
                      </span>
                    </p>
                    <p className="w-full flex">
                      जिला:{" "}
                      <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                        {data.groom_district?.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="w-full flex">
                        राज्य:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data.groom_state?.name}
                        </span>
                      </p>
                      <p className="w-full flex">
                        मोबाइल नंबर:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data.groom_mobile_no}
                        </span>
                      </p>
                      <p className="w-full flex">
                        प्रथम नाम प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.groom_pratham_mantra_date
                            ? formatDate(data?.groom_pratham_mantra_date)
                            : ""}
                        </span>
                      </p>
                      <p className="w-full flex">
                        सतनाम प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.groom_satnam_date
                            ? formatDate(data?.groom_satnam_date)
                            : ""}
                        </span>
                      </p>
                      <p className="w-full flex">
                        सारनाम प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.groom_sarnam_date
                            ? formatDate(data?.groom_sarnam_date)
                            : ""}
                        </span>
                      </p>
                      <p className="w-full flex">
                        सारशब्द प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.groom_sarshabd_date
                            ? formatDate(data?.groom_sarshabd_date)
                            : ""}
                        </span>
                      </p>
                    </div>

                    <div className="ml-auto w-32 h-36 relative border-2 border-black/70">
                      <Image
                        src={
                          processedImages.groom_photo ||
                          data?.groom_photo ||
                          "/assets/images/bg.jpg"
                        }
                        alt="Groom's Photo"
                        fill
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* लड़की के परिवार की जानकारी */}
              <div className="pl-1">
                <h2 className="text-lg font-semibold  pb-1 text-center">
                  लड़की के परिवार की जानकारी
                </h2>
                <div className="space-y-1 text-sm">
                  <p className="w-full flex">
                    लड़की का नाम:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.bride_full_name}
                    </span>
                  </p>
                  <p className="w-full flex">
                    लड़की की जन्मतिथि:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {formatDate(data.bride_dob)}
                    </span>
                  </p>
                  <p className="w-full flex">
                    लड़की के पिता का नाम:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.bride_father_name}
                    </span>
                  </p>
                  <p className="w-full flex">
                    लड़की की माता का नाम:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.bride_mother_name}
                    </span>
                  </p>
                  <p className="w-full flex">
                    पूरा पता:{" "}
                    <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                      {data.bride_address}
                    </span>
                  </p>
                  <div className="flex flex-row gap-2">
                    <p className="w-full flex">
                      तहसील:{" "}
                      <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                        {data.bride_tehsil}
                      </span>
                    </p>
                    <p className="w-full flex">
                      जिला:{" "}
                      <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                        {data.bride_district?.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="space-y-1 flex-1">
                      <p className="w-full flex">
                        राज्य:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data.bride_state?.name}
                        </span>
                      </p>
                      <p className="w-full flex">
                        मोबाइल नंबर:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data.bride_mobile_no}
                        </span>
                      </p>
                      <p className="w-full flex">
                        प्रथम नाम प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.bride_pratham_mantra_date
                            ? formatDate(data?.bride_pratham_mantra_date)
                            : ""}
                        </span>
                      </p>
                      <p className="w-full flex">
                        सतनाम प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.bride_satnam_date
                            ? formatDate(data?.bride_satnam_date)
                            : ""}
                        </span>
                      </p>
                      <p className="w-full flex">
                        सारनाम प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.bride_sarnam_date
                            ? formatDate(data?.bride_sarnam_date)
                            : ""}
                        </span>
                      </p>
                      <p className="w-full flex">
                        सारशब्द प्राप्ति तिथि:{" "}
                        <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                          {data?.bride_sarshabd_date
                            ? formatDate(data?.bride_sarshabd_date)
                            : ""}
                        </span>
                      </p>
                    </div>

                    <div className="ml-auto w-32 h-36 relative border-2 border-black/70">
                      <Image
                        src={
                          processedImages.bride_photo ||
                          data?.bride_photo ||
                          "/assets/images/bg.jpg"
                        }
                        alt="Bride's Photo"
                        fill
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm">
            हम दोनों परिवार पूर्ण सहमति से अपने बच्चों का यह विवाह (रमैणी) कर
            रहे हैं। हम यह सुनिश्चित करते हैं कि वर और वधू{" "}
            <strong>भारतीय विवाह अधिनियम, 1955</strong> के अंतर्गत निर्धारित आयु
            सीमा को पूर्ण करते हैं तथा{" "}
            <strong>
              इस विवाह/रमैणी के लिए सभी आवश्यक कानूनी प्रक्रियाओं का पालन किया
              गया है।
            </strong>
          </p>
          <ul className="list-disc list-inside my-0.5 text-sm">
            <li>
              क्या आपके पुत्र/पुत्री की{" "}
              <strong>आयु (लड़कों 18 वर्ष, लड़की 21 वर्ष)</strong> सरकार के
              नियमों के अनुसार पूर्ण हो चुकी है?
              <input
                type="checkbox"
                defaultChecked={data?.groom_legal_age_met ?? false}
                readOnly
                name="married"
                className="mx-1"
              />{" "}
              हाँ
              <input
                type="checkbox"
                defaultChecked={data?.groom_legal_age_met === false}
                readOnly
                name="married"
                className="mx-1"
              />
              नहीं
            </li>
            <li>
              क्या दोनों पक्षों ने अपने क्षेत्र, गाँव आदि का ध्यान रखकर दहेज
              मुक्त विवाह <strong>(रमैणी) करने का निर्णय लिया है?</strong>
              <input
                type="checkbox"
                defaultChecked={data?.groom_rules_accept ?? false}
                readOnly
                name="local_rule"
                className="mx-1"
              />{" "}
              हाँ{" "}
              <input
                type="checkbox"
                defaultChecked={data?.groom_rules_accept === false}
                readOnly
                name="local_rule"
                className="mx-1"
              />{" "}
              नहीं
            </li>
            <li>
              क्या आप सतलोक आश्रम के अंतर्गत होने वाले रमैणी विवाह के नियमों से
              सहमत है?
              <input
                type="checkbox"
                defaultChecked={data?.groom_rules_accept ?? false}
                readOnly
                name="rules_followed"
                className="mx-1"
              />{" "}
              हाँ{" "}
              <input
                type="checkbox"
                defaultChecked={data?.groom_rules_accept === false}
                name="rules_followed"
                className="mx-1"
              />{" "}
              नहीं
            </li>
            <li>
              क्या लड़का पहले से विवाहित है?
              <input
                type="checkbox"
                defaultChecked={data?.groom_marital_status ?? false}
                readOnly
                name="groom_married"
                className="mx-1"
              />{" "}
              हाँ{" "}
              <input
                type="checkbox"
                defaultChecked={data?.groom_marital_status === false}
                name="groom_married"
                className="mx-1"
              />{" "}
              नहीं, क्या लड़की पहले से विवाहित है?{" "}
              <input
                type="checkbox"
                defaultChecked={data?.bride_marital_status ?? false}
                readOnly
                name="bride_married"
                className="mx-1"
              />{" "}
              हाँ{" "}
              <input
                type="checkbox"
                defaultChecked={data?.bride_marital_status === false}
                readOnly
                name="bride_married"
                className="mx-1"
              />{" "}
              नहीं
            </li>
          </ul>
          <p className="text-sm italic">
            (अगर <strong>हाँ तो तलाक के प्रमाण फार्म</strong> के साथ लगाना
            अनिवार्य है, अन्यथा रमैणी नहीं करवाई जाएगी)
          </p>
          <p className="text-sm">
            हम अपने बच्चों (उपरोक्त दी गई परिवार की जानकारी) का विवाह{" "}
            <strong>दिनांक:</strong> {formatDate(data.bride_wedding_date)}{" "}
            <strong>स्थान: नामदान केन्द्र/आश्रम</strong>{" "}
            <span className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate capitalize">
              {[
                data?.bride_wedding_address,
                data?.bride_wedding_district.name,
                data?.bride_wedding_state.name,
                data?.bride_wedding_country.name,
              ].join(", ")}{" "}
            </span>
            में करना चाहते है।
          </p>
          <p className="text-sm">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;हम
            यह भी घोषणा करते हैं कि हमारे द्वारा दी गई उपरोक्त जानकारी सत्य,
            पूर्ण और सही है। यदि हमारी इस घोषणा में कोई त्रुटि या असत्यता पाई
            जाती है, तो हम इसके लिए पूर्ण रूप से जिम्मेदार रहेंगे।
          </p>
          <div className="border-2 border-gray-800 rounded-2xl px-2 p-1 mt-1 text-sm text-center my-1">
            <strong>नोट:</strong> लड़का व लड़की और माता-पिता का आधार कार्ड,
            नामदीक्षा फॉर्म की फोटो कॉपी, 10वीं मार्कशीट और दोनो की 1-1 फोटो
            फॉर्म के <br /> साथ लगाना अनिवार्य है। रमैणी के समय लड़के और लड़की
            के परिजनों की उपस्थिति अनिवार्य है, अन्यथा रमैणी नहीं करवाई जाएगी।
          </div>
          {/* Signatures */}
          <div className="flex flex-row text-sm justify-between">
            <div>
              <div>
                <div className="flex gap-2">
                  <p>लड़के (वर) के हस्ताक्षर:</p>
                  <div className="w-40 h-6 border border-black/70 relative">
                    <Image
                      src={
                        processedImages.groom_signature ||
                        data?.groom_signature ||
                        "/assets/images/bg.jpg"
                      }
                      alt="groom_signature"
                      fill
                      className="absolute"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <p>लड़के के परिवार के हस्ताक्षर:</p>
                  <div className="w-40 h-6 border border-black/70 relative">
                    <Image
                      src={
                        processedImages.groom_guardian_signature ||
                        data?.groom_guardian_signature ||
                        "/assets/images/bg.jpg"
                      }
                      alt="groom_guardian_signature"
                      fill
                      className="absolute"
                    />
                  </div>
                </div>
                <p className="w-full flex">
                  लड़के से रिश्ता:
                  <strong className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                    {data.groom_relation}
                  </strong>
                </p>
                <p className="w-full flex">
                  मोबाइल नंबर:
                  <strong className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                    {data.groom_guardian_mobile_no}
                  </strong>
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                className="!w-[130px] !h-[75px] align-middle overflow-hidden object-center z-10"
                src="/assets/images/stamp.png"
                alt="stamp"
              />
              <p className="font-bold text-md text-center w-[100px] absolute left-[50%] top-[50%] -translate-x-[50px]">
                सत्यापित
              </p>
            </div>
            <div>
              <div>
                <div className="flex gap-2">
                  <p>लड़की (वधू) के हस्ताक्षर:</p>
                  <div className="w-40 h-6 border border-black/70 relative">
                    <Image
                      src={
                        processedImages.bride_signature ||
                        data?.bride_signature ||
                        "/assets/images/bg.jpg"
                      }
                      alt="bride_signature"
                      fill
                      className="absolute"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <p>लड़की के परिवार के हस्ताक्षर:</p>
                  <div className="w-40 h-6 border border-black/70 relative">
                    <Image
                      src={
                        processedImages.bride_guardian_signature ||
                        data?.bride_guardian_signature ||
                        "/assets/images/bg.jpg"
                      }
                      alt="bride_guardian_signature"
                      fill
                      className="absolute"
                    />
                  </div>
                </div>

                <p className="w-full flex">
                  लड़की से रिश्ता:{" "}
                  <strong className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                    {data.bride_relation}
                  </strong>
                </p>
                <p className="w-full flex">
                  मोबाइल नंबर:{" "}
                  <strong className="font-bold ml-1 border-b flex-1 border-black/50 border-dashed border-separate">
                    {data.bride_guardian_mobile_no}
                  </strong>
                </p>
              </div>
            </div>
          </div>
          <div className="py-1 border border-black/80 mt-1 text-[11.5px] text-center">
            <strong>नोट:</strong> यह पत्र केवल राज्य, जिला सेवादार व नामदान
            केन्द्र हेतु सूचनार्थ हैं मान्य है, सतलोक आश्रम में ब्याह किसी कार्य
            में मान्य नहीं होगा। यह पत्र अन्य किसी भी सेवादार को नहीं देना है।
          </div>
        </div>
      </div>
    </div>
  );
};
