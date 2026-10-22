import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Layout from "@/components/Layout";
import Button from "@/components/Button";
import { toast } from "react-hot-toast";

interface RamainiFormData {
  // Personal Details - Groom
  groom_full_name: string;
  groom_father_name: string;
  groom_birth_date: string;
  groom_birth_place: string;
  groom_mobile: string;
  groom_address: string;
  groom_tehsil: string;
  groom_district: string;
  groom_state: string;
  groom_country: string;
  groom_first_name_initiation: string;
  groom_first_initiation_date: string;
  groom_spiritual_name: string;
  groom_spiritual_initiation_date: string;
  groom_father_spiritual_name: string;
  groom_mother_name: string;
  groom_saar_naam_date: string;
  groom_saar_shabd_date: string;

  // Personal Details - Bride
  bride_full_name: string;
  bride_father_name: string;
  bride_birth_date: string;
  bride_birth_place: string;
  bride_mobile: string;
  bride_address: string;
  bride_tehsil: string;
  bride_district: string;
  bride_state: string;
  bride_country: string;
  bride_first_name_initiation: string;
  bride_first_initiation_date: string;
  bride_spiritual_name: string;
  bride_spiritual_initiation_date: string;
  bride_father_spiritual_name: string;
  bride_mother_name: string;
  bride_saar_naam_date: string;
  bride_saar_shabd_date: string;

  // Wedding Details
  wedding_date: string;
  wedding_place: string;
  serial_number: string;
}

