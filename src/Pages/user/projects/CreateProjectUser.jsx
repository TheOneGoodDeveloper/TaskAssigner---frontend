import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createProject } from "@/API/admin/projects/project_api";
import { getAllEmployeeOwnerShip } from "@/API/admin/adminDashborad";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { PlusIcon } from "lucide-react";

const CreateProjectUser = () => {
  const [formData, setFormData] = useState({
    project_name: "",
    project_description: "",
    project_ownership: "",
    project_status: "Not Started",
    start_date: "",
    end_date: "",
    estimated_hours: "",
    milestones: [], // Add milestones to formData
  });

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [ownershipOptions, setOwnershipOptions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const mutations = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      setFormData({
        project_name: "",
        project_description: "",
        project_ownership: "",
        project_status: "Not Started",
        start_date: "",
        end_date: "",
        estimated_hours: "",
        milestones: [], // Reset milestones in formData
      });
      setIsOpen(false);
      toast.success("Project Created Successfully");
    },
    onError: (err) => {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            toast.error(err.response.data.message || "Bad Request.");
            break;
          case 403:
            toast.error(
              err.response.data.message || "Forbidden: Access denied."
            );
            break;
          case 500:
            toast.error(err.response.data.message || "Server error occurred.");
            break;
          default:
            toast.error("An unexpected error occurred. Please try again.");
        }
      } else {
        toast.error(
          err.message || "Network error. Please check your connection."
        );
      }
      console.error("Error creating project:", err);
    },
  });

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: getAllEmployeeOwnerShip,
    enabled: isOpen, // Only fetch when the dialog is open
  });

  // console.log(formData);
  // Map user data into dropdown options when data is available
  useEffect(() => {
    if (userData) {
      const options = [
        // ...userData.teamLeads
        //   .filter((lead) => lead.admin_verify === "true") // Check admin_verify for team leads
        //   .map((lead) => ({
        //     id: lead.id,
        //     name: `Team Lead - ${lead.name}`,
        //   })),

        ...userData.managers
          .filter((manager) => manager.admin_verify === "true") // Check admin_verify for managers
          .map((manager) => ({
            id: manager.id,
            name: `Manager - ${manager.name}`,
          })),
      ];
      setOwnershipOptions(options);
    }
  }, [userData]);

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    mutations.mutate(formData);
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim() !== "") {
      setMilestones([...milestones, newMilestone]);
      setFormData((prevData) => ({
        ...prevData,
        milestones: [...prevData.milestones, newMilestone],
      }));
      setNewMilestone("");
      setShowMilestoneInput(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-fit">
        Create New Project
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-6 max-w-lg text-taskBlack  h-96 overflow-scroll">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create Project
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Fill in the details below to create a new Project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Details</h3>
              <div>
                <Input
                  id="project_name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={(e) =>
                    handleSelectChange("project_name", e.target.value)
                  }
                  required
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Textarea
                  id="project_description"
                  name="project_description"
                  value={formData.project_description}
                  onChange={(e) =>
                    handleSelectChange("project_description", e.target.value)
                  }
                  required
                  placeholder="Enter project description"
                  className="outline-none border-none focus:ring-0 focus:ring-offset-0 "
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ownership</h3>
              <div>
                <Select
                  id="project_ownership"
                  name="project_ownership"
                  value={formData.project_ownership}
                  onValueChange={(value) =>
                    setFormData({ ...formData, project_ownership: value })
                  }
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <SelectTrigger className="outline-none focus:ring-0 focus:ring-offset-0 ">
                    <SelectValue placeholder="Select project ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a Ownership</SelectLabel>
                      {ownershipOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">MileStone</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowMilestoneInput(true)}
                  className="p-2"
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
                {showMilestoneInput && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Enter milestone"
                      className="w-full"
                    />
                    <Button onClick={handleAddMilestone} className="p-2">
                      Add
                    </Button>
                  </div>
                )}
              </div>
              <ul className="mt-2">
                {milestones.map((milestone, index) => (
                  <li key={index} className="list-disc ml-4">
                    {milestone}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dates</h3>
              <div className="flex items-center justify-between gap-6">
                <div className="w-full cursor-pointer">
                  <Label htmlFor="start_date">Start Date</Label>
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
                    required
                  />
                </div>
                <div className="w-full cursor-pointer">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    onClick={() => endDateRef.current.showPicker()}
                    ref={endDateRef}
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      handleSelectChange("end_date", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimated_hours">Estimated Hour</Label>
                <Input
                  id="estimated_hours"
                  name="estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) =>
                    handleSelectChange(
                      "estimated_hours",
                      Number(e.target.value)
                    )
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default CreateProjectUser;
