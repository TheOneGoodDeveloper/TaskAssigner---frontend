import { useState, useRef, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  getLastEmployeeId,
} from "@/API/admin/userverify/userVerify";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/customUi/Modal";
import { GrClose } from "react-icons/gr";

const CreateUser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    mail: "",
    password: "",
    confirmPassword: "",
    role: "",
    admin_verify: "",
    employee_id: "",
    department: "",
    starting_date: "",
    lastWorking_date: "",
  });

  const queryClient = useQueryClient();

  // Fetch last employee ID and generate new ID on component mount

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setFormData({
        name: "",
        phone: "",
        mail: "",
        password: "",
        confirmPassword: "",
        role: "",
        admin_verify: "",
        employee_id: "",
        department: "",
        starting_date: "",
        lastWorking_date: "",
      });
      setIsOpen(false);
      toast.success("User created successfully!");
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error("Error creating user.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDepartment = async (value) => {
    setFormData((prevData) => ({
      ...prevData,
      department: value, // Set selected department
    }));

    try {
      // Fetch the last ID from the backend for the selected department
      const response = await getLastEmployeeId(value);
      const newId = response.employee_id;
      // console.log(response);

      setFormData((prevData) => ({
        ...prevData,
        employee_id: newId, // Set the generated ID
      }));
    } catch (error) {
      console.error("Error fetching last employee ID:", error);
      toast.error("Failed to generate Employee ID.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Invalid phone number.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.mail)) {
      toast.error("Invalid email address.");
      return;
    }

    mutation.mutate(formData);
  };

  const startDateRef = useRef(null);
  // const endDateRef = useRef(null);

  // Memoizing form data to avoid unnecessary re-renders
  const memoizedFormData = useMemo(() => formData, [formData]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-fit">
        Create User
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create User"
      >
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white p-8 rounded-lg shadow-lg w-96 max-h-[70%] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold">Create User</h2>
                <GrClose
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer text-xl hover:text-red-600 transition-all"
                />
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Fill in the details below to create a new User.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                <Input
                  type="text"
                  name="name"
                  value={memoizedFormData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Input
                  type="text"
                  name="phone"
                  value={memoizedFormData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  required
                  className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Input
                  type="email"
                  name="mail"
                  value={memoizedFormData.mail}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Input
                  type="password"
                  name="password"
                  value={memoizedFormData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  value={memoizedFormData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Select
                  onValueChange={(value) => handleDepartment(value)}
                  value={memoizedFormData.department}
                  required
                  // className="focus:outline-none border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="human-resource">
                        Human Resource
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  value={memoizedFormData.role}
                  required
                  className="focus:outline-none border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="team lead">Team Leader</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  name="employee_id"
                  value={memoizedFormData.employee_id}
                  readOnly
                  placeholder="Employee ID"
                  className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, admin_verify: value })
                  }
                  value={memoizedFormData.admin_verify}
                  required
                  className="focus:outline-none border-2 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Verify User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Admin Verify</SelectLabel>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-4">
                  <Input
                    ref={startDateRef}
                    type="date"
                    name="starting_date"
                    value={memoizedFormData.starting_date}
                    onChange={handleChange}
                    placeholder="Starting Date"
                    required
                    className="border-2 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-all"
                >
                  Create User
                </Button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer />
    </>
  );
};

export default CreateUser;