const RamainiForm: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);

  // Sample data for display purposes
  const displayData: RamainiFormData = {
    groom_full_name: "राम कुमार",
    groom_father_name: "श्याम लाल",
    groom_birth_date: "01/01/1995",
    groom_birth_place: "दिल्ली",
    groom_mobile: "9876543210",
    groom_address: "123, मुख्य मार्ग, दिल्ली",
    groom_tehsil: "नई दिल्ली",
    groom_district: "दिल्ली",
    groom_state: "दिल्ली",
    groom_country: "भारत",
    groom_first_name_initiation: "15/05/2010",
    groom_first_initiation_date: "15/05/2010",
    groom_spiritual_name: "01/01/2015",
    groom_spiritual_initiation_date: "01/01/2015",
    groom_father_spiritual_name: "हरि नाम",
    groom_mother_name: "सीता देवी",
    groom_saar_naam_date: "01/01/2018",
    groom_saar_shabd_date: "01/01/2020",

    bride_full_name: "सीता कुमारी",
    bride_father_name: "राम प्रसाद",
    bride_birth_date: "15/06/1998",
    bride_birth_place: "हरियाणा",
    bride_mobile: "9876543211",
    bride_address: "456, गांव मोहल्ला, हरियाणा",
    bride_tehsil: "गुड़गांव",
    bride_district: "गुड़गांव",
    bride_state: "हरियाणा",
    bride_country: "भारत",
    bride_first_name_initiation: "20/07/2012",
    bride_first_initiation_date: "20/07/2012",
    bride_spiritual_name: "10/10/2016",
    bride_spiritual_initiation_date: "10/10/2016",
    bride_father_spiritual_name: "गुरु नाम",
    bride_mother_name: "गीता देवी",
    bride_saar_naam_date: "10/10/2019",
    bride_saar_shabd_date: "10/10/2021",

    wedding_date: "25/12/2024",
    wedding_place: "सतलोक आश्रम, मुंडका",
    serial_number: "1,00123",
  };

  const downloadPDF = async () => {
    if (!formRef.current) return;

    try {
      // Create canvas from the form element
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save("ramaini-form.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-lg rounded-lg p-8" ref={formRef}>
            {/* Header Section */}
            <div className="border-2 border-black mb-4">
              <div className="flex items-start justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white font-bold text-3xl">R</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-black mb-1">
                      सतलोक आश्रम रमैणी सेवा, मुंडका
                    </h1>
                    <p className="text-lg font-semibold">
                      Mob : +91 92668-61466
                    </p>
                    <p className="text-lg">मुंडका, दिल्ली (110081)</p>
                    <div className="bg-red-800 text-white px-6 py-1 mt-2 text-center">
                      <p className="font-semibold">www.ramaini.org</p>
                    </div>
                  </div>
                </div>
                <div className="w-32 h-40 border-2 border-gray-400 flex items-center justify-center bg-gray-50 mr-4">
                  <img
                    src="/guruji.jpeg"
                    alt="Guruji"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Serial Number */}
            <div className="text-right mb-4">
              <span className="font-semibold">रमैणी क्रमांक : </span>
              <span className="inline-block w-32 border-b border-gray-400 text-center">
                {displayData.serial_number}
              </span>
            </div>

            <div className="space-y-4">
              {/* Date and Serial */}
              <div className="text-left mb-4">
                <p className="font-semibold">दिनांक :</p>
              </div>

              {/* Form Title */}
              <div className="mb-6">
                <p className="font-bold text-lg mb-2">
                  विषय: विवाह (रमैणी) हेतु अनुज्ञता - दोनों परिवारों की सहमति
                  सहित
                </p>
                <p className="mb-3">सत साहेब जी,</p>
                <p className="text-justify leading-relaxed mb-4 text-sm">
                  निवेदन है कि निम्नलिखित वर व वधू के परिवारों से आपसी सहमति से
                  अपने बच्चों का विवाह (रमैणी) करवाने के निर्णयों अनुसार करवाना
                  का आग्रह किया है। दोनों पक्षों ने स्वविवेक सम्मति-पत्र
                  प्रस्तुत किया है, जिसकी सत्यता का परीक्षण हमारे स्तर पर कर
                  लिया गया है। अत:{" "}
                  <strong>सतलोक आश्रम रमैणी सेवा मुंडका</strong> की ओर से करवाने
                  का निवेदन है कि इसमें भी आश्रम से हम कह रहे हैं कि हमारा
                  आशीर्वाद के लिए कृपया निम्नलिखित नामों की
                </p>
                <p className="text-sm">
                  सेवादार आदमी निर्देशित दिनांक : ........................... पर
                  सतलोक आश्रम की व्यवस्था अनुसार करवाई जाए।
                </p>
              </div>

              {/* Notice */}
              <div className="border border-black p-3 rounded mb-6">
                <p className="text-sm font-semibold text-center">
                  निवेदन: सतगुरु जी के विश कल्याण नियम के अंतर्गत वधू-वर विवाह
                  की शिसाल स्थापित करने हेतु रमैणी का आयोजन समामान के समय सतलोक
                  आश्रम में हो किया जाए। केवल विशेष परिस्थितियों में ही इसका
                  आयोजन नामदान केंद्र अथवा सत्संग स्थल पर किया जाए।
                </p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Groom Details */}
                <div className="border border-black">
                  <h3 className="text-base font-bold text-center bg-gray-200 py-1 border-b border-black">
                    लड़के के परिवार की जानकारी
                  </h3>
                  <div className="space-y-2 p-2">
                    <div className="flex">
                      <span className="text-xs w-24">लड़के का नाम :</span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_full_name}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">लड़के की जन्मतिथि :</span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_birth_date}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">
                        लड़के के पिता का नाम :
                      </span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_father_name}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">
                        लड़के की माता का नाम :
                      </span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_mother_name}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-16">पूरा पता :</span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_address}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-16">तहसील :</span>
                      <span className="w-20 border-b border-dotted border-black text-xs">
                        {displayData.groom_tehsil}
                      </span>
                      <span className="text-xs w-12 ml-2">जिला :</span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_district}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-16">राज्य :</span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_state}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-20">मोबाइल नंबर :</span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_mobile}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">
                        प्रथम नाम प्राप्ति तिथि :
                      </span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_first_initiation_date}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">
                        सतनाम प्राप्ति तिथि :
                      </span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_spiritual_initiation_date}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">
                        सारनाम प्राप्ति तिथि :
                      </span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_saar_naam_date}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-xs w-24">
                        सारशब्द प्राप्ति तिथि :
                      </span>
                      <span className="flex-1 border-b border-dotted border-black text-xs">
                        {displayData.groom_saar_shabd_date}
                      </span>
                    </div>

                    <div className="flex justify-end mt-4">
                      <div className="border border-black w-20 h-24 flex items-center justify-center bg-gray-50">
                        <span className="text-xs text-center">
                          1 महीने से ज्यादा पुराना फोटो न लगाएं
                        </span>
                      </div>
                    </div>

                    <div className="text-center mt-2">
                      <span className="text-xs">लड़के का फोटो</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bride Details */}
              <div className="border border-black">
                <h3 className="text-base font-bold text-center bg-gray-200 py-1 border-b border-black">
                  लड़की के परिवार की जानकारी
                </h3>
                <div className="space-y-2 p-2">
                  <div className="flex">
                    <span className="text-xs w-24">लड़की का नाम :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_full_name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">लड़की की जन्मतिथि :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_birth_date}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">लड़की के पिता का नाम :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_father_name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">लड़की की माता का नाम :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_mother_name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-16">पूरा पता :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_address}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-16">तहसील :</span>
                    <span className="w-20 border-b border-dotted border-black text-xs">
                      {displayData.bride_tehsil}
                    </span>
                    <span className="text-xs w-12 ml-2">जिला :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_district}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-16">राज्य :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_state}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-20">मोबाइल नंबर :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_mobile}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">
                      प्रथम नाम प्राप्ति तिथि :
                    </span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_first_initiation_date}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">सतनाम प्राप्ति तिथि :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_spiritual_initiation_date}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">सारनाम प्राप्ति तिथि :</span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_saar_naam_date}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-xs w-24">
                      सारशब्द प्राप्ति तिथि :
                    </span>
                    <span className="flex-1 border-b border-dotted border-black text-xs">
                      {displayData.bride_saar_shabd_date}
                    </span>
                  </div>

                  <div className="flex justify-end mt-4">
                    <div className="border border-black w-20 h-24 flex items-center justify-center bg-gray-50">
                      <span className="text-xs text-center">
                        1 महीने से ज्यादा पुराना फोटो न लगाएं
                      </span>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <span className="text-xs">लड़की का फोटो</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="mt-6">
            <p className="text-sm text-justify leading-relaxed mb-4">
              हम दोनों परिवार पूर्ण सहमति से अपने बच्चों का पवित्र विवाह (रमैणी)
              कर रहे हैं। हम यह घोषणा करते हैं कि वर और वधू{" "}
              <strong>भारतीय विवाह अधिनियम, 1955</strong> के अंतर्गत निर्धारित
              आयु सीमा को पूर्ण करते हैं तथा इस विवाह/रमैणी के लिए सभी आवश्यक
              कानूनी औपचारिकाओं का पालन किया गया है।
            </p>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <p className="text-xs">
                  • क्या आपके पुत्र/पुत्री की आयु (
                  <strong>लड़का 18 वर्ष, लड़की 21 वर्ष</strong>) सरकार के नियमों
                  के अनुसार पूर्ण हो चुकी है? ☐ हाँ ☐ नहीं
                </p>
                <p className="text-xs">
                  • क्या दोनों पक्षों ने अपने क्षेत्र, गोत्र आदि का ध्यान रखकर
                  पुष्ट विवाह (रमैणी) करने का निर्णय लिया है? ☐ हाँ ☐ नहीं
                </p>
                <p className="text-xs">
                  • क्या आप सतलोक आश्रम के अंतर्गत होने वाले रमैणी विवाह के
                  नियमों से सहमत हैं? ☐ हाँ ☐ नहीं
                </p>
                <p className="text-xs">
                  • क्या लड़का पहले से विवाहित है? ☐ हाँ ☐ नहीं, क्या लड़की पहले
                  से विवाहित है? ☐ हाँ ☐ नहीं
                </p>
              </div>
              <div>
                <p className="text-xs mb-4">
                  <strong>
                    (अगर हाँ तो तलाक के प्रमाण फार्म के साथ लगाना अनिवार्य है,
                    अन्यथा रमैणी नहीं करवाई जाएगी)
                  </strong>
                </p>

                <div className="mt-6">
                  <p className="text-xs mb-2">
                    हम अपने बच्चों (उपरोक्त दी गई जानकारी के साथ सहमत हैं):
                  </p>
                  <p className="text-xs mb-2 border-b border-dotted border-black">
                    ................................ में करना चाहते हैं।
                  </p>

                  <div className="text-center space-y-2 mt-4">
                    <p className="text-xs font-bold">
                      स्थान: नामदान केन्द्र/आश्रम
                    </p>
                    <p className="border-b border-dotted border-black">
                      ................................
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="text-center">
              <p className="text-xs font-bold mb-2">लड़के (वर) के हस्ताक्षर</p>
              <div className="border border-black h-16 mb-2"></div>
              <p className="text-xs border-b border-dotted border-black">
                ................................
              </p>
              <p className="text-xs mt-1">मोबाइल नंबर :</p>
              <p className="text-xs">लड़के से रिश्ता :</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold mb-2">लड़की (वधू) के हस्ताक्षर</p>
              <div className="border border-black h-16 mb-2"></div>
              <p className="text-xs border-b border-dotted border-black">
                ................................
              </p>
              <p className="text-xs mt-1">मोबाइल नंबर :</p>
              <p className="text-xs">लड़की से रिश्ता :</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border border-black p-3 mt-6">
            <p className="text-xs text-center leading-tight">
              <strong>नोट:</strong> लड़का व लड़की और माता-पिता का आधार कार्ड,
              नामदीक्षा फॉर्म की फोटो कॉपी, 10वीं मार्कशीट की 1-1 फोटो फॉर्म के
              साथ लगाना अनिवार्य है। रमैणी के समय लड़के और लड़की के परिवार की
              उपस्थिति अनिवार्य है, अन्यथा रमैणी नहीं करवाई जाएगी।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8 print:hidden">
            <Button
              type="button"
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RamainiForm;
