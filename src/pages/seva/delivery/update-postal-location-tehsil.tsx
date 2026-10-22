import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { LocationCard } from "./update-location-state";
import Modal from "@/components/modal/Modal";
import { FaQuestionCircle } from "react-icons/fa";
import { capitalizeWords } from "@/shared/functions/utils";
import toast from "react-hot-toast";

const UpdateLocation = () => {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [district, setDistrict] = useState("");
  const [show, setShow] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<{
    status: boolean;
    id: number;
    name: string;
  }>({ status: false, id: 0, name: "" });
  const getDistrict = async (id: number) => {
    try {
      const { data } = await apiClient.get(`district/${id}`);
      setDistrict(data.data.name);
    } catch (error) {
      console.error(error);
    }
  };
  const getTehsils = useCallback(async (district_id: number) => {
    try {
      const { data } = await apiClient.get("tehsil_list", {
        params: { district_id },
      });

      setLocations(data.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const toggleStatus = async () => {
    try {
      const response = await apiClient.post("move_to_bypost", {
        active: locationStatus.status ? 1 : 0,
        tehsil_id: locationStatus.id,
      });
      getTehsils(Number(router.query.district_id));
      toast.success(response.data?.message);
    } catch (error: any) {
      toast.error(error.data?.error);
    }
    setShow(false);
  };
  useEffect(() => {
    if (router.query.district_id) {
      getTehsils(Number(router.query.district_id));
      getDistrict(Number(router.query.district_id));
    }
  }, [router.isReady]);
  return (
    <Layout
      headerProps={{ isBack: true, heading: "Update Postal Location Status" }}
    >
      <div className="p-4 space-y-4">
        <p className="font-bold text-gray-900 text-center text-lg">{`Tehsils (${district})`}</p>
        {locations.map((location, index) => (
          <LocationCard
            toggleStatus={() => {
              setLocationStatus({
                status: !location.postal_seva,
                id: +location?.id,
                name: location?.name,
              });
              setShow(true);
            }}
            key={index}
            name={location?.name}
            status={location?.postal_seva}
          />
        ))}
      </div>
      <Modal
        show={show}
        onClose={() => setShow(false)}
        onConfirm={() => toggleStatus()}
      >
        <div className="space-y-8 mb-8 text-center">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl capitalize">
            Are you sure to {locationStatus.status ? "activate" : "hold"} post
            seva for Tehsil {capitalizeWords(locationStatus.name)}?
          </p>
        </div>
      </Modal>
    </Layout>
  );
};

export default UpdateLocation;
