import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import TextInput from "@/components/input/TextInput";
import * as Yup from "yup";
import Button from "@/components/Button";
import Modal from "@/components/modal/Modal";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import apiClient from "@/http/index";
import {
  IChannel,
  setChannels,
  addChannel as addChannelStore,
  updateChannel,
} from "@/redux/features/channelSlice";
import { NextApplicationPage } from "@/shared/interfaces/app";

const ChannelForm = ({
  item,
  setShowEditModal,
}: {
  item?: IChannel;
  setShowEditModal?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useAppDispatch();
  const { channels } = useAppSelector((state) => state.channels);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormikProps<{ name: string }>>(null);

  const isChannelExists = channels.some(
    ({ name }) => name === formRef.current?.values.name,
  );

  const schema = Yup.object({
    name: Yup.string()
      .required("Channel Name is required")
      .test("test-existing", "Channel already exists", (v) =>
        channels.some(({ name }) => name !== v),
      ),
  });

  const addChannel = async (values: FormikValues) => {
    setLoading(true);
    try {
      // TODO: add get endpoint for channels and in response `channel` field must have new channel item
      const { data } = await apiClient.post("satsang_channel_list", values);
      dispatch(addChannelStore(data.channel));
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
      // TODO: add get endpoint for channels and in response `channel` field must have the update channel item
      const { data } = await apiClient.put(
        `satsang_channel/${item!.id}`,
        values,
      );
      dispatch(updateChannel(data.channel));
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
            label="Channel Name"
            placeholder="Enter Channel name"
          />
          <Button
            loading={loading}
            className="w-full disabled:bg-gray-300 disabled:text-gray-600"
            type="submit"
            disabled={
              item ? item?.name === values.name : (isChannelExists ?? false)
            }
          >
            {item ? "Save Changes" : "Add Channel"}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

const ChannelItem = ({ item }: { item: IChannel }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  return (
    <div className="px-2 py-1.5 rounded-md border border-gray-700 flex items-center justify-between w-full">
      <div className="flex-1 overflow-hidden text-ellipsis pr-4">
        {item.name}
      </div>
      <button
        onClick={() => setShowEditModal(true)}
        className="font-medium font-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md"
      >
        Edit
      </button>
      <button
        onClick={() => {}}
        className="font-medium font-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md"
      >
        Remove
      </button>
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={() => {}}
        withCloseHandler={false}
      >
        <div className="space-y-8 mb-8">
          <ChannelForm item={item} setShowEditModal={setShowEditModal} />
        </div>
      </Modal>
    </div>
  );
};

const ChannelPage: NextApplicationPage = () => {
  const dispatch = useAppDispatch();
  const { channels } = useAppSelector((state) => state.channels);

  const getChannels = async () => {
    try {
      // TODO: add get endpoint for channels and in response data field must have list of channels
      const { data } = await apiClient.get("satsang_channel_list");
      dispatch(setChannels(data.data));
    } catch (err) {
      console.error(err);
    }
  };

  const sortedChannels = useMemo(
    () =>
      [...channels].sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      }),
    [channels],
  );

  useEffect(() => {
    getChannels();
  }, []);

  return (
    <Layout headerProps={{ isBack: true, heading: `Manage Channel` }}>
      <div className="p-4 w-full max-w-sm items-center mx-auto">
        <ChannelForm />
        <h3 className="mt-4 mb-2 font-bold text-gray-900">
          Available Channels
        </h3>
        <div className="flex flex-col items-center space-y-3">
          {[...sortedChannels].map((item) => (
            <ChannelItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ChannelPage;
