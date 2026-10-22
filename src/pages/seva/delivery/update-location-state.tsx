import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { FaQuestionCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { capitalizeWords } from "@/shared/functions/utils";

export const LocationStatus = ({
  status = true,
  onClick = () => {},
}: {
  status: boolean;
  onClick: (e: any) => void;
}) => {
  if (!status) {
    return (
      <button
        onClick={onClick}
        className="z-10 p-1 px-4 rounded-lg text-white font-bold bg-gray-500"
      >
        On Hold
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="z-10 p-2 px-4 rounded-lg text-white font-bold bg-green-600"
    >
      Active
    </button>
  );
};

export const LocationCard = ({
  name,
  status,
  onClick,
  toggleStatus,
}: {
  name: string;
  status: boolean;
  toggleStatus: (e: any) => void;
  onClick?: (e?: any) => void;
}) => {
  return (
    <div className="z-0 flex space-x-2 items-center bg-white border border-gray-200 justify-between rounded-lg shadow-lg p-2 px-3">
      <p onClick={onClick} className="capitalize flex-1">
        {name} <span></span>
      </p>
      <LocationStatus status={status} onClick={toggleStatus} />
    </div>
  );
};

const UpdateLocation = () => {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<{
    status: boolean;
    id: number;
    name: string;
  }>({ status: false, id: 0, name: "" });
  const getStates = useCallback(async (country_id = 2) => {
    try {
      const { data } = await apiClient.get("states", {
        params: { country_id },
      });

      setLocations(data.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const toggleStatus = async () => {
    try {
      const response = await apiClient.put("hold_seva", {
        seva: "delivery",
        hold: locationStatus.status ? 1 : 0,
        state_id: locationStatus.id,
      });
      getStates();
      toast.success(response.data?.message);
    } catch (error: any) {
      toast.error(error.data?.error);
    }
    closeModal();
  };
  const closeModal = () => {
    setShow(false);
  };
  useEffect(() => {
    if (router.isReady) {
      getStates();
    }
  }, [router.isReady]);
  return (
    <Layout headerProps={{ isBack: true, heading: "Update Location Status" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <p className="font-bold text-gray-900 text-center text-lg">States</p>
        {locations.map((location, index) => (
          <LocationCard
            toggleStatus={() => {
              setLocationStatus({
                status: !location.hold_delivery_seva,
                id: +location?.id,
                name: location?.name,
              });
              setShow(true);
            }}
            onClick={() =>
              router.push(
                `/seva/delivery/update-location-district?state_id=${location.id}`
              )
            }
            key={index}
            name={location?.name}
            status={location?.hold_delivery_seva}
          />
        ))}
        <Modal
          show={show}
          onClose={closeModal}
          onConfirm={() => toggleStatus()}
        >
          <div className="space-y-8 mb-8 text-center">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl capitalize">
              Are you sure to {locationStatus.status ? "hold" : "active"} seva
              for State {capitalizeWords(locationStatus.name)}?
            </p>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default UpdateLocation;
