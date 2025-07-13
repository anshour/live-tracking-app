import React from "react";
import { Modal, Button, Input } from "../ui";
import { useTrackerData } from "~/context";
import { TrackingEvents } from "@livetracking/shared";
import toast from "react-hot-toast";

interface ConnectTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectTrackerModal: React.FC<ConnectTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { socket } = useTrackerData();
  const [formData, setFormData] = React.useState({
    accessCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socket?.emit(
      TrackingEvents.TRACKER_SUBSCRIBE_BY_ACCESS_CODE,
      formData,
      (res: any) => {
        if (res.status === "success") {
          toast.success("Connected to tracker successfully");
          setFormData({ accessCode: "" });
          onClose();
        } else {
          toast.error("Invalid access code");
        }
      }
    );
  };

  const handleClose = () => {
    setFormData({ accessCode: "" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connect Tracker">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="trackerName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Access Code
          </label>
          <Input
            id="accessCode"
            name="accessCode"
            type="text"
            placeholder="Enter access code"
            value={formData.accessCode}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Connect</Button>
        </div>
      </form>
    </Modal>
  );
};
