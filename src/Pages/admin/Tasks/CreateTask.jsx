import { getAllProjectList } from "@/API/admin/projects/project_api";
import { Button } from "@/components/ui/button"; // Custom button component
import { Input } from "@/components/ui/input"; // Custom input component
import { Textarea } from "@/components/ui/textarea"; // Custom textarea component
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Combobox } from "@/components/customUi/Handle";
import Modal from "@/components/customUi/Modal";
// import { Label } from "@/components/ui/label";
import Selector from "@/components/customUi/Selector";
import { getEmpMails } from "@/API/admin/userverify/userVerify";
import { getAllEmployeeOwnerShip } from "@/API/admin/adminDashborad";
import { createTask } from "@/API/admin/task/task_api";
import { toast, ToastContainer } from "react-toastify";
import { getMilestonesForProject } from "@/API/admin/milestone/milestone";
import { VscLoading } from "react-icons/vsc";
import { priorityOptions } from "@/utils/prorityOptions";
const CreateTask = () => {
  const [formData, setFormData] = useState({
    project: null,
    milestone: "",
    task_title: "",
    task_description: "",
    assigned_to: "",
    assigned_by: "",
    report_to: "",
    status: "Not started",
    priority: "",
    start_date: "",
    end_date: "",
  });
  // console.log(formData);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // Step 1: Project selection, Step 2: Task details
  const [isOpen, setIsOpen] = useState(false);
  const [ownershipOptions, setOwnershipOptions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [milestonesError, setMilestoneError] = useState("");

  console.log(milestones);

  const {
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
    data: projectlist = [],
  } = useQuery({
    queryKey: ["projectsList"],
    queryFn: getAllProjectList,
    enabled: isOpen,
  });

  // console.log(projectlist);

  const {
    isError: isUserListError,
    isLoading: isUserListLoading,
    error: UserListError,
    data: userList = [],
  } = useQuery({
    queryKey: ["userList"],
    queryFn: getEmpMails,
    enabled: isOpen,
  });

  const {
    data: userData,
    isLoading: isUserDataLoading,
    isError: isUserDataError,
    error: UserDataError,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: getAllEmployeeOwnerShip,
    enabled: isOpen, // Only fetch when the dialog is open
  });

  // console.log(userList);
  // Map user data into dropdown options when data is available
  useEffect(() => {
    if (userData) {
      const options = [
        // ...userData.teamLeads
        //   .filter((lead) => lead.admin_verify === "true") // Check admin_verify for team leads
        //   .map((lead) => ({
        //     value: lead.id,
        //     label: `Team Lead - ${lead.name}`,
        //   })),

        ...userData.managers
          .filter(
            (manager) =>
              manager.admin_verify === true && manager.hr_approval === true
          ) // Check admin_verify for managers
          .map((manager) => ({
            value: manager.id,
            label: `Manager - ${manager.name}`,
          })),
      ];
      // console.log(options);
      setOwnershipOptions(options);
    }
  }, [userData]);

  const taskmutations = useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      // Invalidate the query to refresh the task list elsewhere if necessary
      queryClient.invalidateQueries(["tasks"]);

      // Reset the form data, keeping the modal open
      setFormData({
        project: null,
        milestone: "",
        task_title: "",
        task_description: "",
        assigned_to: "",
        assigned_by: "",
        report_to: "",
        status: "Not Started",
        priority: "",
        start_date: "",
        end_date: "",
      });

      // Optionally, refresh other state variables
      setMilestones([]); // Clear milestones if needed
      setOwnershipOptions([]); // Reset ownership options

      // Keep the modal open and reset the step to 1 (Project Selection)
      setIsOpen(false);
      setStep(1);
      toast.success(data?.message || "Task created successfully!");
    },
    onError: (err) => {
      // Handle errors and display a toast message
      toast.error(
        err.response.data.message ||
          "An error occurred while creating the task."
      );
    },
  });

  // console.log(userList);
  // console.log(ownershipOptions);
  // console.log(userList);

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const sendProjectId = async (projectId) => {
    try {
      const response = await getMilestonesForProject(projectId);
      setMilestones(response);
    } catch (error) {
      console.error("Error sending project ID:", error);
    }
  };

  const handleSumbit = async (e) => {
    e.preventDefault();
    taskmutations.mutate(formData);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className="w-fit">
        Create Task
      </Button>

      {/* Main Form */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Task"
      >
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to create a new task.
        </p>

        {/* Step 1: Select Project */}
        {step === 1 && (
          <>
            {isProjectError ? (
              <>
                <p>isProjectError Fetch {projectError.message}</p>
              </>
            ) : isProjectLoading ? (
              <>
                <p className="animate-spin fixed">
                  <VscLoading />
                </p>
              </>
            ) : (
              <>
                <Combobox
                  items={projectlist} // Array of projects
                  value={formData.project} // Controlled state
                  onChange={(value) => {
                    setFormData((prevData) => ({
                      ...prevData,
                      project: value, // Update the project value in the form data
                    }));
                    sendProjectId(value); // Send the project ID to the API
                    setStep(2); // Move to the next step
                  }}
                  placeholder="Select a project..."
                />
              </>
            )}
          </>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-2">
            <Selector
              label="Milestone"
              id="milestone"
              value={formData.milestone}
              onChange={(e) => {
                const selectedMilestone = e.target.value;
                handleSelectChange("milestone", selectedMilestone);

                if (selectedMilestone) {
                  setMilestoneError("");
                }
              }}
              options={milestones.map((milestone) => ({
                value: milestone._id,
                label: milestone.name,
              }))}
              required={true}
            />
            {milestonesError && (
              <div className="text-sm text-red-500">{milestonesError}</div>
            )}
            <div className="flex gap-x-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (!formData.milestone) {
                    setMilestoneError(
                      "Please select a milestone before proceeding."
                    );
                    return;
                  }
                  setStep(3);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex flex-col gap-4">
              {isUserListError ? (
                <>
                  <p>UserList Error {UserListError.message}</p>
                </>
              ) : isUserListLoading ? (
                <>
                  <p className="animate-spin fixed">
                    <VscLoading />
                  </p>
                </>
              ) : (
                <>
                  <Combobox
                    items={userList} // Array of projects
                    value={formData.assigned_to} // Controlled state
                    onChange={(value) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        assigned_to: value, // Update the project value in the form data
                      }));
                    }}
                    placeholder="Assigned to"
                  />
                </>
              )}
              {isUserDataError ? (
                <>
                  <p>userData Fetch Err {UserDataError.message}</p>
                </>
              ) : isUserDataLoading ? (
                <>
                  <p className="animate-spin fixed">
                    <VscLoading />
                  </p>
                </>
              ) : (
                <>
                  <Combobox
                    items={ownershipOptions} // Array of projects
                    value={formData.report_to} // Controlled state
                    onChange={(value) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        report_to: value, // Update the project value in the form data
                      }));
                      setStep(3); // Move to the next step
                    }}
                    placeholder="Report to"
                  />
                </>
              )}
              <div className="flex gap-x-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>Next</Button>
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Task Details */}
        {step === 4 && (
          <form onSubmit={handleSumbit} className="space-y-6">
            <div>
              <label
                htmlFor="task_title"
                className="block text-sm font-medium text-gray-700"
              >
                Task Title
              </label>
              <Input
                id="task_title"
                name="task_title"
                value={formData.task_title}
                onChange={(e) =>
                  handleSelectChange("task_title", e.target.value)
                }
                required
                className="mt-2 p-2 border rounded-md w-full"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label
                htmlFor="task_description"
                className="block text-sm font-medium text-gray-700"
              >
                Task Description
              </label>
              <Textarea
                id="task_description"
                name="task_description"
                value={formData.task_description}
                onChange={(e) =>
                  handleSelectChange("task_description", e.target.value)
                }
                required
                className="mt-2 p-2 border rounded-md w-full"
                placeholder="Enter task description"
              />
            </div>

            <div className="flex items-center gap-5">
              {/* <label
                      htmlFor="start_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label> */}
              <Input
                onClick={() => startDateRef.current.showPicker()}
                ref={startDateRef}
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  handleSelectChange("start_date", e.target.value)
                }
                className="mt-2 p-2 border rounded-md"
              />

              <span>To</span>
              <Input
                onClick={() => endDateRef.current.showPicker()}
                ref={endDateRef}
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleSelectChange("end_date", e.target.value)}
                className="mt-2 p-2 border rounded-md"
              />
            </div>

            <div>
              <Selector
                label="Priority"
                id="priority"
                value={formData.priority}
                onChange={(e) => handleSelectChange("priority", e.target.value)}
                options={priorityOptions}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                onClick={() => setStep(3)}
                variant="outline"
              >
                Back
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        )}
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default CreateTask;
