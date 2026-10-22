import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import Modal from "@/components/modal/Modal";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Form, Formik } from "formik";
import { GetStaticPaths } from "next";
import { useRouter } from "next/router";
import React, { useCallback, useMemo, useState } from "react";

type Level = "country" | "state" | "district" | "tehsil";
const allLocs: Array<Level> = ["country", "state", "tehsil", "district"];

const LocationLevel: NextApplicationPage = () => {
  const router = useRouter();

  const level = router?.query?.level as Level;

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          level && allLocs.includes(level)
            ? `Manage ${level}`
            : "Manage Locations",
      }}
    >
      <div className="h-full w-full p-4">
        {!level || !allLocs.includes(level) ? null : (
          <LocationComponent level={level} />
        )}
      </div>
    </Layout>
  );
};

type Location = {
  id: number;
  name: string;
  [k: string]: any;
};

const LocationComponent = ({ level }: { level: Level }) => {
  const [locations, setLocations] = useState<Array<Location>>([]);
  const [selectedLocation, setSelectedLocation] = useState<
    Location | undefined
  >(undefined);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const index = allLocs.findIndex((a) => a === level);

  const getLocations = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`${level}`);
      setLocations(data.data);
    } catch (error) {
      console.error(error);
    }
  }, [level]);
  return (
    <div className="w-full h-full">
      {index > 0 && (
        <Formik initialValues={{}} onSubmit={(v) => console.log(v)}>
          {({ values, setFieldValue }) => (
            <Form>
              <UserwiseDropdown
                useHirarchy={false}
                conditionalFields={{
                  country_id: index > 0,
                  state_id: index > 1,
                  district_id: index > 2,
                  tehsil_id: index > 3,
                }}
              />
            </Form>
          )}
        </Formik>
      )}
      <div className="w-full max-h-screen overflow-x-scroll">
        <table className="w-full">
          <thead
            style={{ zIndex: 1 }}
            className="w-full sticky top-0 bg-black text-white"
          >
            <tr>
              <th>Sn</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location, index) => (
              <tr key={location.id}>
                <td>{index + 1}</td>
                <td>{location.name}</td>
                <td>
                  <div className="flex space-x-2">
                    <button type="button">E</button>
                    <button type="button">D</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedLocation && <EditModal location={selectedLocation} />}
    </div>
  );
};

const EditModal = ({ location }: { location: Location }) => {
  const [show, setShow] = useState(!!location);
  return (
    <Modal show={show} onClose={() => setShow(false)} onConfirm={() => {}}>
      <div className="my-8 space-y-8">
        <Formik
          initialValues={{ name: location.name }}
          onSubmit={(v) => console.log(v)}
        >
          {({ values, setFieldValue }) => (
            <TextInput
              name="name"
              value={values.name}
              onChange={(e) => setFieldValue("name", e.target.value)}
            />
          )}
        </Formik>
      </div>
    </Modal>
  );
};

LocationLevel.requireAuth = true;

export default LocationLevel;
