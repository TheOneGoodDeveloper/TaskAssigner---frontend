import { FaPen, FaRegWindowClose } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import Selector from "./Selector";
import { useQuery } from "@tanstack/react-query";
import { getEmpMails } from "@/API/admin/userverify/userVerify";
import { getAllEmployeeOwnerShip } from "@/API/admin/adminDashborad";
import { Combobox } from "./Handle";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

/* eslint-disable react/prop-types */
export const TaskDetailsModal = ({ task, onClose, onEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(task);
  const [errorMessage, setErrorMessage] = useState("");
  const [ownershipOptions, setOwnershipOptions] = useState([]);

  const EndDate = useRef(null);
  const StartDate = useRef(null);

  const {
    isError: isUserListError,
    isLoading: isUserListLoading,
    error: UserListError,
    data: userList = [],
  } = useQuery({
    queryKey: ["userList"],
    queryFn: getEmpMails,
  });

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: getAllEmployeeOwnerShip,
  });

  console.log(formData);
  console.log(userList);
  // Map user data into dropdown options when data is available
  useEffect(() => {
    if (userData) {
      const options = [
        ...userData.teamLeads
          .filter((lead) => lead.admin_verify === "true") // Check admin_verify for team leads
          .map((lead) => ({
            value: lead.id,
            label: `Team Lead - ${lead.name}`,
          })),

        ...userData.managers
          .filter((manager) => manager.admin_verify === "true") // Check admin_verify for managers
          .map((manager) => ({
            value: manager.id,
            label: `Manager - ${manager.name}`,
          })),
      ];
      setOwnershipOptions(options);
    }
  }, [userData]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  if (!task) return null;

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const renderInput = (name, label, value) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <Input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full p-2 border-b-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Regular", label: "Regular" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "In progress", label: "In Progress" },
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  if (isError) {
    return <p>Error fetching user list{error}</p>;
  }
  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isUserListError) {
    return <p>Error fetching user list{UserListError}</p>;
  }

  if (isUserListLoading) {
    return <p>Loading user list...</p>;
  }

  const handleSave = (e) => {
    e.preventDefault();
    if (JSON.stringify(formData) === JSON.stringify(task)) {
      setErrorMessage("No changes were made.");
    } else {
      setErrorMessage(""); // Clear error message
      onEdit(formData); // Submit changes if there are any
    }
  };

  return (
    <div
      id="modal-overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleOutsideClick}
    >
      <div
        className={`bg-white absolute right-4 bottom-4 overflow-scroll 2xl:w-[30rem] w-[25rem] h-[85%] rounded-sm shadow-lg transform transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-taskBlack to-bg text-white h-14 flex items-center justify-between px-6 rounded-t-sm sticky top-0 z-50">
          <h1 className="text-lg font-semibold">Task Overview</h1>
          <div className="flex gap-x-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-md hover:bg-white hover:text-indigo-600 transition-colors"
              >
                <FaPen size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-white hover:text-red-600 transition-colors"
            >
              <FaRegWindowClose size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 ">
          <h2 className="text-xl font-bold text-indigo-600 mb-2">
            {task.project?.project_name}
          </h2>

          <hr className="bg-taskBlack h-[0.1rem] border-0" />

          {isEditing ? (
            <>
              {renderInput("task_title", "Task Title", formData.task_title)}

              {renderInput(
                "task_description",
                "Task Description",
                formData.task_description
              )}

              <div className="mb-4">
                <Selector
                  label="Priority"
                  id="priority"
                  value={formData.priority}
                  onChange={(e) =>
                    handleSelectChange("priority", e.target.value)
                  }
                  options={priorityOptions}
                />
              </div>

              <div className="mb-4">
                <Selector
                  label="Status"
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                  options={statusOptions}
                />
              </div>

              <div className="mb-4">
                <Label>Start Date</Label>
                <Input
                  onClick={() => StartDate.current.showPicker()}
                  ref={StartDate}
                  id="StartDate"
                  name="StartDate"
                  type="date"
                  value={
                    formData.start_date ? formData.start_date.split("T")[0] : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <Label>End Date</Label>
                <Input
                  onClick={() => EndDate.current.showPicker()}
                  ref={EndDate}
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={
                    formData.end_date ? formData.end_date.split("T")[0] : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <Label>Assigned to</Label>
                <Combobox
                  items={userList.map((user) => ({
                    value: user._id,
                    label: user.label,
                  }))}
                  value={formData.assigned_to?._id}
                  onChange={(value) => {
                    const selectedUser = userList.find(
                      (user) => user._id === value
                    );
                    setFormData((prevData) => ({
                      ...prevData,
                      assigned_to: {
                        _id: selectedUser._id,
                        name: selectedUser.label,
                      },
                    }));
                  }}
                  placeholder="Assigned to"
                />
              </div>

              <div className="mb-4">
                <Label>Report to</Label>
                <Combobox
                  items={ownershipOptions}
                  value={formData.report_to?._id}
                  onChange={(value) => {
                    const selectedOwner = ownershipOptions.find(
                      (option) => option.value === value
                    );
                    setFormData((prevData) => ({
                      ...prevData,
                      report_to: {
                        _id: selectedOwner.value,
                        name: selectedOwner.label.split(" - ")[1],
                      },
                    }));
                  }}
                  placeholder="Report to"
                />
              </div>

              <Button onClick={handleSave} className="mb-4">
                Update Task
              </Button>
            </>
          ) : (
            <>
              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {task.task_title}
                </h3>
                <p className="text-gray-600">{task.task_description}</p>
              </div>
              <div className="space-y-2 flex flex-col">
                <p className="text-sm text-taskBlack inline-flex items-center justify-between">
                  <span className="font-medium">Priority:</span> {task.priority}
                </p>
                <p className="text-sm text-taskBlack inline-flex items-center justify-between">
                  <span className="font-medium">Timeline:</span>
                  {new Date(task.start_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(task.end_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-taskBlack inline-flex items-center justify-between">
                  <span className="font-medium">Status:</span> {task.status}
                </p>
                <p className="text-sm text-taskBlack inline-flex items-center justify-between">
                  <span className="font-medium">Assigned To:</span>{" "}
                  {task.assigned_to?.name || "No name available"}
                </p>
                <p className="text-sm text-taskBlack inline-flex items-center justify-between">
                  <span className="font-medium">Report To:</span>{" "}
                  {task.report_to?.name || "No name available"}
                </p>
              </div>
            </>
          )}
        </div>
        {errorMessage && (
          <div className="mt-4 text-red-500 text-sm text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
